import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getProfile, getUser } from "@/lib/auth";
import { roleHome } from "@/lib/brand";
import { AuthCard } from "@/components/auth/auth-card";
import { RoleSelectForm } from "@/components/onboarding/role-select-form";

export const metadata: Metadata = { title: "Choose your trail" };

/**
 * First-time OAuth signups land here from /auth/callback: Google gives us no
 * role, so handle_new_user defaulted them to customer and this page asks the
 * same customer-vs-pro question email signup does. Anyone with a role already
 * recorded in user_metadata (every email signup, and OAuth users who chose)
 * is sent straight home.
 */
export default async function OnboardingRolePage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "customer" || user.user_metadata?.role) {
    redirect(roleHome[profile.role]);
  }

  return (
    <AuthCard
      title="Welcome to the expedition"
      subtitle="One quick question — how will you use SquatchScout?"
    >
      <RoleSelectForm />
    </AuthCard>
  );
}
