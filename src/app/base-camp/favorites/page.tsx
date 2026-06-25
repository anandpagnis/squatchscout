import type { Metadata } from "next";
import Link from "next/link";
import { Heart, X } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ContractorCard } from "@/components/contractor/contractor-card";
import { DashboardHeader } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { removeFavorite } from "../actions";
import type { ContractorCard as TCard } from "@/lib/types";
import { microcopy } from "@/lib/brand";

export const metadata: Metadata = { title: "Saved pros" };

export default async function FavoritesPage() {
  const profile = await getProfile();
  if (!profile) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select(
      "contractor:contractor_profiles(id, slug, business_name, headline, avatar_url, base_city, base_state, service_radius_miles, rating_avg, rating_count, jobs_completed, response_time_mins, years_experience)",
    )
    .eq("customer_id", profile.id);

  const pros = ((data ?? []) as unknown as Array<{ contractor: TCard | null }>)
    .map((r) => r.contractor)
    .filter((c): c is TCard => !!c);

  return (
    <div className="space-y-6">
      <DashboardHeader title="Saved pros" subtitle="Your trail of trusted pros." />

      {pros.length === 0 ? (
        <EmptyState
          icon={<Heart />}
          title={microcopy.emptyFavorites}
          action={
            <Link href="/services" className={buttonVariants({ variant: "primary" })}>
              Find pros
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pros.map((pro) => (
            <div key={pro.id} className="relative">
              <ContractorCard pro={pro} />
              <form action={removeFavorite} className="absolute right-3 top-3">
                <input type="hidden" name="contractor_id" value={pro.id} />
                <button
                  type="submit"
                  aria-label="Remove from saved"
                  className="flex size-8 items-center justify-center rounded-full bg-card/90 text-muted-foreground shadow-card transition-colors hover:text-destructive"
                >
                  <X className="size-4" />
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
