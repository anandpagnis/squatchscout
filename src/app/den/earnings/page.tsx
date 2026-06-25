import type { Metadata } from "next";
import { Wallet, Clock, Briefcase, Coins } from "lucide-react";
import { getMyContractorProfile } from "@/lib/data/contractors";
import { listContractorBookings } from "@/lib/data/bookings";
import { DashboardHeader } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Earnings" };

export default async function DenEarningsPage() {
  const pro = await getMyContractorProfile();
  if (!pro) return null;

  const bookings = await listContractorBookings(pro.id);
  const completed = bookings.filter((b) => b.status === "completed");
  const pendingRows = bookings.filter((b) =>
    ["accepted", "scheduled", "in_progress"].includes(b.status),
  );

  const earned = completed.reduce((sum, b) => sum + (b.contractor_payout ?? 0) + b.tip, 0);
  const pending = pendingRows.reduce((sum, b) => sum + (b.contractor_payout ?? 0), 0);

  return (
    <div className="space-y-7">
      <DashboardHeader title="Earnings" subtitle="Your payouts at a glance." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Lifetime earned" value={formatPrice(earned)} icon={<Wallet />} />
        <StatCard label="Pending payout" value={formatPrice(pending)} icon={<Clock />} />
        <StatCard label="Jobs completed" value={completed.length} icon={<Briefcase />} />
        <StatCard
          label="Payouts"
          value={pro.payouts_enabled ? "Connected" : "Set up"}
          icon={<Coins />}
          hint={pro.payouts_enabled ? "Stripe Connect" : "Connect to get paid"}
        />
      </div>

      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Per-job breakdown</h2>
        {completed.length === 0 ? (
          <EmptyState icon={<Wallet />} title="No earnings yet" body="Completed jobs and their payouts will show up here." />
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {completed.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-semibold text-ink">{b.service?.name ?? "Service"}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.booking_number}
                    {b.quoted_price != null && ` · ${formatPrice(b.quoted_price)} job`}
                    {b.platform_fee != null && ` · ${formatPrice(b.platform_fee)} fee`}
                  </p>
                </div>
                <span className="font-display text-lg font-bold text-ink">
                  {formatPrice((b.contractor_payout ?? 0) + b.tip)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!pro.payouts_enabled && (
        <p className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Stripe Connect payouts are wired in Phase 4 — once connected, payouts release
          automatically when a job is marked complete.
        </p>
      )}
    </div>
  );
}
