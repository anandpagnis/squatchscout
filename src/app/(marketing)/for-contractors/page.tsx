import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarRange,
  Wallet,
  Megaphone,
  ShieldCheck,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Become a Scout Pro",
  description:
    "Got skills? Get scouted. Join SquatchScout to get found by local customers, manage your schedule and get paid on time.",
};

export default function ForContractorsPage() {
  const perks = [
    { icon: <Megaphone />, title: "Get found", body: "Show up in local search the moment a customer needs your skills." },
    { icon: <CalendarRange />, title: "Own your schedule", body: "Set availability and rates. Accept the jobs you want." },
    { icon: <Wallet />, title: "Get paid on time", body: "Secure payouts via Stripe after each completed job." },
    { icon: <ShieldCheck />, title: "Build trust", body: "Verified badges and real reviews help you win more work." },
  ];

  return (
    <>
      <section className="bg-camp trail-dots">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <Badge variant="sage" className="mb-5">For Scout Pros</Badge>
          <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            {brand.cta.contractorShort}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink-soft">
            Join {brand.name} and grow your business — get found by local customers,
            manage your bookings, and get paid without the chase.
          </p>
          <Link
            href="/signup?role=contractor"
            className={cn(buttonVariants({ size: "lg" }), "mt-8")}
          >
            Apply to become a contractor
            <ArrowRight />
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            Quick application · verification in 1–2 days · no monthly fee
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card p-7 shadow-card">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-orange-soft text-orange-dark [&_svg]:size-6">
                {p.icon}
              </span>
              <h3 className="mt-5 text-lg font-bold">{p.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{p.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
