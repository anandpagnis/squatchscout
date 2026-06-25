import { createClient } from "@/lib/supabase/server";
import type { Service, ServiceCategory } from "@/lib/types";

export async function listCategories(): Promise<ServiceCategory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("service_categories")
    .select("id, name, slug, icon, description, sort_order")
    .eq("is_active", true)
    .order("sort_order");
  return (data ?? []) as ServiceCategory[];
}

export async function getCategoryBySlug(slug: string): Promise<ServiceCategory | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("service_categories")
    .select("id, name, slug, icon, description, sort_order")
    .eq("slug", slug)
    .maybeSingle();
  return (data as ServiceCategory | null) ?? null;
}

export async function getServicesByCategory(categoryId: string): Promise<Service[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select(
      "id, category_id, name, slug, description, default_pricing_type, suggested_min_price, est_duration_mins, image_url",
    )
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .order("sort_order");
  return (data ?? []) as Service[];
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select(
      "id, category_id, name, slug, description, default_pricing_type, suggested_min_price, est_duration_mins, image_url",
    )
    .eq("slug", slug)
    .maybeSingle();
  return (data as Service | null) ?? null;
}
