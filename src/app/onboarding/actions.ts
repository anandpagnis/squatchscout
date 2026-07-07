"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { roleHome, type Role } from "@/lib/brand";
import { chooseRoleSchema, firstZodError } from "@/lib/validations";
import type { AuthState } from "@/app/(auth)/actions";

/**
 * Post-signup role choice. Two callers, one transition:
 *  - /onboarding/role — first-time Google OAuth users (no role in
 *    user_metadata; handle_new_user already defaulted them to customer).
 *  - /base-camp/become-a-pro — existing customers upgrading to contractor.
 *
 * The role change itself runs on the service-role client: RLS +
 * guard_user_sensitive_fields (relaxed for `auth.uid() is null` in migration
 * 09) block browser-originated role writes, so this action re-verifies the
 * session and the current role before escalating.
 */
export async function chooseRoleAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = chooseRoleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstZodError(parsed.error) };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile) return { error: "We couldn't load your account. Please try again." };

  // Only customers ever land here; send contractors/admins home untouched.
  if (profile.role !== "customer") redirect(roleHome[profile.role as Role]);

  if (parsed.data.role === "customer") {
    // Already a customer in the DB — just record the explicit choice in
    // user_metadata so the OAuth callback stops routing them to onboarding.
    // user_metadata is client-forgeable and carries no authority: roleFromUser
    // prefers app_metadata, and RLS reads public.users.role.
    const { error } = await supabase.auth.updateUser({ data: { role: "customer" } });
    if (error) return { error: "Something went wrong saving your choice. Please try again." };
    revalidatePath("/", "layout");
    redirect(roleHome.customer);
  }

  // Customer → contractor upgrade.
  const business_name = parsed.data.business_name!;
  const admin = createAdminClient();

  // 1. Profile row first — a stray owner-scoped row is harmless if a later
  //    step fails, whereas a contractor with no profile breaks every den page.
  const { error: cpErr } = await admin
    .from("contractor_profiles")
    .upsert({ user_id: user.id, business_name }, { onConflict: "user_id" });
  if (cpErr) return { error: "We couldn't create your pro profile. Please try again." };

  // 2. Authoritative role.
  const { error: roleErr } = await admin
    .from("users")
    .update({ role: "contractor" })
    .eq("id", user.id);
  if (roleErr) return { error: "We couldn't update your account role. Please try again." };

  // 3. Mirror into JWT metadata (routing reads app_metadata.role). If this
  //    fails the proxy and requireRole disagree and redirect-loop, so roll the
  //    DB role back rather than leave the account split-brained.
  const { error: metaErr } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: { role: "contractor" },
    user_metadata: { role: "contractor", business_name },
  });
  if (metaErr) {
    await admin.from("users").update({ role: "customer" }).eq("id", user.id);
    return { error: "We couldn't finish the upgrade. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect(roleHome.contractor);
}
