import type { Metadata } from "next";
import Link from "next/link";
import { ForgotForm } from "@/components/auth/forgot-form";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Lost the trail?"
      subtitle="We'll email you a link to set a new password."
      footer={
        <Link href="/login" className="font-semibold text-orange-dark hover:underline">
          Back to log in
        </Link>
      }
    >
      <ForgotForm />
    </AuthCard>
  );
}
