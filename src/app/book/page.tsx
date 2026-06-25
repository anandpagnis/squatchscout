import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";
import { requireUser } from "@/lib/auth";
import {
  getContractorById,
  getContractorServices,
  autoMatchContractor,
} from "@/lib/data/contractors";
import { getCategoryBySlug } from "@/lib/data/services";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/empty-state";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { brand } from "@/lib/brand";

export const metadata: Metadata = { title: "Book a pro" };

type Search = { contractor?: string; match?: string; service?: string };

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const user = await requireUser();
  const sp = await searchParams;

  let contractor = sp.contractor ? await getContractorById(sp.contractor) : null;
  let matched = false;
  if (!contractor && sp.match) {
    const cat = await getCategoryBySlug(sp.match);
    if (cat) {
      contractor = await autoMatchContractor(cat.id);
      matched = true;
    }
  }

  if (!contractor || contractor.verification_status !== "approved" || !contractor.is_active) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
        <EmptyState
          icon={<Compass />}
          title="We couldn't find that pro"
          body="They may not be taking bookings right now. Browse other vetted pros near you."
          action={
            <Link href="/services" className={buttonVariants({ variant: "primary" })}>
              Browse services
            </Link>
          }
        />
      </div>
    );
  }

  const [services, { data: addresses }] = await Promise.all([
    getContractorServices(contractor.id),
    (await createClient())
      .from("customer_addresses")
      .select("id, label, line1, line2, city, state, zip, is_default")
      .eq("customer_id", user.id)
      .is("deleted_at", null)
      .order("is_default", { ascending: false }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {matched && (
        <Badge variant="sage" className="mb-4">
          ✨ {brand.name} matched you with a top-rated pro
        </Badge>
      )}

      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-card">
        <Avatar name={contractor.business_name} src={contractor.avatar_url} className="size-14" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-bold">{contractor.business_name}</p>
          <div className="flex flex-wrap items-center gap-x-4 text-sm text-muted-foreground">
            <Rating value={contractor.rating_avg} count={contractor.rating_count} />
            {contractor.base_city && <span>{contractor.base_city}, {contractor.base_state}</span>}
          </div>
        </div>
        {contractor.slug && (
          <Link
            href={`/pros/${contractor.slug}`}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            View profile
          </Link>
        )}
      </div>

      <h1 className="mb-1 font-display text-2xl font-extrabold tracking-tight">Book your job</h1>
      <p className="mb-6 text-ink-soft">A few quick details and you&apos;re set.</p>

      {services.length === 0 ? (
        <EmptyState
          icon={<Compass />}
          title="No services listed yet"
          body="This pro hasn't published bookable services. Try another pro."
        />
      ) : (
        <BookingWizard
          contractorId={contractor.id}
          services={services.map((cs) => ({
            id: cs.service_id,
            name: cs.service?.name ?? "Service",
            pricingType: cs.pricing_type,
            price: cs.price,
            priceUnit: cs.price_unit,
            durationMins: cs.service?.est_duration_mins ?? 120,
          }))}
          addresses={(addresses ?? []) as never}
          preselectServiceId={sp.service}
        />
      )}
    </div>
  );
}
