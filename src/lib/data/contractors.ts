import { createClient } from "@/lib/supabase/server";
import type {
  ContractorCard,
  ContractorProfile,
  ContractorServiceRow,
  Review,
} from "@/lib/types";

export type ContractorSort = "rating" | "price" | "jobs";
export interface ContractorFilters {
  minRating?: number;
  maxPrice?: number;
  sort?: ContractorSort;
}

const CARD_FIELDS =
  "id, slug, business_name, headline, avatar_url, base_city, base_state, service_radius_miles, rating_avg, rating_count, jobs_completed, response_time_mins, years_experience";

/**
 * Live contractors offering at least one service in the given category.
 * One contractor_services row per offering → deduped, with the cheapest
 * non-quote price surfaced as `from_price`.
 */
export async function listContractorsForCategory(
  categoryId: string,
  filters: ContractorFilters = {},
): Promise<ContractorCard[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contractor_services")
    .select(
      `price, pricing_type, is_active,
       service:services!inner(category_id),
       contractor:contractor_profiles!inner(${CARD_FIELDS}, is_active, verification_status, deleted_at)`,
    )
    .eq("is_active", true)
    .eq("service.category_id", categoryId)
    .eq("contractor.is_active", true)
    .eq("contractor.verification_status", "approved");

  const byId = new Map<string, ContractorCard>();
  for (const row of (data ?? []) as unknown as Array<{
    price: number | null;
    contractor: (ContractorCard & { deleted_at: string | null }) | null;
  }>) {
    const c = row.contractor;
    if (!c || c.deleted_at) continue;
    const existing = byId.get(c.id);
    const price = row.price ?? null;
    if (!existing) {
      byId.set(c.id, { ...c, from_price: price });
    } else if (price != null && (existing.from_price == null || price < existing.from_price)) {
      existing.from_price = price;
    }
  }

  let cards = [...byId.values()];

  if (filters.minRating) cards = cards.filter((c) => c.rating_avg >= filters.minRating!);
  if (filters.maxPrice != null)
    cards = cards.filter((c) => c.from_price != null && c.from_price <= filters.maxPrice!);

  const sort = filters.sort ?? "rating";
  cards.sort((a, b) => {
    if (sort === "price") return (a.from_price ?? 1e9) - (b.from_price ?? 1e9);
    if (sort === "jobs") return b.jobs_completed - a.jobs_completed;
    return b.rating_avg - a.rating_avg || b.rating_count - a.rating_count;
  });

  return cards;
}

/** Best live contractor for a category (auto-match) — returns the full profile. */
export async function autoMatchContractor(
  categoryId: string,
): Promise<ContractorProfile | null> {
  const cards = await listContractorsForCategory(categoryId, { sort: "rating" });
  const top = cards[0];
  return top ? getContractorById(top.id) : null;
}

export async function getContractorBySlug(slug: string): Promise<ContractorProfile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contractor_profiles")
    .select(
      `${CARD_FIELDS}, bio, verification_status, base_lat, base_lng, payouts_enabled, is_active`,
    )
    .eq("slug", slug)
    .maybeSingle();
  return (data as ContractorProfile | null) ?? null;
}

/** The contractor_profiles row for the logged-in contractor (The Den). */
export async function getMyContractorProfile(): Promise<ContractorProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("contractor_profiles")
    .select(
      `${CARD_FIELDS}, bio, verification_status, base_lat, base_lng, payouts_enabled, is_active`,
    )
    .eq("user_id", user.id)
    .maybeSingle();
  return (data as unknown as ContractorProfile | null) ?? null;
}

export async function getContractorById(id: string): Promise<ContractorProfile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contractor_profiles")
    .select(
      `${CARD_FIELDS}, bio, verification_status, base_lat, base_lng, payouts_enabled, is_active`,
    )
    .eq("id", id)
    .maybeSingle();
  return (data as ContractorProfile | null) ?? null;
}

export async function getContractorServices(
  contractorId: string,
): Promise<ContractorServiceRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contractor_services")
    .select(
      `id, contractor_id, service_id, pricing_type, price, price_unit, is_active,
       service:services(id, category_id, name, slug, description, default_pricing_type, suggested_min_price, est_duration_mins, image_url)`,
    )
    .eq("contractor_id", contractorId)
    .eq("is_active", true);
  return (data ?? []) as unknown as ContractorServiceRow[];
}

export async function getContractorReviews(
  contractorId: string,
  limit = 20,
): Promise<Review[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("id, booking_id, rating, comment, customer_display_name, contractor_reply, created_at")
    .eq("contractor_id", contractorId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Review[];
}
