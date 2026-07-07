import type { Metadata } from "next";
import { Flag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Badge, type BadgeProps } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Disputes · Admin" };

type Row = {
  id: string;
  subject: string;
  status: "open" | "under_review" | "resolved" | "rejected";
  created_at: string;
  booking: { booking_number: string } | null;
};

const VARIANT: Record<Row["status"], BadgeProps["variant"]> = {
  open: "warning",
  under_review: "default",
  resolved: "success",
  rejected: "neutral",
};

export default async function AdminDisputesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("disputes")
    .select("id, subject, status, created_at, booking:bookings(booking_number)")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as Row[];

  return (
    <div className="space-y-6">
      <DashboardHeader title="Disputes" subtitle="Resolve issues between customers and pros." />
      {rows.length === 0 ? (
        <EmptyState icon={<Flag />} title="No disputes" body="When a booking is disputed, it shows up here." />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {rows.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="font-semibold text-ink">{d.subject}</p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-mono">{d.booking?.booking_number ?? "—"}</span> ·{" "}
                  {new Date(d.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
              <Badge variant={VARIANT[d.status]}>{d.status.replace("_", " ")}</Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
