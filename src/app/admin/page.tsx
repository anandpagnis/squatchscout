import type { Metadata } from "next";
import { Users, BadgeCheck, CalendarCheck, Flag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";

export const metadata: Metadata = { title: "Ranger Station" };

async function count(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string,
  filters: Record<string, string> = {},
) {
  let q = supabase.from(table).select("id", { count: "exact", head: true });
  for (const [k, v] of Object.entries(filters)) q = q.eq(k, v);
  const { count } = await q;
  return count ?? 0;
}

export default async function AdminPage() {
  const supabase = await createClient();

  const [users, pendingPros, bookings, openDisputes] = await Promise.all([
    count(supabase, "users"),
    count(supabase, "contractor_profiles", { verification_status: "pending" }),
    count(supabase, "bookings"),
    count(supabase, "disputes", { status: "open" }),
  ]);

  return (
    <div className="space-y-7">
      <DashboardHeader
        title="Ranger Station"
        subtitle="The SquatchScout back office."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={users} icon={<Users />} />
        <StatCard label="Pending pros" value={pendingPros} icon={<BadgeCheck />} hint="Awaiting review" />
        <StatCard label="Bookings" value={bookings} icon={<CalendarCheck />} />
        <StatCard label="Open disputes" value={openDisputes} icon={<Flag />} />
      </div>

      <p className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        Verification queue, moderation, transactions and analytics tooling come in
        Phase 6. RBAC and the audit log are already enforced.
      </p>
    </div>
  );
}
