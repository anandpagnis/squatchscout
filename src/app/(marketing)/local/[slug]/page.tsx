import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Wand2 } from "lucide-react";
import { parseLocalSlug } from "@/lib/catalog";
import { getCategoryBySlug } from "@/lib/data/services";
import { listContractorsForCategory } from "@/lib/data/contractors";
import { CategoryIcon } from "@/components/brand/category-icon";
import { ContractorCard } from "@/components/contractor/contractor-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { brand } from "@/lib/brand";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseLocalSlug(slug);
  if (!parsed) return { title: "Local services" };
  const { category, city } = parsed;
  return {
    title: `${category.name} in ${city.name}, ${city.state}`,
    description: `Find top-rated, vetted ${category.name.toLowerCase()} pros in ${city.name}, ${city.state} on ${brand.name}. Compare ratings and prices, then book online.`,
    alternates: { canonical: `/local/${slug}` },
  };
}

export default async function LocalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const parsed = parseLocalSlug(slug);
  if (!parsed) notFound();
  const { category, city } = parsed;

  const cat = await getCategoryBySlug(category.slug);
  const pros = cat ? await listContractorsForCategory(cat.id, { sort: "rating" }) : [];
  // Pros physically in the city rank first.
  pros.sort((a, b) => Number(b.base_city === city.name) - Number(a.base_city === city.name));

  return (
    <>
      <LocalJsonLd category={category.name} city={city.name} state={city.state} slug={slug} />

      <section className="bg-camp trail-dots">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <Badge variant="sage" className="mb-4">
            <MapPin /> {city.name}, {city.state}
          </Badge>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-orange-soft text-orange-dark [&_svg]:size-7">
                <CategoryIcon name={category.icon} />
              </span>
              <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                {category.name} in {city.name}
              </h1>
            </div>
            <Link href={`/book?match=${category.slug}`} className={cn(buttonVariants({ variant: "primary" }))}>
              <Wand2 /> Match me with a pro
            </Link>
          </div>
          <p className="mt-4 max-w-2xl text-ink-soft">
            Book vetted, insured and background-checked {category.name.toLowerCase()} pros serving{" "}
            {city.name}, {city.state}. Compare ratings and prices, then book in a couple of taps.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {pros.length === 0 ? (
          <EmptyState
            icon={<MapPin />}
            title={`No ${category.name.toLowerCase()} pros listed yet`}
            body={`We're still scouting ${city.name}. Check back soon or browse all services.`}
            action={
              <Link href="/services" className={buttonVariants({ variant: "primary" })}>
                Browse services
              </Link>
            }
          />
        ) : (
          <>
            <h2 className="mb-4 font-display text-xl font-bold">
              Top {category.name.toLowerCase()} pros serving {city.name}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pros.map((pro) => (
                <ContractorCard key={pro.id} pro={pro} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function LocalJsonLd({
  category,
  city,
  state,
  slug,
}: {
  category: string;
  city: string;
  state: string;
  slug: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: category,
    areaServed: { "@type": "City", name: city, address: { "@type": "PostalAddress", addressRegion: state } },
    provider: { "@type": "Organization", name: brand.name },
    url: `/local/${slug}`,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
