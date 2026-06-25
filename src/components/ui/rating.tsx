import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({
  value,
  count,
  className,
}: {
  value: number;
  count?: number;
  className?: string;
}) {
  const has = value > 0;
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", className)}>
      <Star className="size-4 fill-primary text-primary" aria-hidden />
      <span className="font-semibold text-ink">{has ? Number(value).toFixed(1) : "New"}</span>
      {count != null && has && (
        <span className="text-muted-foreground">({count})</span>
      )}
    </span>
  );
}
