import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-shell";
import { StatusBadge } from "@/components/booking/status-badge";
import { formatPrice } from "@/lib/utils";
import type { BookingStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Bookings · Admin" };

type Row = {
  id: string;
  booking_number: string;
  status: BookingStatus;
  created_at: string;
  quoted_price: number | null;
  final_price: number | null;
  service: { name: string } | null;
  contractor: { business_name: string } | null;
};

export default async function AdminBookingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("id, booking_number, status, created_at, quoted_price, final_price, service:services(name), contractor:contractor_profiles(business_name)")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (data ?? []) as unknown as Row[];

  return (
    <div className="space-y-6">
      <DashboardHeader title="Bookings" subtitle={`${rows.length} most recent`} />
      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {rows.map((b) => (
          <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <p className="font-semibold text-ink">{b.service?.name ?? "Service"}</p>
              <p className="text-xs text-muted-foreground">
                {b.booking_number} · {b.contractor?.business_name ?? "Pro"} ·{" "}
                {new Date(b.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {(b.final_price ?? b.quoted_price) != null && (
                <span className="font-semibold text-ink">{formatPrice(b.final_price ?? b.quoted_price ?? 0)}</span>
              )}
              <StatusBadge status={b.status} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
