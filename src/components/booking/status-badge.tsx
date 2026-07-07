import { Badge, type BadgeProps } from "@/components/ui/badge";
import { BOOKING_STATUS_LABEL, type BookingStatus } from "@/lib/types";

// One semantic mapping for booking state, used everywhere a status appears:
// neutral = awaiting/ended quietly, info = acknowledged, forest = locked in,
// warning = in flight, success = done, danger = money/plan went sideways.
const VARIANT: Record<BookingStatus, BadgeProps["variant"]> = {
  requested: "neutral",
  accepted: "info",
  scheduled: "forest",
  in_progress: "warning",
  completed: "success",
  declined: "neutral",
  cancelled: "danger",
  refunded: "danger",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return <Badge variant={VARIANT[status]} dot>{BOOKING_STATUS_LABEL[status]}</Badge>;
}
