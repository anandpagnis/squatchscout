import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, CalendarClock, Hash, CheckCircle2 } from "lucide-react";
import { getBooking } from "@/lib/data/bookings";
import { StatusBadge } from "@/components/booking/status-badge";
import { BookingMetaRow } from "@/components/booking/detail-rows";
import { CustomerPriceCard } from "@/components/base-camp/booking-price-card";
import { CustomerBookingActions } from "@/components/base-camp/booking-actions";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Rating } from "@/components/ui/rating";
import { ReviewForm } from "@/components/reviews/review-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Booking details" };

export default async function BookingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string; paid?: string }>;
}) {
  const { id } = await params;
  const { new: isNew, paid } = await searchParams;
  const booking = await getBooking(id);
  if (!booking) notFound();

  const supabase = await createClient();
  const { data: reviewData } = await supabase
    .from("reviews")
    .select("rating, comment, contractor_reply")
    .eq("booking_id", id)
    .maybeSingle();
  const review = reviewData as
    | { rating: number; comment: string | null; contractor_reply: string | null }
    | null;

  const when = booking.scheduled_start
    ? new Date(booking.scheduled_start).toLocaleString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "To be scheduled";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/base-camp/bookings"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-orange-dark"
      >
        <ArrowLeft className="size-4" /> All bookings
      </Link>

      {isNew && (
        <Alert variant="success">
          <CheckCircle2 />
          <div>
            <p className="font-semibold">Request sent! 🎉</p>
            <p className="text-sm">
              {booking.contractor?.business_name ?? "Your pro"} will confirm shortly. We&apos;ll
              keep you posted.
            </p>
          </div>
        </Alert>
      )}

      {paid && (
        <Alert variant="success">
          <CheckCircle2 />
          <div>
            <p className="font-semibold">Payment received — you&apos;re scheduled! 🎉</p>
            <p className="text-sm">Funds are held safely and released to your pro once the job is done.</p>
          </div>
        </Alert>
      )}

      {booking.status === "accepted" && booking.quoted_price != null && (
        <Alert variant="info">
          <CheckCircle2 />
          <div className="flex flex-1 flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              <span className="font-semibold">Your pro accepted!</span> Pay to lock in your time slot.
            </p>
            <Link href={`/checkout/${booking.id}`} className={buttonVariants({ variant: "primary", size: "sm" })}>
              Pay &amp; schedule
            </Link>
          </div>
        </Alert>
      )}

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar
              name={booking.contractor?.business_name}
              src={booking.contractor?.avatar_url}
              className="size-12"
            />
            <div>
              <h1 className="font-display text-xl font-bold">{booking.service?.name ?? "Service"}</h1>
              <p className="text-sm text-muted-foreground">
                {booking.contractor?.business_name ?? "Pro"}
              </p>
            </div>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <BookingMetaRow icon={<Hash />} label="Booking"><span className="font-mono">{booking.booking_number}</span></BookingMetaRow>
          <BookingMetaRow icon={<CalendarClock />} label="When">{when}</BookingMetaRow>
          <BookingMetaRow icon={<MapPin />} label="Where">
            {booking.address_line1
              ? `${booking.address_line1}, ${booking.city}, ${booking.state} ${booking.zip}`
              : "—"}
          </BookingMetaRow>
        </dl>

        {booking.job_notes && (
          <div className="mt-5 rounded-xl bg-muted p-4 text-sm">
            <p className="font-semibold text-ink">Job notes</p>
            <p className="mt-1 text-ink-soft">{booking.job_notes}</p>
          </div>
        )}
      </div>

      <CustomerPriceCard booking={booking} />

      {booking.status === "completed" && !review && <ReviewForm bookingId={booking.id} />}

      {review && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Your review</h2>
            <Rating value={review.rating} />
          </div>
          {review.comment && <p className="mt-2 text-sm text-ink-soft">{review.comment}</p>}
          {review.contractor_reply && (
            <div className="mt-3 rounded-xl bg-muted px-4 py-3 text-sm">
              <p className="font-semibold text-ink">Reply from {booking.contractor?.business_name}</p>
              <p className="mt-1 text-ink-soft">{review.contractor_reply}</p>
            </div>
          )}
        </div>
      )}

      <CustomerBookingActions booking={booking} />
    </div>
  );
}
