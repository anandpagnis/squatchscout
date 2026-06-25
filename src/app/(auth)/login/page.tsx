import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { AuthCard } from "@/components/auth/auth-card";
import { DemoLogins } from "@/components/auth/demo-logins";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const notice = sp.checkEmail
    ? "Check your email to confirm your account, then log in."
    : sp.error
      ? "That link expired or was invalid. Please log in again."
      : undefined;

  return (
    <AuthCard
      title="Welcome back, scout"
      subtitle="Log in to your Base Camp or Den."
      footer={
        <>
          New around here?{" "}
          <Link href="/signup" className="font-semibold text-orange-dark hover:underline">
            Create an account
          </Link>
          <DemoLogins />
        </>
      }
    >
      <LoginForm next={sp.next} notice={notice} />
    </AuthCard>
  );
}
