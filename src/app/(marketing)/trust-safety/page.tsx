import type { Metadata } from "next";
import { ShieldCheck, BadgeCheck, FileCheck, Lock } from "lucide-react";
import { PageHero, Prose } from "@/components/brand/prose";

export const metadata: Metadata = {
  title: "Trust & safety",
  description:
    "How SquatchScout keeps customers and pros safe — verification, insurance, background checks and secure payments.",
};

const PILLARS = [
  { icon: <BadgeCheck />, title: "Identity verified", body: "Every Scout Pro verifies their identity before going live." },
  { icon: <FileCheck />, title: "Insured", body: "Pros carry insurance, with documents on file." },
  { icon: <ShieldCheck />, title: "Background-checked", body: "Pros clear a background check during onboarding." },
  { icon: <Lock />, title: "Secure payments", body: "Payments run through Stripe — we never store card data." },
];

export default function TrustSafetyPage() {
  return (
    <>
      <PageHero
        eyebrow="Trust & safety"
        title="Vetted pros. Secure bookings."
        subtitle="Trust is the whole point — here's how we earn it."
      />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {PILLARS.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-sage-soft text-sage-dark [&_svg]:size-5">
                {p.icon}
              </span>
              <h2 className="mt-4 font-display text-lg font-bold text-ink">{p.title}</h2>
              <p className="mt-1 text-sm text-ink-soft">{p.body}</p>
            </div>
          ))}
        </div>
        <Prose className="mt-10">
          <h2>Escrow-style payments</h2>
          <p>
            When you book, payment is authorized up front and held securely. Funds are only
            released to your pro once the job is marked complete — so you&apos;re covered if
            plans change.
          </p>
          <h2>Real reviews only</h2>
          <p>
            Ratings can only be left by customers with a completed booking, so the stars you
            see reflect real work.
          </p>
        </Prose>
      </div>
    </>
  );
}
