import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryIcon } from "@/components/brand/category-icon";
import { CATEGORIES } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Browse services",
  description:
    "Browse SquatchScout service categories — handyman, cleaning, plumbing, electrical, yard work, moving and more. Book a vetted local pro.",
};

export default function ServicesPage() {
  return (
    <div className="bg-camp">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">
          Browse services
        </h1>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Pick a category to find vetted local pros near you. Every Scout Pro is
          identity-verified, insured and background-checked.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/services/${c.slug}`}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-soft"
            >
              <span className="flex size-14 items-center justify-center rounded-2xl bg-sage-soft text-sage-dark transition-colors group-hover:bg-orange-soft group-hover:text-orange-dark [&_svg]:size-7">
                <CategoryIcon name={c.icon} />
              </span>
              <span className="flex-1">
                <span className="block text-lg font-bold text-ink">{c.name}</span>
                <span className="block text-sm text-muted-foreground">{c.blurb}</span>
              </span>
              <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-orange-dark" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
