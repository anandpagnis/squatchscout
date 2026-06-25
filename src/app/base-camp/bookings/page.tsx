import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, ChevronRight, Search } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { listCustomerBookings } from "@/lib/data/bookings";
import { DashboardHeader } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/booking/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { ACTIVE_BOOKING_STATUSES, type Booking } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { microcopy } from "@/lib/brand";

export const metadata: Metadata = { title: "My bookings" };

export default async function BookingsPage() {
  const profile = await getProfile();
  if (!profile) return null;

  const bookings = await listCustomerBookings(profile.id);
  const active = bookings.filter((b) => ACTIVE_BOOKING_STATUSES.includes(b.status));
  const past = bookings.filter((b) => !ACTIVE_BOOKING_STATUSES.includes(b.status));

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="My bookings"
        subtitle="Track every job from request to done."
        action={
          <Link href="/services" className={buttonVariants({ variant: "primary" })}>
            <Search /> Book a job
          </Link>
        }
      />

      {bookings.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck />}
          title={microcopy.emptyBookings}
          body="Scout your area and book a vetted local pro."
          action={
            <Link href="/services" className={buttonVariants({ variant: "primary" })}>
              Find a pro
            </Link>
          }
        />
      ) : (
        <>
          <BookingGroup title="Upcoming & in progress" rows={active} emptyHint="Nothing active right now." />
          <BookingGroup title="Past" rows={past} emptyHint="No past jobs yet." />
        </>
      )}
    </div>
  );
}

function BookingGroup({
  title,
  rows,
  emptyHint,
}: {
  title: string;
  rows: Booking[];
  emptyHint: string;
}) {
  return (
    <section>
      <h2 className="mb-3 font-display text-lg font-bold">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyHint}</p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {rows.map((b) => (
            <li key={b.id}>
              <Link
                href={`/base-camp/bookings/${b.id}`}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{b.service?.name ?? "Service"}</p>
                  <p className="text-sm text-muted-foreground">
                    {b.contractor?.business_name ?? "Pro"} ·{" "}
                    {b.scheduled_start
                      ? new Date(b.scheduled_start).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : "Time TBD"}
                  </p>
                </div>
                {b.quoted_price != null && (
                  <span className="hidden font-semibold text-ink sm:block">
                    {formatPrice(b.quoted_price)}
                  </span>
                )}
                <StatusBadge status={b.status} />
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
