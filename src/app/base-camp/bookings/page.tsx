import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, Search } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { listCustomerBookings } from "@/lib/data/bookings";
import { DashboardHeader } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { CustomerBookingGroup } from "@/components/base-camp/booking-list";
import { buttonVariants } from "@/components/ui/button";
import { ACTIVE_BOOKING_STATUSES } from "@/lib/types";
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
          <CustomerBookingGroup title="Upcoming & in progress" rows={active} emptyHint="Nothing active right now." />
          <CustomerBookingGroup title="Past" rows={past} emptyHint="No past jobs yet." />
        </>
      )}
    </div>
  );
}
