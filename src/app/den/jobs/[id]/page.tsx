import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, CalendarClock, Hash } from "lucide-react";
import { getBooking } from "@/lib/data/bookings";
import { StatusBadge } from "@/components/booking/status-badge";
import { BookingMetaRow } from "@/components/booking/detail-rows";
import { JobPayoutCard } from "@/components/den/job-payout-card";
import { JobStatusActions } from "@/components/den/job-status-actions";

export const metadata: Metadata = { title: "Job details" };

export default async function DenJobDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const b = await getBooking(id);
  if (!b) notFound();

  const when = b.scheduled_start
    ? new Date(b.scheduled_start).toLocaleString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "To be scheduled";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/den/jobs" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-orange-dark">
        <ArrowLeft className="size-4" /> All jobs
      </Link>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-xl font-bold">{b.service?.name ?? "Service"}</h1>
          <StatusBadge status={b.status} />
        </div>

        <dl className="mt-5 space-y-3 text-sm">
          <BookingMetaRow icon={<Hash />} label="Booking"><span className="font-mono">{b.booking_number}</span></BookingMetaRow>
          <BookingMetaRow icon={<CalendarClock />} label="When">{when}</BookingMetaRow>
          <BookingMetaRow icon={<MapPin />} label="Where">
            {b.address_line1 ? `${b.address_line1}, ${b.city}, ${b.state} ${b.zip}` : "—"}
          </BookingMetaRow>
        </dl>

        {b.job_notes && (
          <div className="mt-5 rounded-xl bg-muted p-4 text-sm">
            <p className="font-semibold text-ink">Customer notes</p>
            <p className="mt-1 text-ink-soft">{b.job_notes}</p>
          </div>
        )}
      </div>

      <JobPayoutCard booking={b} />

      <JobStatusActions booking={b} />
    </div>
  );
}
