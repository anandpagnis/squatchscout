import type { Metadata } from "next";
import { Star } from "lucide-react";
import { getMyContractorProfile, getContractorReviews } from "@/lib/data/contractors";
import { DashboardHeader } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { Rating } from "@/components/ui/rating";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { replyReview } from "@/lib/actions/reviews";

export const metadata: Metadata = { title: "Reviews" };

export default async function DenReviewsPage() {
  const pro = await getMyContractorProfile();
  if (!pro) return null;
  const reviews = await getContractorReviews(pro.id, 100);

  return (
    <div className="space-y-6">
      <DashboardHeader title="Reviews" subtitle="What customers say — and your replies." />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Average rating" value={pro.rating_avg ? Number(pro.rating_avg).toFixed(2) : "—"} icon={<Star />} />
        <StatCard label="Total reviews" value={pro.rating_count} />
      </div>

      {reviews.length === 0 ? (
        <EmptyState icon={<Star />} title="No reviews yet" body="Complete jobs to start collecting reviews." />
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-ink">{r.customer_display_name ?? "Verified customer"}</p>
                <Rating value={r.rating} />
              </div>
              {r.comment && <p className="mt-2 text-sm text-ink-soft">{r.comment}</p>}

              {r.contractor_reply ? (
                <div className="mt-3 rounded-xl bg-muted px-4 py-3 text-sm">
                  <p className="font-semibold text-ink">Your reply</p>
                  <p className="mt-1 text-ink-soft">{r.contractor_reply}</p>
                </div>
              ) : (
                <form action={replyReview} className="mt-3 space-y-2">
                  <input type="hidden" name="id" value={r.id} />
                  <Textarea name="reply" placeholder="Reply publicly…" rows={2} required />
                  <Button type="submit" variant="outline" size="sm">Post reply</Button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
