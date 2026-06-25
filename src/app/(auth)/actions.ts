"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { roleFromUser } from "@/lib/roles";
import { roleHome, SITE_URL } from "@/lib/brand";
import {
  signInSchema,
  signUpSchema,
  forgotSchema,
  resetSchema,
  firstZodError,
} from "@/lib/validations";

export type AuthState = { error?: string; message?: string };

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstZodError(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "That email and password don't match. Try again." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = roleFromUser(user) ?? "customer";
  const next = (formData.get("next") as string) || "";

  revalidatePath("/", "layout");
  redirect(next || roleHome[role]);
}

export async function signupAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstZodError(parsed.error) };

  const { role, full_name, email, password, phone, business_name } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${SITE_URL}/auth/callback`,
      data: {
        role,
        full_name,
        phone: phone || null,
        business_name: business_name || null,
      },
    },
  });
  if (error) return { error: error.message };

  // With local email-confirmation disabled the user is signed in immediately.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  revalidatePath("/", "layout");
  if (!user) redirect("/login?checkEmail=1");
  redirect(roleHome[role]);
}

export async function googleAction(): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${SITE_URL}/auth/callback` },
  });
  if (error) redirect("/login?error=google");
  if (data?.url) redirect(data.url);
}

export async function forgotAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = forgotSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstZodError(parsed.error) };

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${SITE_URL}/auth/confirm?next=/reset-password`,
  });
  // Always report success to avoid leaking which emails exist.
  return { message: "Check your email for a reset link." };
}

export async function resetAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = resetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstZodError(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: error.message };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = roleFromUser(user) ?? "customer";
  revalidatePath("/", "layout");
  redirect(roleHome[role]);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
