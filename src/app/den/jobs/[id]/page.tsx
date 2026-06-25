import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, CalendarClock, Hash, Check, X, Play } from "lucide-react";
import { getBooking } from "@/lib/data/bookings";
import { StatusBadge } from "@/components/booking/status-badge";
import { Button } from "@/components/ui/button";
import { updateJobStatus } from "../../actions";
import { formatPrice } from "@/lib/utils";

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
          <Row icon={<Hash />} label="Booking">{b.booking_number}</Row>
          <Row icon={<CalendarClock />} label="When">{when}</Row>
          <Row icon={<MapPin />} label="Where">
            {b.address_line1 ? `${b.address_line1}, ${b.city}, ${b.state} ${b.zip}` : "—"}
          </Row>
        </dl>

        {b.job_notes && (
          <div className="mt-5 rounded-xl bg-muted p-4 text-sm">
            <p className="font-semibold text-ink">Customer notes</p>
            <p className="mt-1 text-ink-soft">{b.job_notes}</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h2 className="font-display text-lg font-bold">Your payout</h2>
        {b.quoted_price != null ? (
          <dl className="mt-3 space-y-2 text-sm">
            <PriceRow label="Job price" value={formatPrice(b.quoted_price)} />
            {b.platform_fee != null && <PriceRow label="Platform fee" value={`− ${formatPrice(b.platform_fee)}`} />}
            <div className="my-1 border-t border-border" />
            <PriceRow label="You earn" value={formatPrice(b.contractor_payout ?? 0)} strong />
          </dl>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Quote-type job — send the customer a price to confirm.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {b.status === "requested" && (
          <>
            <Action id={b.id} status="accepted" label="Accept job" icon={<Check />} />
            <Action id={b.id} status="declined" label="Decline" icon={<X />} variant="outline" />
          </>
        )}
        {(b.status === "accepted" || b.status === "scheduled") && (
          <Action id={b.id} status="in_progress" label="Start job" icon={<Play />} />
        )}
        {b.status === "in_progress" && (
          <Action id={b.id} status="completed" label="Mark complete" icon={<Check />} />
        )}
      </div>
    </div>
  );
}

function Action({
  id,
  status,
  label,
  icon,
  variant = "primary",
}: {
  id: string;
  status: string;
  label: string;
  icon: React.ReactNode;
  variant?: "primary" | "outline";
}) {
  return (
    <form action={updateJobStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" variant={variant}>{icon} {label}</Button>
    </form>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
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
      <dd className={strong ? "font-display text-base font-bold text-ink" : "font-medium text-ink"}>{value}</dd>
    </div>
  );
}
