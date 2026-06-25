import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const defaultRole = sp.role === "contractor" ? "contractor" : "customer";

  return (
    <AuthCard
      title="Join the expedition"
      subtitle="Book trusted local help — or get scouted as a pro."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-orange-dark hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <SignupForm defaultRole={defaultRole} />
    </AuthCard>
  );
}
