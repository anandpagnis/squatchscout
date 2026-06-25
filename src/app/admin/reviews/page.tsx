import type { Metadata } from "next";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Rating } from "@/components/ui/rating";
import { Button } from "@/components/ui/button";
import { deleteReview } from "../actions";

export const metadata: Metadata = { title: "Reviews · Admin" };

type Row = {
  id: string;
  rating: number;
  comment: string | null;
  customer_display_name: string | null;
  contractor: { business_name: string } | null;
};

export default async function AdminReviewsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("id, rating, comment, customer_display_name, contractor:contractor_profiles(business_name)")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (data ?? []) as unknown as Row[];

  return (
    <div className="space-y-6">
      <DashboardHeader title="Reviews" subtitle="Moderate customer reviews." />
      {rows.length === 0 ? (
        <EmptyState icon={<Star />} title="No reviews yet" />
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <p className="text-sm">
                  <span className="font-semibold text-ink">{r.customer_display_name ?? "Customer"}</span>{" "}
                  <span className="text-muted-foreground">→ {r.contractor?.business_name ?? "Pro"}</span>
                </p>
                <div className="flex items-center gap-3">
                  <Rating value={r.rating} />
                  <form action={deleteReview}>
                    <input type="hidden" name="id" value={r.id} />
                    <Button type="submit" variant="ghost" size="sm" className="text-destructive">Remove</Button>
                  </form>
                </div>
              </div>
              {r.comment && <p className="mt-2 text-sm text-ink-soft">{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
