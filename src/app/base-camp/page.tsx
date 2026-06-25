import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, CheckCircle2, Heart, Search } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { microcopy } from "@/lib/brand";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardHeader } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/dashboard/empty-state";

export const metadata: Metadata = { title: "Base Camp" };

const ACTIVE = ["requested", "accepted", "scheduled", "in_progress"];

export default async function BaseCampPage() {
  const profile = await getProfile();
  if (!profile) return null;

  const supabase = await createClient();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, booking_number, status, scheduled_start, service:services(name)")
    .eq("customer_id", profile.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(6);

  const rows = bookings ?? [];
  const upcoming = rows.filter((b) => ACTIVE.includes(b.status as string));
  const completed = rows.filter((b) => b.status === "completed");

  const { count: favCount } = await supabase
    .from("favorites")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", profile.id);

  const firstName = profile.full_name?.split(" ")[0] ?? "scout";

  return (
    <div className="space-y-7">
      <DashboardHeader
        title={`Welcome back, ${firstName} 🏕️`}
        subtitle="Here's what's happening at Base Camp."
        action={
          <Link href="/services" className={buttonVariants({ variant: "primary" })}>
            <Search /> Book a job
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Upcoming jobs" value={upcoming.length} icon={<CalendarCheck />} />
        <StatCard label="Completed" value={completed.length} icon={<CheckCircle2 />} />
        <StatCard label="Saved pros" value={favCount ?? 0} icon={<Heart />} />
      </div>

      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Recent activity</h2>
        {rows.length === 0 ? (
          <EmptyState
            icon={<CalendarCheck />}
            title={microcopy.emptyBookings}
            body="Scout your area and book a vetted local pro in a couple of taps."
            action={
              <Link href="/services" className={buttonVariants({ variant: "primary" })}>
                Find a pro
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {rows.map((b) => {
              const service = (b.service as { name?: string } | null)?.name ?? "Service";
              const when = b.scheduled_start
                ? new Date(b.scheduled_start as string).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : "—";
              return (
                <li key={b.id as string} className="flex items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <p className="font-semibold text-ink">{service}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.booking_number as string} · {when}
                    </p>
                  </div>
                  <Badge variant={b.status === "completed" ? "success" : "default"}>
                    {String(b.status).replace("_", " ")}
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/services" className={buttonVariants({ variant: "outline" })}>
          Browse services
        </Link>
        <Link href="/base-camp/bookings" className={buttonVariants({ variant: "ghost" })}>
          View all bookings
        </Link>
      </div>
    </div>
  );
}
