import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  MapPin,
  Clock,
  Briefcase,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";
import {
  getContractorBySlug,
  getContractorServices,
  getContractorReviews,
} from "@/lib/data/contractors";
import { Avatar } from "@/components/ui/avatar";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import { brand } from "@/lib/brand";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pro = await getContractorBySlug(slug);
  if (!pro) return { title: "Pro not found" };
  return {
    title: pro.business_name,
    description:
      pro.headline ??
      `Book ${pro.business_name} on ${brand.name} — vetted, insured local pro in ${pro.base_city}, ${pro.base_state}.`,
    alternates: { canonical: `/pros/${pro.slug}` },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pro = await getContractorBySlug(slug);
  if (!pro || pro.verification_status !== "approved" || !pro.is_active) notFound();

  const [services, reviews] = await Promise.all([
    getContractorServices(pro.id),
    getContractorReviews(pro.id),
  ]);

  return (
    <>
      <ProJsonLd
        name={pro.business_name}
        rating={pro.rating_avg}
        count={pro.rating_count}
        slug={pro.slug ?? ""}
      />

      <section className="bg-camp">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-orange-dark"
          >
            <ArrowLeft className="size-4" /> Browse services
          </Link>

          <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center">
            <Avatar
              name={pro.business_name}
              src={pro.avatar_url}
              className="size-24 rounded-3xl text-2xl"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-3xl font-extrabold tracking-tight">
                  {pro.business_name}
                </h1>
                <BadgeCheck className="size-6 text-sage-dark" aria-label="Verified" />
              </div>
              {pro.headline && <p className="mt-1 text-lg text-ink-soft">{pro.headline}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ink-soft">
                <Rating value={pro.rating_avg} count={pro.rating_count} />
                {pro.base_city && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-4" /> {pro.base_city}, {pro.base_state}
                  </span>
                )}
                {pro.response_time_mins != null && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-4" /> ~{pro.response_time_mins}m response
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="size-4" /> {pro.jobs_completed} jobs
                </span>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-2">
              <Link
                href={`/book?contractor=${pro.id}`}
                className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
              >
                Book now
              </Link>
              <Link
                href={`/base-camp/messages?contractor=${pro.id}`}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                <MessageSquare /> Message
              </Link>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Badge variant="sage"><ShieldCheck /> Insured</Badge>
            <Badge variant="sage"><BadgeCheck /> Background-checked</Badge>
            <Badge variant="neutral" className="bg-card">
              {pro.years_experience} yrs experience
            </Badge>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-10">
          {pro.bio && (
            <section>
              <h2 className="font-display text-xl font-bold">About</h2>
              <p className="mt-3 leading-relaxed text-ink-soft">{pro.bio}</p>
            </section>
          )}

          <section>
            <h2 className="font-display text-xl font-bold">Services &amp; rates</h2>
            <ul className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {services.map((cs) => (
                <li key={cs.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="font-semibold text-ink">{cs.service?.name ?? "Service"}</p>
                    {cs.service?.description && (
                      <p className="text-sm text-muted-foreground">{cs.service.description}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    {cs.pricing_type === "quote" || cs.price == null ? (
                      <span className="text-sm font-medium text-ink">Custom quote</span>
                    ) : (
                      <>
                        <span className="font-mono text-lg font-semibold text-ink">
                          {formatPrice(cs.price)}
                        </span>
                        <span className="block text-xs text-muted-foreground">{cs.price_unit}</span>
                      </>
                    )}
                  </div>
                </li>
              ))}
              {services.length === 0 && (
                <li className="px-5 py-6 text-sm text-muted-foreground">
                  This pro hasn&apos;t listed services yet.
                </li>
              )}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">
              Reviews {pro.rating_count > 0 && <span className="text-muted-foreground">({pro.rating_count})</span>}
            </h2>
            {reviews.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No reviews yet.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {reviews.map((r) => (
                  <li key={r.id} className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-ink">
                        {r.customer_display_name ?? "Verified customer"}
                      </p>
                      <Rating value={r.rating} />
                    </div>
                    {r.comment && <p className="mt-2 text-sm text-ink-soft">{r.comment}</p>}
                    {r.contractor_reply && (
                      <div className="mt-3 rounded-xl bg-muted px-4 py-3 text-sm">
                        <p className="font-semibold text-ink">Reply from {pro.business_name}</p>
                        <p className="mt-1 text-ink-soft">{r.contractor_reply}</p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <p className="text-lg font-bold">Ready to book {pro.business_name}?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick a service and time — pay securely when you confirm.
            </p>
            <Link
              href={`/book?contractor=${pro.id}`}
              className={cn(buttonVariants({ variant: "primary", size: "lg" }), "mt-5 w-full")}
            >
              Book now
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}

function ProJsonLd({
  name,
  rating,
  count,
  slug,
}: {
  name: string;
  rating: number;
  count: number;
  slug: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    url: `/pros/${slug}`,
    ...(count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: rating,
        reviewCount: count,
      },
    }),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
