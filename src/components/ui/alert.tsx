import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm [&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        info: "border-info/25 bg-info-soft text-info",
        error: "border-danger/30 bg-danger-soft text-danger",
        success: "border-success/30 bg-success-soft text-success",
        warning: "border-warning/30 bg-warning-soft text-warning",
        neutral: "border-border bg-muted text-ink",
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
