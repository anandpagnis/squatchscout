import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm [&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        info: "border-border bg-muted text-ink",
        error: "border-destructive/30 bg-red-50 text-destructive",
        success: "border-sage/30 bg-sage-soft text-sage-dark",
        warning: "border-warning/30 bg-amber-50 text-warning",
      },
    },
    defaultVariants: { variant: "info" },
  },
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

function Alert({ className, variant, role = "status", ...props }: AlertProps) {
  return (
    <div role={role} className={cn(alertVariants({ variant }), className)} {...props} />
  );
}

export { Alert, alertVariants };
