import { PriceRow } from "@/components/booking/detail-rows";
import { formatPrice } from "@/lib/utils";
import { brand } from "@/lib/brand";
import type { Booking } from "@/lib/types";

/**
 * What the customer pays: service price + platform fee + tip → total.
 * The contractor sees the payout side instead (components/den/job-payout-card.tsx).
 */
export function CustomerPriceCard({ booking }: { booking: Booking }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <h2 className="font-display text-lg font-bold">Price</h2>
      {booking.quoted_price != null ? (
        <dl className="mt-3 space-y-2 text-sm">
          <PriceRow label="Service" value={formatPrice(booking.quoted_price)} />
          {booking.platform_fee != null && (
            <PriceRow
              label={`Platform fee (${Math.round(brand.platformFeeRate * 100)}%)`}
              value={formatPrice(booking.platform_fee)}
            />
          )}
          {booking.tip > 0 && <PriceRow label="Tip" value={formatPrice(booking.tip)} />}
          <div className="my-1 border-t border-border" />
          <PriceRow
            label="Total"
            value={formatPrice((booking.final_price ?? booking.quoted_price) + booking.tip)}
            strong
          />
        </dl>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          This is a quote-type job — {booking.contractor?.business_name ?? "the pro"} will send a
          price to approve. No charge until you accept.
        </p>
      )}
    </div>
  );
}
