import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold [&_svg]:size-3.5",
  {
    variants: {
      variant: {
        default: "bg-orange-soft text-orange-dark",
        sage: "bg-sage-soft text-sage-dark",
        neutral: "bg-muted text-muted-foreground",
        verified: "bg-sage-soft text-sage-dark",
        success: "bg-green-100 text-success",
        warning: "bg-amber-100 text-warning",
        destructive: "bg-red-100 text-destructive",
        outline: "border border-border text-ink",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
