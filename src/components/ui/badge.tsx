import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Semantic badge set. Status colors carry the same meaning everywhere:
 * success = done/verified, warning = attention/in-flight, danger = stopped,
 * info = acknowledged, forest = confirmed/structural, amber = brand highlight.
 * Legacy aliases (default/sage/destructive/verified) map onto the new set so
 * existing call sites keep working.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold [&_svg]:size-3.5",
  {
    variants: {
      variant: {
        amber: "bg-amber-soft text-amber-deep",
        forest: "bg-forest-soft text-forest",
        neutral: "bg-muted text-muted-foreground",
        success: "bg-success-soft text-success",
        warning: "bg-warning-soft text-warning",
        danger: "bg-danger-soft text-danger",
        info: "bg-info-soft text-info",
        outline: "border border-border text-ink",
        // Legacy aliases
        default: "bg-amber-soft text-amber-deep",
        sage: "bg-forest-soft text-forest",
        verified: "bg-forest-soft text-forest",
        destructive: "bg-danger-soft text-danger",
      },
    },
    defaultVariants: { variant: "amber" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Render a small leading status dot (reads at a glance in dense lists). */
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span aria-hidden className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
