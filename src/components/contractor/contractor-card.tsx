import Link from "next/link";
import { MapPin, BadgeCheck, Clock } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { ContractorCard as TCard } from "@/lib/types";

export function ContractorCard({ pro }: { pro: TCard }) {
  return (
    <Link
      href={`/pros/${pro.slug}`}
      className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-soft"
    >
      <div className="flex items-start gap-4">
        <Avatar name={pro.business_name} src={pro.avatar_url} className="size-14" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-display text-base font-bold text-ink">
              {pro.business_name}
            </h3>
            <BadgeCheck className="size-4 shrink-0 text-sage-dark" aria-label="Verified" />
          </div>
          {pro.headline && (
            <p className="line-clamp-1 text-sm text-muted-foreground">{pro.headline}</p>
          )}
          <div className="mt-1">
            <Rating value={pro.rating_avg} count={pro.rating_count} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
        {pro.base_city && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" /> {pro.base_city}, {pro.base_state}
          </span>
        )}
        {pro.response_time_mins != null && (
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" /> ~{pro.response_time_mins}m response
          </span>
        )}
        <span>{pro.jobs_completed} jobs done</span>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
        <span className="text-sm text-muted-foreground">
          {pro.from_price != null ? (
            <>
              <span className="font-display text-lg font-bold text-ink">
                {formatPrice(pro.from_price)}
              </span>{" "}
              starting
            </>
          ) : (
            <span className="font-medium text-ink">Custom quote</span>
          )}
        </span>
        <Badge variant="sage">View profile</Badge>
      </div>
    </Link>
  );
}

export function ContractorCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-4">
        <div className="skeleton size-14 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      </div>
      <div className="skeleton h-3 w-3/4" />
      <div className="skeleton h-8 w-full" />
    </div>
  );
}
