import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="bg-camp flex min-h-svh flex-col items-center justify-center px-4 text-center">
      <LogoMark className="size-16" />
      <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight">
        No tracks here
      </h1>
      <p className="mt-2 max-w-sm text-ink-soft">
        We scouted around but couldn&apos;t find that page. It may be just over the
        next ridge — or not built yet.
      </p>
      <Link href="/" className={cn(buttonVariants({ size: "lg" }), "mt-7")}>
        Back to home base
      </Link>
    </main>
  );
}
