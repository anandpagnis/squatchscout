import type { Metadata } from "next";
import { Tags } from "lucide-react";
import { getMyContractorProfile } from "@/lib/data/contractors";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { AddServiceForm } from "@/components/den/add-service-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateServicePrice, toggleService, removeService } from "../actions";

export const metadata: Metadata = { title: "Services & pricing" };

type MyService = {
  id: string;
  price: number | null;
  price_unit: string;
  pricing_type: string;
  is_active: boolean;
  service: { id: string; name: string } | null;
};
type CatalogService = { id: string; name: string; category: { name: string } | null };

export default async function DenServicesPage() {
  const pro = await getMyContractorProfile();
  if (!pro) return null;

  const supabase = await createClient();
  const [{ data: mine }, { data: all }] = await Promise.all([
    supabase
      .from("contractor_services")
      .select("id, price, price_unit, pricing_type, is_active, service:services(id, name)")
      .eq("contractor_id", pro.id),
    supabase
      .from("services")
      .select("id, name, category:service_categories(name)")
      .eq("is_active", true)
      .order("name"),
  ]);

  const myServices = (mine ?? []) as unknown as MyService[];
  const offeredIds = new Set(myServices.map((m) => m.service?.id).filter(Boolean));
  const available = ((all ?? []) as unknown as CatalogService[])
    .filter((s) => !offeredIds.has(s.id))
    .map((s) => ({ id: s.id, name: s.name, category: s.category?.name ?? "Other" }));

  return (
    <div className="space-y-6">
      <DashboardHeader title="Services & pricing" subtitle="Toggle what you offer and set your rates." />

      {myServices.length === 0 ? (
        <EmptyState icon={<Tags />} title="No services yet" body="Add your first service below to start getting booked." />
      ) : (
        <ul className="space-y-3">
          {myServices.map((cs) => (
            <li
              key={cs.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5 shadow-card"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-ink">{cs.service?.name ?? "Service"}</p>
                  {!cs.is_active && <Badge variant="neutral">Paused</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{cs.price_unit}</p>
              </div>
              <div className="flex items-center gap-2">
                {cs.pricing_type !== "quote" && (
                  <form action={updateServicePrice} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={cs.id} />
                    <Input
                      name="price"
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={cs.price ?? 0}
                      className="h-9 w-24"
                      aria-label="Price"
                    />
                    <Button type="submit" variant="outline" size="sm">Save</Button>
                  </form>
                )}
                <form action={toggleService}>
                  <input type="hidden" name="id" value={cs.id} />
                  <input type="hidden" name="is_active" value={(!cs.is_active).toString()} />
                  <Button type="submit" variant="ghost" size="sm">
                    {cs.is_active ? "Pause" : "Activate"}
                  </Button>
                </form>
                <form action={removeService}>
                  <input type="hidden" name="id" value={cs.id} />
                  <Button type="submit" variant="ghost" size="sm" className="text-destructive">Remove</Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AddServiceForm available={available} />
    </div>
  );
}
