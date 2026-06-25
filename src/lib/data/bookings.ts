import { createClient } from "@/lib/supabase/server";
import type { Booking, BookingStatus } from "@/lib/types";

const BASE =
  "id, booking_number, customer_id, contractor_id, service_id, status, scheduled_start, scheduled_end, address_line1, city, state, zip, job_notes, quoted_price, final_price, tip, platform_fee, contractor_payout, created_at";

export async function listCustomerBookings(customerId: string): Promise<Booking[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select(`${BASE}, service:services(name, slug), contractor:contractor_profiles(business_name, slug, avatar_url)`)
    .eq("customer_id", customerId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as Booking[];
}

export async function listContractorBookings(
  contractorId: string,
  statuses?: BookingStatus[],
): Promise<Booking[]> {
  const supabase = await createClient();
  let q = supabase
    .from("bookings")
    .select(`${BASE}, service:services(name, slug)`)
    .eq("contractor_id", contractorId)
    .is("deleted_at", null);
  if (statuses?.length) q = q.in("status", statuses);
  const { data } = await q.order("created_at", { ascending: false });
  return (data ?? []) as unknown as Booking[];
}

/** A single booking visible to the current user (RLS scopes access). */
export async function getBooking(id: string): Promise<Booking | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select(`${BASE}, service:services(name, slug), contractor:contractor_profiles(business_name, slug, avatar_url)`)
    .eq("id", id)
    .maybeSingle();
  return (data as unknown as Booking | null) ?? null;
}
