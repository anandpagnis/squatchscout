import { PriceRow } from "@/components/booking/detail-rows";
import { formatPrice } from "@/lib/utils";
import type { Booking } from "@/lib/types";

/**
 * What the pro earns: job price − platform fee → payout.
 * The customer sees the price side instead (components/base-camp/booking-price-card.tsx).
 */
export function JobPayoutCard({ booking: b }: { booking: Booking }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <h2 className="font-display text-lg font-bold">Your payout</h2>
      {b.quoted_price != null ? (
        <dl className="mt-3 space-y-2 text-sm">
          <PriceRow label="Job price" value={formatPrice(b.quoted_price)} />
          {b.platform_fee != null && (
            <PriceRow label="Platform fee" value={`− ${formatPrice(b.platform_fee)}`} />
          )}
          <div className="my-1 border-t border-border" />
          <PriceRow label="You earn" value={formatPrice(b.contractor_payout ?? 0)} strong />
        </dl>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          Quote-type job — send the customer a price to confirm.
        </p>
      )}
    </div>
  );
}
