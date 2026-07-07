import { cn } from "@/lib/utils";

function initialsOf(name?: string | null) {
  if (!name) return "🐾";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({
  name,
  src,
  className,
}: {
  name?: string | null;
  src?: string | null;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-forest-soft text-sm font-semibold text-forest ring-1 ring-border",
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name ?? "avatar"} className="size-full object-cover" />
      ) : (
        initialsOf(name)
      )}
    </span>
  );
}
