import { Badge, type BadgeProps } from "@/components/ui/badge";
import { BOOKING_STATUS_LABEL, type BookingStatus } from "@/lib/types";

const VARIANT: Record<BookingStatus, BadgeProps["variant"]> = {
  requested: "warning",
  accepted: "sage",
  scheduled: "sage",
  in_progress: "default",
  completed: "success",
  declined: "destructive",
  cancelled: "neutral",
  refunded: "neutral",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return <Badge variant={VARIANT[status]}>{BOOKING_STATUS_LABEL[status]}</Badge>;
}
