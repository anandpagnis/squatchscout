import { cn } from "@/lib/utils";

/**
 * SquatchScout brand mark: a magnifying glass containing a walking Sasquatch.
 * Inline SVG so it stays crisp at any size and inherits brand colors.
 * Swap `LogoMark` for the final designed asset later without touching callers.
 */
export function LogoMark({
  className,
  title = "SquatchScout",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      className={cn("size-9", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="ss-lens">
          <circle cx="26" cy="26" r="19" />
        </clipPath>
      </defs>

      {/* lens fill */}
      <circle cx="26" cy="26" r="19" fill="var(--color-cream-soft)" />

      {/* walking sasquatch, clipped to the lens */}
      <g clipPath="url(#ss-lens)" fill="var(--color-ink)">
        <ellipse cx="25" cy="25" rx="6.6" ry="9.2" />
        <circle cx="25" cy="13.8" r="5" />
        <g
          stroke="var(--color-ink)"
          strokeWidth="4.6"
          strokeLinecap="round"
          fill="none"
        >
          <path d="M24 21 L18 27.5" />
          <path d="M26.5 21 L31.5 28.5" />
          <path d="M23 32.5 L18 42" />
          <path d="M27.5 32.5 L31.5 43" />
        </g>
      </g>

      {/* lens ring */}
      <circle
        cx="26"
        cy="26"
        r="19"
        fill="none"
        stroke="var(--color-orange)"
        strokeWidth="4.5"
      />
      {/* handle */}
      <path
        d="M40 40 L55 55"
        stroke="var(--color-orange)"
        strokeWidth="6.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({
  className,
  withWordmark = true,
  markClassName,
}: {
  className?: string;
  withWordmark?: boolean;
  markClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={markClassName} />
      {withWordmark && (
        <span className="font-display text-xl font-extrabold tracking-tight text-ink">
          Squatch<span className="text-orange-dark">Scout</span>
        </span>
      )}
    </span>
  );
}
