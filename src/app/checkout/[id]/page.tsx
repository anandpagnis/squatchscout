import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getBooking } from "@/lib/data/bookings";
import { Avatar } from "@/components/ui/avatar";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { brand } from "@/lib/brand";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const booking = await getBooking(id);

  if (!booking) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <Alert variant="error">We couldn&apos;t find that booking.</Alert>
      </div>
    );
  }

  // Already paid → straight to the booking.
  if (["scheduled", "in_progress", "completed"].includes(booking.status)) {
    redirect(`/base-camp/bookings/${booking.id}`);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <Link
        href={`/base-camp/bookings/${booking.id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-orange-dark"
      >
        <ArrowLeft className="size-4" /> Back to booking
      </Link>

      <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight">Checkout</h1>

      <div className="my-5 flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-card">
        <Avatar name={booking.contractor?.business_name} src={booking.contractor?.avatar_url} className="size-12" />
        <div>
          <p className="font-semibold text-ink">{booking.service?.name ?? "Service"}</p>
          <p className="text-sm text-muted-foreground">{booking.contractor?.business_name ?? "Pro"}</p>
        </div>
      </div>

      {booking.status !== "accepted" ? (
        <Alert variant="info">
          This booking is <strong className="mx-1">{booking.status}</strong> — payment opens once the
          pro accepts your request.
        </Alert>
      ) : booking.quoted_price == null ? (
        <Alert variant="info">
          This is a quote-type job. Your pro will send a price to approve before any payment.
        </Alert>
      ) : (
        <CheckoutForm
          bookingId={booking.id}
          subtotal={booking.quoted_price}
          feeRate={brand.platformFeeRate}
        />
      )}

      <div className="mt-6 text-center">
        <Link href="/base-camp/bookings" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          View all bookings
        </Link>
      </div>
    </div>
  );
}
