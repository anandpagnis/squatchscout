import type { Metadata } from "next";
import { Inbox } from "lucide-react";
import { getMyContractorProfile } from "@/lib/data/contractors";
import { listContractorBookings } from "@/lib/data/bookings";
import { DashboardHeader } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { JobRequestCard, JobGroup } from "@/components/den/job-list";

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
              <JobRequestCard key={b.id} booking={b} />
            ))}
          </ul>
        )}
      </section>

      <JobGroup title="Upcoming & in progress" rows={active} emptyHint="No active jobs." />
      <JobGroup title="History" rows={past} emptyHint="No past jobs yet." />
    </div>
  );
}
