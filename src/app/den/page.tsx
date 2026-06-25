import type { Metadata } from "next";
import Link from "next/link";
import { Star, Briefcase, Clock, Wallet, ShieldAlert, Inbox } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { DashboardHeader } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/dashboard/empty-state";

export const metadata: Metadata = { title: "The Den" };

export default async function DenPage() {
  const profile = await getProfile();
  if (!profile) return null;

  const supabase = await createClient();

  const { data: pro } = await supabase
    .from("contractor_profiles")
    .select(
      "id, business_name, verification_status, is_active, rating_avg, rating_count, jobs_completed, response_time_mins, payouts_enabled",
    )
    .eq("user_id", profile.id)
    .single();

  const { count: incoming } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("contractor_id", pro?.id ?? "")
    .eq("status", "requested");

  const firstName = profile.full_name?.split(" ")[0] ?? "pro";
  const approved = pro?.verification_status === "approved";

  return (
    <div className="space-y-7">
      <DashboardHeader
        title={`Welcome to The Den, ${firstName}`}
        subtitle={pro?.business_name ?? undefined}
        action={
          <Link href="/den/services" className={buttonVariants({ variant: "primary" })}>
            Manage services
          </Link>
        }
      />

      {!approved && (
        <Alert variant="warning">
          <ShieldAlert />
          <div>
            <p className="font-semibold">Your application is under review.</p>
            <p className="text-sm">
              Finish your profile and upload verification docs to go live. We typically
              review within 1–2 business days.
            </p>
          </div>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Rating"
          value={pro?.rating_avg ? Number(pro.rating_avg).toFixed(2) : "—"}
          icon={<Star />}
          hint={`${pro?.rating_count ?? 0} reviews`}
        />
        <StatCard label="Jobs completed" value={pro?.jobs_completed ?? 0} icon={<Briefcase />} />
        <StatCard
          label="Response time"
          value={pro?.response_time_mins ? `${pro.response_time_mins}m` : "—"}
          icon={<Clock />}
        />
        <StatCard
          label="Payouts"
          value={pro?.payouts_enabled ? "Ready" : "Setup"}
          icon={<Wallet />}
        />
      </div>

      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Incoming requests</h2>
        {(incoming ?? 0) === 0 ? (
          <EmptyState
            icon={<Inbox />}
            title="No new requests yet"
            body="When a customer books you, requests show up here to accept or decline."
          />
        ) : (
          <Alert variant="info">
            You have {incoming} new booking request{incoming === 1 ? "" : "s"} waiting.
          </Alert>
        )}
      </section>

      <p className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        Scheduling, quotes, earnings and the full job pipeline arrive in Phase 3.
      </p>
    </div>
  );
}
