import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, CalendarClock, Hash, CheckCircle2 } from "lucide-react";
import { getBooking } from "@/lib/data/bookings";
import { StatusBadge } from "@/components/booking/status-badge";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Rating } from "@/components/ui/rating";
import { ReviewForm } from "@/components/reviews/review-form";
import { createClient } from "@/lib/supabase/server";
import { cancelBooking } from "../../actions";
import { formatPrice } from "@/lib/utils";
import { brand } from "@/lib/brand";

export const metadata: Metadata = { title: "Booking details" };

const CANCELABLE = ["requested", "accepted", "scheduled"];

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
          <Detail icon={<Hash />} label="Booking"><span className="font-mono">{booking.booking_number}</span></Detail>
          <Detail icon={<CalendarClock />} label="When">{when}</Detail>
          <Detail icon={<MapPin />} label="Where">
            {booking.address_line1
              ? `${booking.address_line1}, ${booking.city}, ${booking.state} ${booking.zip}`
              : "—"}
          </Detail>
        </dl>

        {booking.job_notes && (
          <div className="mt-5 rounded-xl bg-muted p-4 text-sm">
            <p className="font-semibold text-ink">Job notes</p>
            <p className="mt-1 text-ink-soft">{booking.job_notes}</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h2 className="font-display text-lg font-bold">Price</h2>
        {booking.quoted_price != null ? (
          <dl className="mt-3 space-y-2 text-sm">
            <PriceRow label="Service" value={formatPrice(booking.quoted_price)} />
            {booking.platform_fee != null && (
              <PriceRow label={`Platform fee (${Math.round(brand.platformFeeRate * 100)}%)`} value={formatPrice(booking.platform_fee)} />
            )}
            {booking.tip > 0 && <PriceRow label="Tip" value={formatPrice(booking.tip)} />}
            <div className="my-1 border-t border-border" />
            <PriceRow
              label="Total"
              value={formatPrice((booking.final_price ?? booking.quoted_price) + booking.tip)}
              strong
            />
          </dl>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            This is a quote-type job — {booking.contractor?.business_name ?? "the pro"} will send a
            price to approve. No charge until you accept.
          </p>
        )}
      </div>

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

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/base-camp/messages?contractor=${booking.contractor_id}`}
          className={buttonVariants({ variant: "outline" })}
        >
          Message pro
        </Link>
        {CANCELABLE.includes(booking.status) && (
          <form action={cancelBooking}>
            <input type="hidden" name="id" value={booking.id} />
            <Button type="submit" variant="ghost" className="text-destructive">
              Cancel booking
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

function Detail({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted-foreground [&_svg]:size-4">{icon}</span>
      <div>
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
        <dd className="font-medium text-ink">{children}</dd>
      </div>
    </div>
  );
}

function PriceRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={strong ? "font-mono text-base font-semibold text-ink" : "font-medium text-ink"}>
        {value}
      </dd>
    </div>
  );
}
