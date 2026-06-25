"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { notifyContractor } from "@/lib/notify";

export type ReviewState = { error?: string; ok?: boolean };

const reviewSchema = z.object({
  booking_id: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional().or(z.literal("")),
});

function displayName(full: string | null): string {
  if (!full) return "Verified customer";
  const parts = full.trim().split(/\s+/);
  const first = parts[0] ?? "";
  const lastInitial = parts[1]?.[0];
  return lastInitial ? `${first} ${lastInitial}.` : first;
}

export async function submitReview(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Pick a star rating." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in again." };

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, customer_id, contractor_id, status")
    .eq("id", parsed.data.booking_id)
    .maybeSingle();
  const b = booking as
    | { id: string; customer_id: string; contractor_id: string; status: string }
    | null;
  if (!b || b.customer_id !== user.id) return { error: "Booking not found." };
  if (b.status !== "completed") return { error: "You can review once the job is complete." };

  const { data: me } = await supabase
    .from("users")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const { error } = await supabase.from("reviews").insert({
    booking_id: b.id,
    customer_id: user.id,
    contractor_id: b.contractor_id,
    rating: parsed.data.rating,
    comment: parsed.data.comment || null,
    customer_display_name: displayName((me as { full_name: string | null } | null)?.full_name ?? null),
  });
  if (error) return { error: "You've already reviewed this job." };

  await notifyContractor(b.contractor_id, {
    type: "review_left",
    title: "New review ⭐",
    body: "A customer left you a review.",
    link: "/den/reviews",
  });

  revalidatePath(`/base-camp/bookings/${b.id}`);
  revalidatePath("/den/reviews");
  return { ok: true };
}

export async function replyReview(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const reply = String(formData.get("reply") ?? "").trim();
  if (!id || !reply) return;
  const supabase = await createClient();
  await supabase.from("reviews").update({ contractor_reply: reply }).eq("id", id);
  revalidatePath("/den/reviews");
}
