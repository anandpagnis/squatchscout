import { cn } from "@/lib/utils";

/** Loading placeholder using the brand shimmer (see globals.css .skeleton). */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("skeleton rounded-xl", className)} {...props} />;
}

export { Skeleton };
