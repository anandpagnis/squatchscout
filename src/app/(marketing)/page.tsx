import Link from "next/link";
import {
  ShieldCheck,
  Star,
  Search,
  CalendarCheck,
  MessagesSquare,
  PartyPopper,
  BadgeCheck,
  MapPin,
  ArrowRight,
  Lock,
  FileCheck2,
  Quote,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { CategoryTile } from "@/components/brand/category-icon";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import { brand } from "@/lib/brand";
import { CATEGORIES } from "@/lib/catalog";

export default function HomePage() {
  return (
    <>
      <JsonLd />
      <Hero />
      <TrustSignals />
      <HowItWorks />
      <Categories />
      <Testimonials />
      <ContractorTeaser />
    </>
  );
}

/* ── Hero — split dual-persona: customer side owns the left, the contractor
      rail is its own dark panel (not an afterthought link). ─────────────── */
function Hero() {
  return (
    <section className="bg-camp trail-dots">
      <div className="mx-auto grid max-w-7xl items-stretch gap-8 px-4 pb-14 pt-16 sm:px-6 lg:grid-cols-[7fr_5fr] lg:pb-20 lg:pt-24">
        {/* Customer side */}
        <div className="animate-in-up flex flex-col justify-center">
          <Badge variant="sage" className="mb-5 self-start">
            <MapPin /> Now scouting the Pacific Northwest &amp; beyond
          </Badge>
          <h1 className="text-display font-display text-ink">
            Book local help <span className="text-amber-deep">without the hunt.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-soft">
            {brand.name} tracks down trusted, vetted local pros for repairs, cleaning,
            yard work, moving and more. Scout, book, done.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/services" className={cn(buttonVariants({ size: "lg" }))}>
              {brand.cta.customer}
              <ArrowRight />
            </Link>
            <Link
              href="/pros"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Browse Scout Pros
            </Link>
          </div>

          {/* Mono stat strip — numerals get the technical treatment */}
          <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-border pt-6">
            {[
              { k: "4.9", label: "avg. pro rating" },
              { k: "12", label: "service categories" },
              { k: "~45m", label: "typical response" },
            ].map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-mono text-2xl font-semibold text-ink">{s.k}</dd>
                <dd className="mt-0.5 text-xs text-muted-foreground">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Contractor side — deep-forest panel, its own value prop + CTA */}
        <Reveal delay={0.15} className="flex">
          <div className="bg-lodge texture-grain relative flex w-full flex-col justify-between overflow-hidden rounded-[2rem] p-8 shadow-elevated sm:p-10">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-amber">
                For pros
              </p>
              <h2 className="mt-3 font-display text-h2 text-paper">
                {brand.cta.contractorShort}
              </h2>
              <p className="mt-3 max-w-sm text-paper/75">
                Set your services and rates, control your schedule, and get booked by
                local customers — payouts land after every completed job.
              </p>
            </div>
            <div className="mt-8">
              <ul className="space-y-2 text-sm text-paper/80">
                <li className="flex items-center gap-2">
                  <BadgeCheck className="size-4 shrink-0 text-amber" aria-hidden />
                  Keep {Math.round((1 - brand.platformFeeRate) * 100)}% of every job
                </li>
                <li className="flex items-center gap-2">
                  <CalendarCheck className="size-4 shrink-0 text-amber" aria-hidden />
                  Your calendar, your rules
                </li>
              </ul>
              <Link
                href="/for-contractors"
                className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "mt-6 w-full bg-paper text-forest hover:bg-parchment sm:w-auto")}
              >
                Become a Scout Pro
                <ArrowRight />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Trust signals — three different treatments, not three identical cards ── */
function TrustSignals() {
  return (
    <section aria-labelledby="trust-heading" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <Reveal>
        <h2 id="trust-heading" className="font-display text-h2 text-ink">
          Built so you never book blind.
        </h2>
      </Reveal>

      <div className="mt-10 grid gap-6 lg:grid-cols-[3fr_2fr]">
        {/* Wide card: payment protection with a mini receipt mock */}
        <Reveal>
          <div className="grid gap-8 rounded-[2rem] border border-border bg-card p-8 shadow-card sm:grid-cols-2">
            <div>
              <span className="flex size-12 items-center justify-center rounded-2xl bg-amber-soft text-amber-deep">
                <Lock className="size-6" aria-hidden />
              </span>
              <h3 className="mt-5 text-xl font-bold">Pay when it&apos;s booked, not before</h3>
              <p className="mt-2 text-ink-soft">
                Your payment is held securely and only released to the pro once the job
                is done. Something off? Our dispute team steps in.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-cream-soft p-5 text-sm" aria-hidden>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Booking receipt
              </p>
              <dl className="mt-3 space-y-2">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Booking</dt>
                  <dd className="font-mono text-ink">SS-004213</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Deep cleaning</dt>
                  <dd className="font-mono text-ink">$165.00</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <dt className="font-medium text-ink">Held in escrow</dt>
                  <dd className="inline-flex items-center gap-1 font-mono font-semibold text-success">
                    <ShieldCheck className="size-3.5" /> Protected
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </Reveal>

        {/* Stacked pair: vetting checklist + review proof */}
        <div className="flex flex-col gap-6">
          <Reveal delay={0.08}>
            <div className="rounded-[2rem] border border-border bg-card p-8 shadow-card">
              <h3 className="text-xl font-bold">Every pro is vetted first</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
                {["Identity verified", "Background-checked", "Licensed & insured where required"].map((step) => (
                  <li key={step} className="flex items-center gap-2.5">
                    <FileCheck2 className="size-4 shrink-0 text-forest-mid" aria-hidden />
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="rounded-[2rem] bg-forest-soft p-8">
              <div className="flex items-center gap-2">
                <Star className="size-5 fill-primary text-primary" aria-hidden />
                <h3 className="text-xl font-bold text-forest">Reviews you can trust</h3>
              </div>
              <p className="mt-2 text-sm text-forest/80">
                Ratings only come from customers with a completed, paid booking — no
                drive-by reviews, no padding.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ── How it works — numbered trail, mono step markers ── */
function HowItWorks() {
  const steps = [
    { icon: <Search />, title: "Scout", body: "Search your area and compare vetted pros by rating, price and distance." },
    { icon: <MessagesSquare />, title: "Compare", body: "Check real reviews, transparent rates, and message a pro with questions." },
    { icon: <CalendarCheck />, title: "Book", body: "Pick a time that works, share the details, and pay securely online." },
    { icon: <PartyPopper />, title: "Done", body: "Your pro shows up, does great work, and you leave a review. Easy." },
  ];
  return (
    <section id="how" className="bg-cream-soft scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Reveal className="max-w-2xl">
          <h2 className="font-display text-h2 text-ink">Four steps. Zero guesswork.</h2>
          <p className="mt-3 text-ink-soft">
            From &ldquo;I need help&rdquo; to &ldquo;all done&rdquo; without the back-and-forth.
          </p>
        </Reveal>
        <Stagger className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <StaggerItem key={s.title} className="relative border-t-2 border-dashed border-tan pt-6">
              <span className="font-mono text-sm font-semibold text-amber-deep">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="mt-3 flex size-11 items-center justify-center rounded-2xl bg-card text-forest shadow-card [&_svg]:size-5">
                {s.icon}
              </span>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-ink-soft">{s.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ── Category showcase — first real use of CategoryTile ── */
function Categories() {
  return (
    <section aria-labelledby="categories-heading" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="categories-heading" className="font-display text-h2 text-ink">
            What do you need done?
          </h2>
          <p className="mt-3 text-ink-soft">Browse popular categories — there&apos;s a pro for that.</p>
        </div>
        <Link href="/services" className={buttonVariants({ variant: "ghost" })}>
          See all services <ArrowRight />
        </Link>
      </Reveal>

      <Stagger className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {CATEGORIES.map((c) => (
          <StaggerItem key={c.slug}>
            <Link
              href={`/services/${c.slug}`}
              className="group flex h-full items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-soft"
            >
              <CategoryTile name={c.icon} />
              <span>
                <span className="block font-bold text-ink">{c.name}</span>
                <span className="block text-xs text-muted-foreground">{c.blurb}</span>
              </span>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

/* ── Social proof — real seed reviews (see supabase/seed.sql), one featured ── */
const REVIEWS = [
  {
    quote: "Knew exactly what to do. Both fans run quiet.",
    name: "Riley C.",
    rating: 5,
    pro: "BrightSpark Electric",
    service: "Ceiling fan install",
  },
  {
    quote: "Fast, friendly, perfectly level. Highly recommend!",
    name: "Jordan M.",
    rating: 5,
    pro: "Sasquatch Handyman Co.",
    service: "TV mounting",
  },
  {
    quote: "Spotless and on time. Booking again.",
    name: "Jordan M.",
    rating: 5,
    pro: "Evergreen Clean",
    service: "Home cleaning",
  },
  {
    quote: "Solid work, fair price. Tidy too.",
    name: "Riley C.",
    rating: 4,
    pro: "Cascade Plumbing",
    service: "Faucet install",
  },
];

function Testimonials() {
  const [featured, ...rest] = REVIEWS;
  return (
    <section aria-labelledby="reviews-heading" className="bg-cream-soft">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Reveal>
          <h2 id="reviews-heading" className="font-display text-h2 text-ink">
            Tracks left by happy campers
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-[2fr_3fr]">
          {/* Featured quote — forest card, bigger type */}
          <Reveal>
            <figure className="flex h-full flex-col justify-between rounded-[2rem] bg-forest p-8 text-paper shadow-elevated">
              <div>
                <Quote className="size-8 text-amber" aria-hidden />
                <blockquote className="mt-4 font-display text-h3 leading-snug">
                  &ldquo;{featured.quote}&rdquo;
                </blockquote>
              </div>
              <figcaption className="mt-6 text-sm text-paper/75">
                <span className="font-bold text-paper">{featured.name}</span> · {featured.service} with{" "}
                {featured.pro}
              </figcaption>
            </figure>
          </Reveal>

          <Stagger className="grid gap-6 sm:grid-cols-2">
            {rest.map((r) => (
              <StaggerItem key={r.quote} className={r === rest[rest.length - 1] ? "sm:col-span-2" : ""}>
                <figure className="flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-card">
                  <div>
                    <Rating value={r.rating} />
                    <blockquote className="mt-3 text-ink-soft">&ldquo;{r.quote}&rdquo;</blockquote>
                  </div>
                  <figcaption className="mt-4 text-sm text-muted-foreground">
                    <span className="font-bold text-ink">{r.name}</span> · {r.service} with {r.pro}
                  </figcaption>
                </figure>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

/* ── For-contractors teaser ── */
function ContractorTeaser() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <Reveal>
        <div className="bg-lodge texture-grain grid gap-10 overflow-hidden rounded-[2rem] px-8 py-14 sm:px-14 lg:grid-cols-[3fr_2fr] lg:items-center">
          <div>
            <h2 className="font-display text-h2 text-paper">
              Your skills. Your schedule. Our customers.
            </h2>
            <p className="mt-3 max-w-xl text-paper/75">
              Join {brand.name} as a Scout Pro — get found by local customers, quote and
              message in one place, and get paid out after every completed job.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup?role=contractor" className={cn(buttonVariants({ size: "lg" }))}>
                Apply to become a contractor
                <ArrowRight />
              </Link>
              <Link
                href="/for-contractors"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-paper/30 text-paper hover:bg-paper/10",
                )}
              >
                How it works for pros
              </Link>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-6 border-t border-paper/15 pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            {[
              { k: `${Math.round((1 - brand.platformFeeRate) * 100)}%`, label: "of each job is yours" },
              { k: "$0", label: "to join and list services" },
              { k: "6", label: "pro teams already scouting" },
              { k: "24h", label: "typical payout after completion" },
            ].map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-mono text-2xl font-semibold text-amber">{s.k}</dd>
                <dd className="mt-1 text-sm text-paper/70">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Reveal>
    </section>
  );
}

function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: brand.name,
    slogan: brand.tagline,
    description: brand.description,
    areaServed: "US",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "1200",
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
