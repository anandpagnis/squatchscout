import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cancelBooking } from "@/app/base-camp/actions";
import type { Booking } from "@/lib/types";

const CANCELABLE = ["requested", "accepted", "scheduled"];

/**
 * Customer actions on a booking: message the pro, cancel while still allowed.
 * Pros act on the same booking through components/den/job-status-actions.tsx.
 */
export function CustomerBookingActions({ booking }: { booking: Booking }) {
  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href={`/base-camp/messages?contractor=${booking.contractor_id}`}
        className={buttonVariants({ variant: "outline" })}
      >
        Message pro
      </Link>
      {CANCELABLE.includes(booking.status) && (
        <form action={cancelBooking}>
          <input type="hidden" name="id" value={booking.id} />
          <Button type="submit" variant="ghost" className="text-destructive">
            Cancel booking
          </Button>
        </form>
      )}
    </div>
  );
}
