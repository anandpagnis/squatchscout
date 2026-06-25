"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { notify } from "@/lib/notify";
import type { SupabaseClient } from "@supabase/supabase-js";

export type DenState = { error?: string; ok?: boolean };

async function myContractorId(supabase: SupabaseClient): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("contractor_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

// ── Jobs ─────────────────────────────────────────────────────────────────────
const ALLOWED_STATUS = ["accepted", "declined", "in_progress", "completed"];

export async function updateJobStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !ALLOWED_STATUS.includes(status)) return;
  const supabase = await createClient();
  const { data: b } = await supabase
    .from("bookings")
    .select("customer_id")
    .eq("id", id)
    .maybeSingle();
  await supabase.from("bookings").update({ status }).eq("id", id);

  const customerId = (b as { customer_id: string } | null)?.customer_id;
  const link = `/base-camp/bookings/${id}`;
  if (customerId) {
    if (status === "accepted")
      await notify(customerId, { type: "booking_accepted", title: "Your pro accepted! 🎉", body: "Pay to lock in your time slot.", link });
    else if (status === "declined")
      await notify(customerId, { type: "booking_declined", title: "Request declined", body: "That pro can't take this one — try another.", link });
    else if (status === "completed")
      await notify(customerId, { type: "booking_completed", title: "Job complete ✅", body: "Leave a review and help others scout.", link });
  }

  revalidatePath("/den/jobs");
  revalidatePath(`/den/jobs/${id}`);
}

// ── Services & pricing ───────────────────────────────────────────────────────
function pricingFromUnit(unit: string): "hourly" | "fixed" | "quote" {
  if (unit === "quote") return "quote";
  if (unit === "per hour") return "hourly";
  return "fixed";
}

const addServiceSchema = z.object({
  service_id: z.string().uuid("Pick a service"),
  price_unit: z.enum(["per hour", "per job", "quote"]),
  price: z.coerce.number().nonnegative().optional(),
});

export async function addService(_prev: DenState, formData: FormData): Promise<DenState> {
  const parsed = addServiceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const contractorId = await myContractorId(supabase);
  if (!contractorId) return { error: "Please log in again." };

  const pricing = pricingFromUnit(parsed.data.price_unit);
  const { error } = await supabase.from("contractor_services").upsert(
    {
      contractor_id: contractorId,
      service_id: parsed.data.service_id,
      pricing_type: pricing,
      price: pricing === "quote" ? null : parsed.data.price ?? null,
      price_unit: parsed.data.price_unit,
      is_active: true,
    },
    { onConflict: "contractor_id,service_id" },
  );
  if (error) return { error: "Couldn't add that service." };

  revalidatePath("/den/services");
  return { ok: true };
}

export async function updateServicePrice(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const price = Number(formData.get("price") ?? 0);
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("contractor_services").update({ price }).eq("id", id);
  revalidatePath("/den/services");
}

export async function toggleService(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const isActive = String(formData.get("is_active") ?? "") === "true";
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("contractor_services").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/den/services");
}

export async function removeService(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("contractor_services").delete().eq("id", id);
  revalidatePath("/den/services");
}

// ── Availability ─────────────────────────────────────────────────────────────
export async function saveAvailability(formData: FormData) {
  const supabase = await createClient();
  const contractorId = await myContractorId(supabase);
  if (!contractorId) return;

  const rows: { contractor_id: string; day_of_week: number; start_time: string; end_time: string }[] = [];
  for (let d = 0; d < 7; d++) {
    if (formData.get(`day_${d}_on`) !== "on") continue;
    const start = String(formData.get(`day_${d}_start`) ?? "08:00");
    const end = String(formData.get(`day_${d}_end`) ?? "17:00");
    if (end <= start) continue;
    rows.push({ contractor_id: contractorId, day_of_week: d, start_time: start, end_time: end });
  }

  await supabase.from("availability").delete().eq("contractor_id", contractorId);
  if (rows.length) await supabase.from("availability").insert(rows);
  revalidatePath("/den/schedule");
}

const blockSchema = z.object({
  start_datetime: z.string().min(1),
  end_datetime: z.string().min(1),
  reason: z.string().trim().optional().or(z.literal("")),
});

export async function addBlock(_prev: DenState, formData: FormData): Promise<DenState> {
  const parsed = blockSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Pick a valid start and end." };
  const supabase = await createClient();
  const contractorId = await myContractorId(supabase);
  if (!contractorId) return { error: "Please log in again." };

  const start = new Date(parsed.data.start_datetime);
  const end = new Date(parsed.data.end_datetime);
  if (Number.isNaN(start.getTime()) || end <= start) return { error: "End must be after start." };

  const { error } = await supabase.from("availability_blocks").insert({
    contractor_id: contractorId,
    start_datetime: start.toISOString(),
    end_datetime: end.toISOString(),
    reason: parsed.data.reason || null,
  });
  if (error) return { error: "Couldn't add time off." };
  revalidatePath("/den/schedule");
  return { ok: true };
}

export async function removeBlock(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("availability_blocks").delete().eq("id", id);
  revalidatePath("/den/schedule");
}

// ── Profile & go-live ────────────────────────────────────────────────────────
const profileSchema = z.object({
  business_name: z.string().trim().min(2, "Business name is required"),
  headline: z.string().trim().max(120).optional().or(z.literal("")),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  base_city: z.string().trim().optional().or(z.literal("")),
  base_state: z.string().trim().optional().or(z.literal("")),
  service_radius_miles: z.coerce.number().int().min(1).max(200),
  years_experience: z.coerce.number().int().min(0).max(80),
});

export async function updateDenProfile(_prev: DenState, formData: FormData): Promise<DenState> {
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const supabase = await createClient();
  const contractorId = await myContractorId(supabase);
  if (!contractorId) return { error: "Please log in again." };

  const { error } = await supabase
    .from("contractor_profiles")
    .update({
      business_name: parsed.data.business_name,
      headline: parsed.data.headline || null,
      bio: parsed.data.bio || null,
      base_city: parsed.data.base_city || null,
      base_state: parsed.data.base_state || null,
      service_radius_miles: parsed.data.service_radius_miles,
      years_experience: parsed.data.years_experience,
    })
    .eq("id", contractorId);
  if (error) return { error: "Couldn't save your profile." };

  revalidatePath("/den/settings");
  revalidatePath("/den");
  return { ok: true };
}

export async function toggleGoLive(formData: FormData) {
  const isActive = String(formData.get("is_active") ?? "") === "true";
  const supabase = await createClient();
  const contractorId = await myContractorId(supabase);
  if (!contractorId) return;
  await supabase.from("contractor_profiles").update({ is_active: isActive }).eq("id", contractorId);
  revalidatePath("/den");
  revalidatePath("/den/settings");
}
