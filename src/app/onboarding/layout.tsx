import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-camp flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8" aria-label="SquatchScout home">
        <Logo markClassName="size-10" />
      </Link>
      {children}
    </main>
  );
}
