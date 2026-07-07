"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyContractor } from "@/lib/notify";
import { brand } from "@/lib/brand";
import {
  computeDaySlots,
  weekDates,
  toDateISO,
  type DaySlots,
  type TimeRange,
} from "@/lib/booking/slots";

export type BookingState = { error?: string };

const schema = z.object({
  contractor_id: z.string().uuid(),
  service_id: z.string().uuid(),
  scheduled_start: z.string().min(1, "Pick a date and time"),
  duration_mins: z.coerce.number().int().positive().default(120),
  address_id: z.string().uuid().optional().or(z.literal("")),
  line1: z.string().trim().min(3, "Enter a street address"),
  line2: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().min(2, "Enter a city"),
  state: z.string().trim().min(2, "Enter a state"),
  zip: z.string().trim().min(3, "Enter a ZIP"),
  job_notes: z.string().trim().optional().or(z.literal("")),
  quoted_price: z.coerce.number().nonnegative().optional(),
  save_address: z.string().optional(),
});

const slotsSchema = z.object({
  contractor_id: z.string().uuid(),
  week_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  duration_mins: z.coerce.number().int().min(15).max(12 * 60),
});

export type WeekSlotsResult = { days: DaySlots[] } | { error: string };

/**
 * Bookable slots for one contractor over the 7 days starting at week_start.
 * Client-side filtering is UX only — the real guard is the
 * bookings_no_double_booking exclusion constraint (migration 08), enforced
 * again on submit in createBooking.
 */
export async function getWeekSlots(input: {
  contractor_id: string;
  week_start: string;
  duration_mins: number;
}): Promise<WeekSlotsResult> {
  const parsed = slotsSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid slot query" };
  const { contractor_id, week_start, duration_mins } = parsed.data;

  // Bound the window: no further than ~8 weeks out.
  const start = new Date(`${week_start}T12:00:00`);
  if (Number.isNaN(start.getTime())) return { error: "Invalid week" };
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 56);
  if (start > horizon) return { error: "That week is too far ahead to book" };

  const dates = weekDates(week_start);
  const rangeStart = new Date(`${dates[0]}T00:00:00`);
  const rangeEnd = new Date(`${dates[6]}T23:59:59`);

  const supabase = await createClient();
  const admin = createAdminClient();
  const [{ data: windows }, { data: blocks }, { data: booked }] =
    await Promise.all([
      supabase
        .from("availability")
        .select("day_of_week, start_time, end_time")
        .eq("contractor_id", contractor_id),
      supabase
        .from("availability_blocks")
        .select("start_datetime, end_datetime")
        .eq("contractor_id", contractor_id)
        .lt("start_datetime", rangeEnd.toISOString())
        .gt("end_datetime", rangeStart.toISOString()),
      // Other customers' bookings are RLS-hidden; read the time ranges with
      // the service-role client and expose only slot statuses, never rows.
      admin
        .from("bookings")
        .select("scheduled_start, scheduled_end")
        .eq("contractor_id", contractor_id)
        .in("status", ["requested", "accepted", "scheduled", "in_progress"])
        .is("deleted_at", null)
        .not("scheduled_start", "is", null)
        .lt("scheduled_start", rangeEnd.toISOString())
        .gt("scheduled_end", rangeStart.toISOString()),
    ]);

  const toRanges = (
    rows: { start: string | null; end: string | null }[],
  ): TimeRange[] =>
    rows.flatMap((r) =>
      r.start && r.end ? [{ start: new Date(r.start), end: new Date(r.end) }] : [],
    );
  const blockRanges = toRanges(
    (blocks ?? []).map((b) => ({ start: b.start_datetime, end: b.end_datetime })),
  );
  const bookedRanges = toRanges(
    (booked ?? []).map((b) => ({ start: b.scheduled_start, end: b.scheduled_end })),
  );

  const now = new Date();
  const todayISO = toDateISO(now);
  const days = dates.map((dateISO) =>
    dateISO < todayISO
      ? { dateISO, hasWindows: false, slots: [] }
      : computeDaySlots({
          dateISO,
          windows: windows ?? [],
          blocks: blockRanges,
          booked: bookedRanges,
          durationMins: duration_mins,
          now,
        }),
  );
  return { days };
}

export async function createBooking(
  _prev: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please complete the form" };
  }
  const d = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/book");

  const start = new Date(d.scheduled_start);
  if (Number.isNaN(start.getTime())) return { error: "That date and time looks off." };
  const end = new Date(start.getTime() + d.duration_mins * 60_000);

  const quoted = d.quoted_price && d.quoted_price > 0 ? d.quoted_price : null;
  const platformFee = quoted ? Math.round(quoted * brand.platformFeeRate * 100) / 100 : null;
  const payout = quoted && platformFee != null ? Math.round((quoted - platformFee) * 100) / 100 : null;

  // Optionally persist a new address to the customer's address book.
  let addressId = d.address_id || null;
  if (!addressId && d.save_address === "on") {
    const { data: addr } = await supabase
      .from("customer_addresses")
      .insert({
        customer_id: user.id,
        label: "Home",
        line1: d.line1,
        line2: d.line2 || null,
        city: d.city,
        state: d.state,
        zip: d.zip,
      })
      .select("id")
      .single();
    addressId = (addr as { id: string } | null)?.id ?? null;
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      customer_id: user.id,
      contractor_id: d.contractor_id,
      service_id: d.service_id,
      status: "requested",
      scheduled_start: start.toISOString(),
      scheduled_end: end.toISOString(),
      address_id: addressId,
      address_line1: d.line1,
      address_line2: d.line2 || null,
      city: d.city,
      state: d.state,
      zip: d.zip,
      job_notes: d.job_notes || null,
      quoted_price: quoted,
      platform_fee: platformFee,
      contractor_payout: payout,
      currency: "usd",
    })
    .select("id")
    .single();

  if (error || !booking) {
    // 23P01 = exclusion_violation from bookings_no_double_booking (migration 08):
    // another active booking for this pro overlaps the requested window.
    if (error?.code === "23P01") {
      return {
        error:
          "That time slot was just taken for this pro — please pick another time.",
      };
    }
    return { error: "We couldn't place that booking. Please try again." };
  }

  const bookingId = (booking as { id: string }).id;
  await notifyContractor(d.contractor_id, {
    type: "booking_requested",
    title: "New booking request 🐾",
    body: "A customer just requested a job — accept or decline.",
    link: `/den/jobs/${bookingId}`,
  });

  revalidatePath("/base-camp/bookings");
  redirect(`/base-camp/bookings/${bookingId}?new=1`);
}
