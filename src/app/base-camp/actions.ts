"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export async function cancelBooking(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase
    .from("bookings")
    .update({ status: "cancelled", cancel_reason: "Cancelled by customer" })
    .eq("id", id);
  revalidatePath("/base-camp/bookings");
  revalidatePath(`/base-camp/bookings/${id}`);
}

export async function addFavorite(formData: FormData) {
  const contractorId = String(formData.get("contractor_id") ?? "");
  if (!contractorId) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("favorites")
    .upsert(
      { customer_id: user.id, contractor_id: contractorId },
      { onConflict: "customer_id,contractor_id", ignoreDuplicates: true },
    );
  revalidatePath("/base-camp/favorites");
}

export async function removeFavorite(formData: FormData) {
  const contractorId = String(formData.get("contractor_id") ?? "");
  if (!contractorId) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("favorites")
    .delete()
    .eq("customer_id", user.id)
    .eq("contractor_id", contractorId);
  revalidatePath("/base-camp/favorites");
}

const addressSchema = z.object({
  label: z.string().trim().optional().or(z.literal("")),
  line1: z.string().trim().min(3, "Enter a street address"),
  line2: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().min(2, "Enter a city"),
  state: z.string().trim().min(2, "Enter a state"),
  zip: z.string().trim().min(3, "Enter a ZIP"),
});

export type AddressState = { error?: string; ok?: boolean };

export async function addAddress(
  _prev: AddressState,
  formData: FormData,
): Promise<AddressState> {
  const parsed = addressSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in again." };

  const { count } = await supabase
    .from("customer_addresses")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", user.id)
    .is("deleted_at", null);

  const { error } = await supabase.from("customer_addresses").insert({
    customer_id: user.id,
    label: parsed.data.label || "Home",
    line1: parsed.data.line1,
    line2: parsed.data.line2 || null,
    city: parsed.data.city,
    state: parsed.data.state,
    zip: parsed.data.zip,
    is_default: (count ?? 0) === 0,
  });
  if (error) return { error: "Couldn't save that address." };

  revalidatePath("/base-camp/addresses");
  return { ok: true };
}

export async function deleteAddress(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase
    .from("customer_addresses")
    .update({ deleted_at: new Date().toISOString(), is_default: false })
    .eq("id", id);
  revalidatePath("/base-camp/addresses");
}

export async function setDefaultAddress(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  // Clear existing default first (partial unique index allows one default).
  await supabase
    .from("customer_addresses")
    .update({ is_default: false })
    .eq("customer_id", user.id)
    .eq("is_default", true);
  await supabase.from("customer_addresses").update({ is_default: true }).eq("id", id);
  revalidatePath("/base-camp/addresses");
}
