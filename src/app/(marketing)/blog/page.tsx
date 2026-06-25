import type { Metadata } from "next";
import { PageHero } from "@/components/brand/prose";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Blog & resources",
  description: "Tips, guides and stories for booking local help and growing your trade.",
};

const POSTS = [
  { title: "How to find a trustworthy handyman near you", tag: "Customers", read: "4 min" },
  { title: "Spring cleaning checklist: what the pros actually do", tag: "Guides", read: "6 min" },
  { title: "Pricing your services as a new Scout Pro", tag: "For pros", read: "5 min" },
  { title: "5 questions to ask before you book a contractor", tag: "Customers", read: "3 min" },
];

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="The SquatchScout blog"
        subtitle="Tips for booking help and growing your trade."
      />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {POSTS.map((p) => (
            <article
              key={p.title}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-soft"
            >
              <Badge variant="sage" className="self-start">{p.tag}</Badge>
              <h2 className="mt-3 font-display text-lg font-bold text-ink">{p.title}</h2>
              <p className="mt-auto pt-4 text-xs text-muted-foreground">{p.read} read · coming soon</p>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
