import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Prose, PageHero } from "@/components/brand/prose";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing & fees",
  description:
    "Transparent pricing — customers pay the listed price, pros keep most of it. SquatchScout takes a simple platform fee.",
};

export default function PricingPage() {
  const customer = [
    "Free to browse and book",
    "See the price before you book",
    "Secure online payment",
    "Funds released to your pro only when the job is done",
  ];
  const pro = [
    "No monthly fee — pay only when you earn",
    "15% platform fee per completed booking",
    "Fast, secure payouts via Stripe",
    "Keep 100% of your tips",
  ];

  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Clear pricing, no surprises"
        subtitle="Customers pay the listed price. Pros keep the lion's share."
      />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Plan title="For customers" items={customer} highlight={false} />
          <Plan title="For Scout Pros" items={pro} highlight />
        </div>
        <div className="mt-10">
          <Prose>
            <h2>How the platform fee works</h2>
            <p>
              SquatchScout charges a configurable platform commission (15% by default) on
              each completed booking. The pro&apos;s payout is the job price minus that fee;
              tips are always passed through in full. Payments are held in escrow and
              released to the pro once the job is marked complete.
            </p>
          </Prose>
        </div>
      </div>
    </>
  );
}

function Plan({
  title,
  items,
  highlight,
}: {
  title: string;
  items: string[];
  highlight: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-2xl border-2 border-primary bg-card p-7 shadow-soft"
          : "rounded-2xl border border-border bg-card p-7 shadow-card"
      }
    >
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <ul className="mt-5 space-y-3">
        {items.map((i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-ink-soft">
            <Check className="mt-0.5 size-4 shrink-0 text-sage-dark" />
            {i}
          </li>
        ))}
      </ul>
      <Link
        href={highlight ? "/signup?role=contractor" : "/services"}
        className={cn(
          buttonVariants({ variant: highlight ? "primary" : "outline", size: "md" }),
          "mt-6",
        )}
      >
        {highlight ? "Become a pro" : "Find a pro"}
      </Link>
    </div>
  );
}
