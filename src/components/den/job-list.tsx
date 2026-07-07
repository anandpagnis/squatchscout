import Link from "next/link";
import { ChevronRight, Check, X } from "lucide-react";
import { StatusBadge } from "@/components/booking/status-badge";
import { Button } from "@/components/ui/button";
import { updateJobStatus } from "@/app/den/actions";
import { formatPrice } from "@/lib/utils";
import type { Booking } from "@/lib/types";

/**
 * A new booking request the pro can accept or decline inline.
 * Contractor-facing: shows location and payout, never the customer's total.
 */
export function JobRequestCard({ booking: b }: { booking: Booking }) {
  return (
    <li className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/den/jobs/${b.id}`} className="min-w-0">
          <p className="font-semibold text-ink hover:text-orange-dark">
            {b.service?.name ?? "Service"}
          </p>
          <p className="text-sm text-muted-foreground">
            {b.city}, {b.state} ·{" "}
            {b.scheduled_start
              ? new Date(b.scheduled_start).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "Time TBD"}
            {b.contractor_payout != null && ` · earn ${formatPrice(b.contractor_payout)}`}
          </p>
        </Link>
        <div className="flex gap-2">
          <form action={updateJobStatus}>
            <input type="hidden" name="id" value={b.id} />
            <input type="hidden" name="status" value="declined" />
            <Button type="submit" variant="outline" size="sm">
              <X /> Decline
            </Button>
          </form>
          <form action={updateJobStatus}>
            <input type="hidden" name="id" value={b.id} />
            <input type="hidden" name="status" value="accepted" />
            <Button type="submit" size="sm">
              <Check /> Accept
            </Button>
          </form>
        </div>
      </div>
    </li>
  );
}

/**
 * Contractor-facing job list group: shows location and the pro's payout.
 * The customer equivalent is components/base-camp/booking-list.tsx.
 */
export function JobGroup({
  title,
  rows,
  emptyHint,
}: {
  title: string;
  rows: Booking[];
  emptyHint: string;
}) {
  return (
    <section>
      <h2 className="mb-3 font-display text-lg font-bold">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyHint}</p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {rows.map((b) => (
            <li key={b.id}>
              <Link
                href={`/den/jobs/${b.id}`}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{b.service?.name ?? "Service"}</p>
                  <p className="text-sm text-muted-foreground">
                    {b.city}, {b.state} ·{" "}
                    {b.scheduled_start
                      ? new Date(b.scheduled_start).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "TBD"}
                  </p>
                </div>
                {b.contractor_payout != null && (
                  <span className="hidden font-semibold text-ink sm:block">
                    {formatPrice(b.contractor_payout)}
                  </span>
                )}
                <StatusBadge status={b.status} />
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
