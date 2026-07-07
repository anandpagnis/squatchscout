import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-200 ease-spring disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none active:scale-[0.97] active:translate-y-0 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Amber CTA. Ink text keeps WCAG-AA contrast (white-on-amber fails).
        primary:
          "bg-amber text-ink shadow-card hover:bg-amber-strong hover:shadow-lift hover:-translate-y-px",
        secondary:
          "bg-forest text-card shadow-card hover:bg-forest-mid hover:-translate-y-px",
        outline:
          "border-[1.5px] border-tan bg-transparent text-ink hover:border-amber-deep hover:bg-amber-soft",
        ghost: "text-ink-soft hover:bg-muted hover:text-ink",
        soft: "bg-amber-soft text-amber-deep hover:bg-amber hover:text-ink",
        destructive:
          "bg-danger text-card shadow-card hover:brightness-108",
        link: "text-forest-mid underline-offset-4 hover:text-forest hover:underline",
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
