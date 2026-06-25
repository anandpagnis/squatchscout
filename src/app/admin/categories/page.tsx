import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-shell";
import { CategoryIcon } from "@/components/brand/category-icon";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Categories · Admin" };

type Row = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
};

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("service_categories")
    .select("id, name, slug, icon, sort_order, is_active")
    .order("sort_order");

  const rows = (data ?? []) as Row[];

  return (
    <div className="space-y-6">
      <DashboardHeader title="Service categories" subtitle={`${rows.length} categories in the catalog`} />
      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {rows.map((c) => (
          <li key={c.id} className="flex items-center gap-4 px-5 py-4">
            <span className="flex size-10 items-center justify-center rounded-xl bg-sage-soft text-sage-dark [&_svg]:size-5">
              <CategoryIcon name={c.icon ?? "hammer"} />
            </span>
            <div className="flex-1">
              <p className="font-semibold text-ink">{c.name}</p>
              <p className="text-xs text-muted-foreground">/services/{c.slug}</p>
            </div>
            <Badge variant={c.is_active ? "success" : "neutral"}>{c.is_active ? "Active" : "Hidden"}</Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}
