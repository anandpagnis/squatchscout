import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { roleHome, type Role } from "@/lib/brand";

export { roleFromUser } from "@/lib/roles";

export type Profile = {
  id: string;
  role: Role;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  status: "active" | "suspended";
};

/** Read the JWT-verified user from the session cookie (or null). */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Load the public.users profile row for the current session (or null). */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("users")
    .select("id, role, email, full_name, phone, avatar_url, status")
    .eq("id", user.id)
    .single();

  return (data as Profile | null) ?? null;
}

/** Redirect to /login unless authenticated. Returns the user. */
export async function requireUser(): Promise<User> {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

/** Redirect unless the user has one of the allowed roles. Returns the profile. */
export async function requireRole(role: Role | Role[]): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.status === "suspended") redirect("/suspended");

  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(profile.role)) {
    redirect(roleHome[profile.role] ?? "/");
  }
  return profile;
}
