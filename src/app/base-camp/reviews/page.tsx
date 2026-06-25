import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Rating } from "@/components/ui/rating";

export const metadata: Metadata = { title: "My reviews" };

type Row = {
  id: string;
  rating: number;
  comment: string | null;
  contractor_reply: string | null;
  created_at: string;
  contractor: { business_name: string; slug: string | null } | null;
};

export default async function MyReviewsPage() {
  const profile = await getProfile();
  if (!profile) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("id, rating, comment, contractor_reply, created_at, contractor:contractor_profiles(business_name, slug)")
    .eq("customer_id", profile.id)
    .order("created_at", { ascending: false });

  const reviews = (data ?? []) as unknown as Row[];

  return (
    <div className="space-y-6">
      <DashboardHeader title="My reviews" subtitle="Reviews you've left for pros." />

      {reviews.length === 0 ? (
        <EmptyState icon={<Star />} title="No reviews yet" body="Reviews you leave after completed jobs show up here." />
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                {r.contractor?.slug ? (
                  <Link href={`/pros/${r.contractor.slug}`} className="font-semibold text-ink hover:text-orange-dark">
                    {r.contractor.business_name}
                  </Link>
                ) : (
                  <span className="font-semibold text-ink">{r.contractor?.business_name ?? "Pro"}</span>
                )}
                <Rating value={r.rating} />
              </div>
              {r.comment && <p className="mt-2 text-sm text-ink-soft">{r.comment}</p>}
              {r.contractor_reply && (
                <div className="mt-3 rounded-xl bg-muted px-4 py-3 text-sm">
                  <p className="font-semibold text-ink">Reply from {r.contractor?.business_name}</p>
                  <p className="mt-1 text-ink-soft">{r.contractor_reply}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
