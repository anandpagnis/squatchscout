import type { Metadata } from "next";
import { Prose, PageHero } from "@/components/brand/prose";

export const metadata: Metadata = {
  title: "About",
  description: "Why SquatchScout exists — making it easy to book trusted local help.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our story"
        title="We make local help easy to find"
        subtitle="Booking a trusted pro shouldn't feel like a wild hunt."
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Prose>
          <p>
            SquatchScout started with a simple frustration: finding a reliable local pro
            for a small job meant endless searching, unanswered calls and crossed fingers.
            We thought booking help should be as easy as ordering a ride.
          </p>
          <h2>What we believe</h2>
          <ul>
            <li>Every pro should be vetted, insured and background-checked.</li>
            <li>Prices should be clear before you book — no surprises.</li>
            <li>Great work deserves real reviews and on-time pay.</li>
          </ul>
          <h2>How it works</h2>
          <p>
            Customers scout their area, compare pros by rating, price and distance, and
            book in a couple of taps. Pros get found, manage their schedule and get paid
            securely. We handle the trust and the plumbing in between.
          </p>
        </Prose>
      </div>
    </>
  );
}
