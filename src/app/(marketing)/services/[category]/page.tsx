import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Compass, Wand2 } from "lucide-react";
import { getCategoryBySlug, getServicesByCategory } from "@/lib/data/services";
import {
  listContractorsForCategory,
  type ContractorSort,
} from "@/lib/data/contractors";
import { CategoryIcon } from "@/components/brand/category-icon";
import { ContractorCard } from "@/components/contractor/contractor-card";
import { FilterBar } from "@/components/contractor/filter-bar";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import { brand } from "@/lib/brand";
import { CATEGORIES } from "@/lib/catalog";

type Params = { category: string };
type Search = { sort?: string; rating?: string; price?: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = CATEGORIES.find((c) => c.slug === category);
  if (!cat) return { title: "Service not found" };
  return {
    title: `${cat.name} near you`,
    description: `Book vetted, insured ${cat.name.toLowerCase()} pros on ${brand.name}. Compare ratings, prices and availability.`,
    alternates: { canonical: `/services/${cat.slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { category: slug } = await params;
  const sp = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [services, pros] = await Promise.all([
    getServicesByCategory(category.id),
    listContractorsForCategory(category.id, {
      sort: (sp.sort as ContractorSort) ?? "rating",
      minRating: sp.rating ? Number(sp.rating) : undefined,
      maxPrice: sp.price ? Number(sp.price) : undefined,
    }),
  ]);

  return (
    <>
      <Breadcrumbs name={category.name} slug={category.slug} />

      <section className="bg-camp">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-orange-dark"
          >
            <ArrowLeft className="size-4" /> All services
          </Link>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <span className="flex size-16 items-center justify-center rounded-2xl bg-orange-soft text-orange-dark [&_svg]:size-8">
                <CategoryIcon name={category.icon ?? "hammer"} />
              </span>
              <div>
                <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="mt-1 text-ink-soft">{category.description}</p>
                )}
              </div>
            </div>
            <Link
              href={`/book?match=${category.slug}`}
              className={cn(buttonVariants({ variant: "primary" }))}
            >
              <Wand2 /> Let SquatchScout match me
            </Link>
          </div>

          {services.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {services.map((s) => (
                <Badge key={s.id} variant="neutral" className="bg-card">
                  {s.name}
                  {s.suggested_min_price != null && (
                    <span className="text-muted-foreground">
                      · from {formatPrice(s.suggested_min_price)}
                    </span>
                  )}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <FilterBar total={pros.length} />

        {pros.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={<Compass />}
              title="No tracks in this area yet"
              body="We couldn't find live pros for these filters. Try widening your search or check back soon."
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pros.map((pro) => (
              <ContractorCard key={pro.id} pro={pro} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function Breadcrumbs({ name, slug }: { name: string; slug: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Services", item: `${brand.name}/services` },
      { "@type": "ListItem", position: 2, name, item: `/services/${slug}` },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
