"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { notifyContractor } from "@/lib/notify";
import { brand } from "@/lib/brand";

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
