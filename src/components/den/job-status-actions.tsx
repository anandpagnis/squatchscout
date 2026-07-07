import { Check, X, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateJobStatus } from "@/app/den/actions";
import type { Booking } from "@/lib/types";

/**
 * The pro's next moves for a job, keyed off its status:
 * requested → accept/decline, accepted/scheduled → start, in_progress → complete.
 * Customers act through components/base-camp/booking-actions.tsx instead.
 */
export function JobStatusActions({ booking: b }: { booking: Booking }) {
  return (
    <div className="flex flex-wrap gap-3">
      {b.status === "requested" && (
        <>
          <Action id={b.id} status="accepted" label="Accept job" icon={<Check />} />
          <Action id={b.id} status="declined" label="Decline" icon={<X />} variant="outline" />
        </>
      )}
      {(b.status === "accepted" || b.status === "scheduled") && (
        <Action id={b.id} status="in_progress" label="Start job" icon={<Play />} />
      )}
      {b.status === "in_progress" && (
        <Action id={b.id} status="completed" label="Mark complete" icon={<Check />} />
      )}
    </div>
  );
}

function Action({
  id,
  status,
  label,
  icon,
  variant = "primary",
}: {
  id: string;
  status: string;
  label: string;
  icon: React.ReactNode;
  variant?: "primary" | "outline";
}) {
  return (
    <form action={updateJobStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" variant={variant}>
        {icon} {label}
      </Button>
    </form>
  );
}
