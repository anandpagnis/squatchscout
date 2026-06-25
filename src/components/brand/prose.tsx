import { cn } from "@/lib/utils";

/** Lightweight prose styling (no typography plugin needed). */
export function Prose({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-none text-ink-soft",
        "[&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink",
        "[&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-ink",
        "[&_p]:mt-3 [&_p]:leading-relaxed",
        "[&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5",
        "[&_a]:font-medium [&_a]:text-orange-dark [&_a]:underline",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Standard marketing page hero (warm band + title/subtitle). */
export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-camp">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        {eyebrow && (
          <p className="font-display text-sm font-bold uppercase tracking-wide text-orange-dark">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="mt-3 text-lg text-ink-soft">{subtitle}</p>}
      </div>
    </div>
  );
}
