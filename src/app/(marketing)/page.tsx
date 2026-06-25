import Link from "next/link";
import {
  ShieldCheck,
  Star,
  Search,
  CalendarCheck,
  PartyPopper,
  BadgeCheck,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon } from "@/components/brand/category-icon";
import { LogoMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { brand } from "@/lib/brand";
import { CATEGORIES } from "@/lib/catalog";

export default function HomePage() {
  return (
    <>
      <JsonLd />
      <Hero />
      <HowItWorks />
      <Categories />
      <TrustBand />
      <ContractorCta />
    </>
  );
}

function Hero() {
  return (
    <section className="bg-camp trail-dots">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div className="animate-in-up">
          <Badge variant="sage" className="mb-5">
            <MapPin /> Now scouting the Pacific Northwest & beyond
          </Badge>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Book local help <span className="text-orange-dark">without the hunt.</span>
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
              href="/for-contractors"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              {brand.cta.contractor}
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-sage-dark" /> Vetted & insured
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Star className="size-4 fill-primary text-primary" /> 4.9 avg rating
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BadgeCheck className="size-4 text-sage-dark" /> Background-checked
            </span>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-orange-soft/60 blur-2xl" />
          <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
            <div className="flex items-center gap-3">
              <LogoMark className="size-12" />
              <div>
                <p className="font-display text-lg font-bold">We tracked down 12 pros near you</p>
                <p className="text-sm text-muted-foreground">Sorted by rating & distance</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {[
                { n: "Sasquatch Handyman Co.", r: "4.9", d: "2.1 mi", s: "TV mounting" },
                { n: "Evergreen Clean", r: "5.0", d: "3.4 mi", s: "Deep cleaning" },
                { n: "TimberLine Landscaping", r: "4.8", d: "4.0 mi", s: "Lawn & yard" },
              ].map((p) => (
                <div
                  key={p.n}
                  className="flex items-center justify-between rounded-2xl border border-border bg-cream-soft px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-ink">{p.n}</p>
                    <p className="text-xs text-muted-foreground">{p.s}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="inline-flex items-center gap-1 font-semibold">
                      <Star className="size-3.5 fill-primary text-primary" /> {p.r}
                    </p>
                    <p className="text-xs text-muted-foreground">{p.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: <Search />, title: "Scout", body: "Search your area and compare vetted pros by rating, price and distance." },
    { icon: <CalendarCheck />, title: "Book", body: "Pick a time that works, share the details, and pay securely online." },
    { icon: <PartyPopper />, title: "Done", body: "Your pro shows up, does great work, and you leave a review. Easy." },
  ];
  return (
    <section id="how" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Three steps. Zero guesswork.
        </h2>
        <p className="mt-3 text-ink-soft">From “I need help” to “all done” without the back-and-forth.</p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <div key={s.title} className="rounded-2xl border border-border bg-card p-7 shadow-card">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-orange-soft text-orange-dark [&_svg]:size-6">
              {s.icon}
            </div>
            <p className="mt-5 text-sm font-semibold text-sage-dark">Step {i + 1}</p>
            <h3 className="mt-1 font-display text-xl font-bold">{s.title}</h3>
            <p className="mt-2 text-ink-soft">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Categories() {
  return (
    <section className="bg-cream-soft">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              What do you need done?
            </h2>
            <p className="mt-3 text-ink-soft">Browse popular categories — there’s a pro for that.</p>
          </div>
          <Link href="/services" className={buttonVariants({ variant: "ghost" })}>
            See all services <ArrowRight />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/services/${c.slug}`}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-soft"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-sage-soft text-sage-dark transition-colors group-hover:bg-orange-soft group-hover:text-orange-dark [&_svg]:size-6">
                <CategoryIcon name={c.icon} />
              </span>
              <span>
                <span className="block font-semibold text-ink">{c.name}</span>
                <span className="block text-xs text-muted-foreground">{c.blurb}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustBand() {
  const items = [
    { icon: <ShieldCheck />, title: "Vetted & insured", body: "Every Scout Pro is identity-checked and carries insurance." },
    { icon: <BadgeCheck />, title: "Background-checked", body: "Pros clear a background check before they ever go live." },
    { icon: <Star />, title: "Real reviews", body: "Ratings come only from customers with a completed booking." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((it) => (
          <div key={it.title} className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-sage-soft text-sage-dark [&_svg]:size-6">
              {it.icon}
            </span>
            <div>
              <h3 className="font-display text-lg font-bold">{it.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{it.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ContractorCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
      <div className="overflow-hidden rounded-[2rem] bg-ink px-8 py-14 text-center text-cream-soft sm:px-16">
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Got skills? Get scouted.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-cream/80">
          Join SquatchScout as a Scout Pro — get found by local customers, manage your
          schedule, and get paid on time.
        </p>
        <Link
          href="/signup?role=contractor"
          className={cn(buttonVariants({ size: "lg" }), "mt-8")}
        >
          Apply to become a contractor
          <ArrowRight />
        </Link>
      </div>
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
