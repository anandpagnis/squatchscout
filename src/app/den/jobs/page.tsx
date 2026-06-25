import type { Metadata } from "next";
import Link from "next/link";
import { Inbox, ChevronRight, Check, X } from "lucide-react";
import { getMyContractorProfile } from "@/lib/data/contractors";
import { listContractorBookings } from "@/lib/data/bookings";
import { DashboardHeader } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/booking/status-badge";
import { Button } from "@/components/ui/button";
import { updateJobStatus } from "../actions";
import { formatPrice } from "@/lib/utils";
import type { Booking } from "@/lib/types";

export const metadata: Metadata = { title: "Jobs" };

export default async function DenJobsPage() {
  const pro = await getMyContractorProfile();
  if (!pro) return null;

  const bookings = await listContractorBookings(pro.id);
  const requested = bookings.filter((b) => b.status === "requested");
  const active = bookings.filter((b) =>
    ["accepted", "scheduled", "in_progress"].includes(b.status),
  );
  const past = bookings.filter((b) =>
    ["completed", "declined", "cancelled", "refunded"].includes(b.status),
  );

  return (
    <div className="space-y-8">
      <DashboardHeader title="Jobs" subtitle="Requests, upcoming work and history." />

      <section>
        <h2 className="mb-3 font-display text-lg font-bold">
          New requests {requested.length > 0 && <span className="text-orange-dark">({requested.length})</span>}
        </h2>
        {requested.length === 0 ? (
          <EmptyState icon={<Inbox />} title="No new requests" body="New booking requests show up here to accept or decline." />
        ) : (
          <ul className="space-y-3">
            {requested.map((b) => (
              <li key={b.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link href={`/den/jobs/${b.id}`} className="min-w-0">
                    <p className="font-semibold text-ink hover:text-orange-dark">{b.service?.name ?? "Service"}</p>
                    <p className="text-sm text-muted-foreground">
                      {b.city}, {b.state} ·{" "}
                      {b.scheduled_start
                        ? new Date(b.scheduled_start).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
                        : "Time TBD"}
                      {b.contractor_payout != null && ` · earn ${formatPrice(b.contractor_payout)}`}
                    </p>
                  </Link>
                  <div className="flex gap-2">
                    <form action={updateJobStatus}>
                      <input type="hidden" name="id" value={b.id} />
                      <input type="hidden" name="status" value="declined" />
                      <Button type="submit" variant="outline" size="sm"><X /> Decline</Button>
                    </form>
                    <form action={updateJobStatus}>
                      <input type="hidden" name="id" value={b.id} />
                      <input type="hidden" name="status" value="accepted" />
                      <Button type="submit" size="sm"><Check /> Accept</Button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <JobGroup title="Upcoming & in progress" rows={active} emptyHint="No active jobs." />
      <JobGroup title="History" rows={past} emptyHint="No past jobs yet." />
    </div>
  );
}

function JobGroup({ title, rows, emptyHint }: { title: string; rows: Booking[]; emptyHint: string }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-lg font-bold">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyHint}</p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {rows.map((b) => (
            <li key={b.id}>
              <Link href={`/den/jobs/${b.id}`} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{b.service?.name ?? "Service"}</p>
                  <p className="text-sm text-muted-foreground">
                    {b.city}, {b.state} ·{" "}
                    {b.scheduled_start
                      ? new Date(b.scheduled_start).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      : "TBD"}
                  </p>
                </div>
                {b.contractor_payout != null && (
                  <span className="hidden font-semibold text-ink sm:block">{formatPrice(b.contractor_payout)}</span>
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
