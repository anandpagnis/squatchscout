import { cn } from "@/lib/utils";

/**
 * Icon + label + value metadata row on booking/job detail pages.
 * Shared across personas — booking number, time and address read the same
 * for customers and pros; what differs is which cards surround them.
 */
export function BookingMetaRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted-foreground [&_svg]:size-4">{icon}</span>
      <div>
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
        <dd className="font-medium text-ink">{children}</dd>
      </div>
    </div>
  );
}

/** Label/value line in a price or payout breakdown. Strong rows render mono. */
export function PriceRow({
  label,
  value,
  strong,
  muted,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "text-right",
          strong ? "font-mono text-base font-semibold text-ink" : "font-medium text-ink",
          muted && "text-muted-foreground",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
