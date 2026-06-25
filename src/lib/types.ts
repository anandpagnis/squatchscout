// Domain row shapes for the (currently untyped) Supabase client.
// Run `pnpm gen:types` once the DB is up to generate the full Database type;
// these stay handy for component props.

export type PricingType = "hourly" | "fixed" | "quote";
export type BookingStatus =
  | "requested"
  | "accepted"
  | "declined"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "refunded";
export type QuoteStatus = "sent" | "accepted" | "declined" | "expired";
export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";
export type VerificationStatus = "pending" | "approved" | "rejected";

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  sort_order: number;
}

export interface Service {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  default_pricing_type: PricingType;
  suggested_min_price: number | null;
  est_duration_mins: number | null;
  image_url: string | null;
}

export interface ContractorCard {
  id: string;
  slug: string | null;
  business_name: string;
  headline: string | null;
  avatar_url: string | null;
  base_city: string | null;
  base_state: string | null;
  service_radius_miles: number;
  rating_avg: number;
  rating_count: number;
  jobs_completed: number;
  response_time_mins: number | null;
  years_experience: number;
  /** cheapest non-quote offering in the queried category (added by query) */
  from_price?: number | null;
}

export interface ContractorProfile extends ContractorCard {
  bio: string | null;
  verification_status: VerificationStatus;
  base_lat: number | null;
  base_lng: number | null;
  payouts_enabled: boolean;
  is_active: boolean;
}

export interface ContractorServiceRow {
  id: string;
  contractor_id: string;
  service_id: string;
  pricing_type: PricingType;
  price: number | null;
  price_unit: string;
  is_active: boolean;
  service?: Service | null;
}

export interface Review {
  id: string;
  booking_id: string;
  rating: number;
  comment: string | null;
  customer_display_name: string | null;
  contractor_reply: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  booking_number: string;
  customer_id: string;
  contractor_id: string;
  service_id: string;
  status: BookingStatus;
  scheduled_start: string | null;
  scheduled_end: string | null;
  address_line1: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  job_notes: string | null;
  quoted_price: number | null;
  final_price: number | null;
  tip: number;
  platform_fee: number | null;
  contractor_payout: number | null;
  created_at: string;
  // optional embeds
  service?: Pick<Service, "name" | "slug"> | null;
  contractor?: Pick<ContractorCard, "business_name" | "slug" | "avatar_url"> | null;
}

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  requested: "Requested",
  accepted: "Accepted",
  declined: "Declined",
  scheduled: "Scheduled",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  "requested",
  "accepted",
  "scheduled",
  "in_progress",
];
