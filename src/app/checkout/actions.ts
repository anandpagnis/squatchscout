"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider } from "@/lib/payments/provider";
import { validatePromo } from "@/lib/data/promos";
import { notifyContractor } from "@/lib/notify";
import { brand } from "@/lib/brand";

const round = (n: number) => Math.round(n * 100) / 100;

export type PromoState = { ok?: boolean; discount?: number; message?: string; code?: string };

async function fetchPayableBooking(bookingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("bookings")
    .select("id, customer_id, contractor_id, status, quoted_price")
    .eq("id", bookingId)
    .maybeSingle();
  const b = data as
    | { id: string; customer_id: string; contractor_id: string; status: string; quoted_price: number | null }
    | null;
  if (!b || b.customer_id !== user.id) return null;
  return { booking: b, userId: user.id };
}

export async function applyPromo(_prev: PromoState, formData: FormData): Promise<PromoState> {
  const bookingId = String(formData.get("booking_id") ?? "");
  const code = String(formData.get("code") ?? "");
  const ctx = await fetchPayableBooking(bookingId);
  if (!ctx || ctx.booking.quoted_price == null) return { ok: false, message: "Nothing to discount yet" };

  const res = await validatePromo(code, ctx.booking.quoted_price);
  if (!res.valid) return { ok: false, message: res.message };
  return { ok: true, discount: res.discount, message: res.message, code: res.code };
}

export type PayState = { error?: string };

export async function payBooking(_prev: PayState, formData: FormData): Promise<PayState> {
  const bookingId = String(formData.get("booking_id") ?? "");
  const tip = Math.max(0, Number(formData.get("tip") ?? 0)) || 0;
  const code = String(formData.get("code") ?? "").trim();

  const ctx = await fetchPayableBooking(bookingId);
  if (!ctx) return { error: "We couldn't find that booking." };
  const { booking, userId } = ctx;

  if (booking.status !== "accepted") {
    return { error: "This booking isn't ready for payment yet." };
  }
  if (booking.quoted_price == null) {
    return { error: "This is a quote job — wait for the pro's price before paying." };
  }

  const subtotal = booking.quoted_price;
  let discount = 0;
  let promoCode: string | null = null;
  if (code) {
    const res = await validatePromo(code, subtotal);
    if (res.valid) {
      discount = res.discount;
      promoCode = res.code;
    }
  }

  const serviceTotal = round(Math.max(0, subtotal - discount));
  const platformFee = round(serviceTotal * brand.platformFeeRate);
  const payout = round(serviceTotal - platformFee + tip);
  const amount = round(serviceTotal + tip);

  // Charge via the payment provider (mock until Stripe keys are set).
  const provider = getPaymentProvider();
  const charge = await provider.charge({
    amount,
    currency: "usd",
    description: `SquatchScout booking ${booking.id}`,
    metadata: { booking_id: booking.id, customer_id: userId },
  });

  // Record payment + advance booking using the trusted server (service-role) client.
  const admin = createAdminClient();
  await admin.from("payments").insert({
    booking_id: booking.id,
    customer_id: userId,
    contractor_id: booking.contractor_id,
    amount,
    tip,
    platform_fee: platformFee,
    payout_amount: payout,
    currency: "usd",
    stripe_payment_intent_id: charge.id,
    status: "paid",
    paid_at: new Date().toISOString(),
  });

  await admin
    .from("bookings")
    .update({
      status: "scheduled",
      tip,
      final_price: serviceTotal,
      platform_fee: platformFee,
      contractor_payout: payout,
    })
    .eq("id", booking.id);

  if (promoCode) {
    const { data: p } = await admin
      .from("promo_codes")
      .select("id, used_count")
      .eq("code", promoCode)
      .maybeSingle();
    const promo = p as { id: string; used_count: number } | null;
    if (promo) {
      await admin
        .from("promo_codes")
        .update({ used_count: (promo.used_count ?? 0) + 1 })
        .eq("id", promo.id);
    }
  }

  await notifyContractor(booking.contractor_id, {
    type: "booking_paid",
    title: "You're booked & paid 💸",
    body: "A customer paid and scheduled — see the job details.",
    link: `/den/jobs/${booking.id}`,
  });

  revalidatePath(`/base-camp/bookings/${booking.id}`);
  redirect(`/base-camp/bookings/${booking.id}?paid=1`);
}
