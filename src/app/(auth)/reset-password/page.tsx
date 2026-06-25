import type { Metadata } from "next";
import { ResetForm } from "@/components/auth/reset-form";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = { title: "Set a new password" };

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Set a new password"
      subtitle="Choose something strong and memorable."
    >
      <ResetForm />
    </AuthCard>
  );
}
