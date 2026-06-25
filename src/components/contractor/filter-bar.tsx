"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const SORTS = [
  { value: "rating", label: "Top rated" },
  { value: "price", label: "Lowest price" },
  { value: "jobs", label: "Most jobs done" },
];

const RATINGS = [
  { value: "", label: "Any rating" },
  { value: "4.5", label: "4.5+ stars" },
  { value: "4", label: "4.0+ stars" },
];

export function FilterBar({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  function set(key: string, value: string) {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const selectCls =
    "h-10 rounded-xl border border-input bg-background px-3 text-sm font-medium text-ink focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="mr-auto text-sm text-muted-foreground">
        {total} pro{total === 1 ? "" : "s"} found
      </p>
      <select
        aria-label="Minimum rating"
        className={selectCls}
        value={sp.get("rating") ?? ""}
        onChange={(e) => set("rating", e.target.value)}
      >
        {RATINGS.map((r) => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>
      <select
        aria-label="Sort by"
        className={selectCls}
        value={sp.get("sort") ?? "rating"}
        onChange={(e) => set("sort", e.target.value)}
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
    </div>
  );
}
