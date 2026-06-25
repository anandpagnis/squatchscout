import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddPromoForm } from "@/components/admin/add-promo-form";
import { togglePromo } from "../actions";
import { Ticket } from "lucide-react";

export const metadata: Metadata = { title: "Promos · Admin" };

type Row = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
};

export default async function AdminPromosPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("promo_codes")
    .select("id, code, type, value, max_uses, used_count, active, expires_at")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as Row[];

  return (
    <div className="space-y-6">
      <DashboardHeader title="Promo codes" subtitle="Discounts & campaigns." />

      {rows.length === 0 ? (
        <EmptyState icon={<Ticket />} title="No promo codes yet" body="Create one below." />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {rows.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="font-mono font-semibold text-ink">{p.code}</p>
                <p className="text-xs text-muted-foreground">
                  {p.type === "percent" ? `${p.value}% off` : `$${p.value} off`} · used {p.used_count}
                  {p.max_uses != null ? `/${p.max_uses}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={p.active ? "success" : "neutral"}>{p.active ? "Active" : "Off"}</Badge>
                <form action={togglePromo}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="active" value={(!p.active).toString()} />
                  <Button type="submit" variant="ghost" size="sm">{p.active ? "Disable" : "Enable"}</Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AddPromoForm />
    </div>
  );
}
