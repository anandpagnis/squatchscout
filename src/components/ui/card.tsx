import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva("rounded-2xl text-card-foreground", {
  variants: {
    variant: {
      /** Calm dashboard surface — border does the work, whisper shadow. */
      flat: "border border-border bg-card shadow-card",
      /** Marketing / profile cards — deeper shadow, lifts on hover. */
      elevated:
        "border border-border bg-card shadow-elevated transition-all duration-300 ease-spring hover:-translate-y-1",
      /** The one card per view that owns the room. Light text inside. */
      forest: "bg-forest text-paper shadow-elevated",
      /** Quiet inset panel (filters, secondary info). */
      outline: "border border-border bg-transparent",
    },
  },
  defaultVariants: { variant: "flat" },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

function Card({ className, variant, ...props }: CardProps) {
  return <div className={cn(cardVariants({ variant }), className)} {...props} />;
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />;
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-title font-bold leading-tight", className)}
      {...props}
    />
  );
}

function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-3 p-6 pt-0", className)} {...props} />;
}

export { Card, cardVariants, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
