import type { Metadata } from "next";
import { BadgeCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import { approveContractor, rejectContractor } from "../actions";

export const metadata: Metadata = { title: "Contractors · Admin" };

type Row = {
  id: string;
  business_name: string;
  base_city: string | null;
  base_state: string | null;
  verification_status: "pending" | "approved" | "rejected";
  is_active: boolean;
  rating_avg: number;
  rating_count: number;
  jobs_completed: number;
  user: { email: string; full_name: string | null } | null;
};

const STATUS_VARIANT: Record<Row["verification_status"], BadgeProps["variant"]> = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
};

export default async function AdminContractorsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contractor_profiles")
    .select(
      "id, business_name, base_city, base_state, verification_status, is_active, rating_avg, rating_count, jobs_completed, user:users(email, full_name)",
    )
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as Row[];
  const pending = rows.filter((r) => r.verification_status === "pending");
  const decided = rows.filter((r) => r.verification_status !== "pending");

  return (
    <div className="space-y-8">
      <DashboardHeader title="Contractors" subtitle="Verify and manage Scout Pros." />

      <section>
        <h2 className="mb-3 font-display text-lg font-bold">
          Pending review {pending.length > 0 && <span className="text-orange-dark">({pending.length})</span>}
        </h2>
        {pending.length === 0 ? (
          <EmptyState icon={<BadgeCheck />} title="Nothing in the queue" body="New applications appear here for review." />
        ) : (
          <ul className="space-y-3">
            {pending.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5 shadow-card">
                <div>
                  <p className="font-semibold text-ink">{r.business_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {r.user?.full_name} · {r.user?.email} · {r.base_city ?? "—"}, {r.base_state ?? ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={rejectContractor}>
                    <input type="hidden" name="id" value={r.id} />
                    <Button type="submit" variant="outline" size="sm">Reject</Button>
                  </form>
                  <form action={approveContractor}>
                    <input type="hidden" name="id" value={r.id} />
                    <Button type="submit" size="sm"><BadgeCheck /> Approve</Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-bold">All contractors</h2>
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {decided.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="font-semibold text-ink">{r.business_name}</p>
                <p className="text-xs text-muted-foreground">
                  {r.user?.email} · {r.jobs_completed} jobs
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Rating value={r.rating_avg} count={r.rating_count} />
                {r.is_active && <Badge variant="sage">Live</Badge>}
                <Badge variant={STATUS_VARIANT[r.verification_status]}>{r.verification_status}</Badge>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
