"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { notify } from "@/lib/notify";

async function contractorUserId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  contractorId: string,
) {
  const { data } = await supabase
    .from("contractor_profiles")
    .select("user_id")
    .eq("id", contractorId)
    .maybeSingle();
  return (data as { user_id: string } | null)?.user_id ?? null;
}

export async function approveContractor(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase
    .from("contractor_profiles")
    .update({
      verification_status: "approved",
      background_check_status: "passed",
      payouts_enabled: true,
      is_active: true,
    })
    .eq("id", id);
  const userId = await contractorUserId(supabase, id);
  if (userId)
    await notify(userId, {
      type: "verification_approved",
      title: "You're approved! 🎉",
      body: "Your account is verified and live. Start taking bookings.",
      link: "/den",
    });
  revalidatePath("/admin/contractors");
}

export async function rejectContractor(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase
    .from("contractor_profiles")
    .update({ verification_status: "rejected", is_active: false })
    .eq("id", id);
  const userId = await contractorUserId(supabase, id);
  if (userId)
    await notify(userId, {
      type: "verification_rejected",
      title: "Application update",
      body: "We couldn't approve your application yet. Check your email for details.",
      link: "/den/settings",
    });
  revalidatePath("/admin/contractors");
}

export async function setUserStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["active", "suspended"].includes(status)) return;
  const supabase = await createClient();
  await supabase.from("users").update({ status }).eq("id", id);
  revalidatePath("/admin/users");
}

export async function deleteReview(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("reviews").delete().eq("id", id);
  revalidatePath("/admin/reviews");
}

export async function togglePromo(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active") ?? "") === "true";
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("promo_codes").update({ active }).eq("id", id);
  revalidatePath("/admin/promos");
}

const promoSchema = z.object({
  code: z.string().trim().min(3, "Code too short"),
  type: z.enum(["percent", "fixed"]),
  value: z.coerce.number().positive("Value must be positive"),
  max_uses: z.coerce.number().int().positive().optional(),
  days_valid: z.coerce.number().int().positive().default(90),
});

export type PromoFormState = { error?: string; ok?: boolean };

export async function addPromo(_prev: PromoFormState, formData: FormData): Promise<PromoFormState> {
  const parsed = promoSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const supabase = await createClient();
  const expires = new Date(Date.now() + parsed.data.days_valid * 86_400_000).toISOString();
  const { error } = await supabase.from("promo_codes").insert({
    code: parsed.data.code.toUpperCase(),
    type: parsed.data.type,
    value: parsed.data.value,
    max_uses: parsed.data.max_uses ?? null,
    expires_at: expires,
    active: true,
  });
  if (error) return { error: "Couldn't create that code (maybe it exists)." };
  revalidatePath("/admin/promos");
  return { ok: true };
}
