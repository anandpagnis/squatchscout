import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/booking/status-badge";
import { formatPrice } from "@/lib/utils";
import type { Booking } from "@/lib/types";

/**
 * Customer-facing booking list group: shows the pro's name and what the
 * customer pays. The contractor equivalent is components/den/job-list.tsx.
 */
export function CustomerBookingGroup({
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
                href={`/base-camp/bookings/${b.id}`}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{b.service?.name ?? "Service"}</p>
                  <p className="text-sm text-muted-foreground">
                    {b.contractor?.business_name ?? "Pro"} ·{" "}
                    {b.scheduled_start
                      ? new Date(b.scheduled_start).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : "Time TBD"}
                  </p>
                </div>
                {b.quoted_price != null && (
                  <span className="hidden font-semibold text-ink sm:block">
                    {formatPrice(b.quoted_price)}
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
