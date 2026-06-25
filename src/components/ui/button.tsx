import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-55 focus-visible:outline-none active:scale-[0.98] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Brand orange CTA. Ink text keeps WCAG-AA contrast (≈6.4:1).
        primary:
          "bg-primary text-primary-foreground shadow-soft hover:bg-orange-dark hover:shadow-lift",
        secondary:
          "bg-secondary text-secondary-foreground shadow-soft hover:brightness-110",
        outline:
          "border-2 border-ink/15 bg-background text-ink hover:border-primary hover:bg-orange-soft",
        ghost: "text-ink hover:bg-muted",
        soft: "bg-orange-soft text-orange-dark hover:bg-primary hover:text-primary-foreground",
        destructive:
          "bg-destructive text-destructive-foreground shadow-soft hover:brightness-110",
        link: "text-orange-dark underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-4 text-sm [&_svg]:size-4",
        md: "h-11 px-6 text-sm [&_svg]:size-4",
        lg: "h-13 px-8 text-base [&_svg]:size-5",
        icon: "size-11 [&_svg]:size-5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && (
          <span
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden
          />
        )}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button };
