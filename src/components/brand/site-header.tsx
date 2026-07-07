import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { NotificationsBell } from "@/components/notifications/notifications-bell";
import { MainNav, MobileMenu } from "@/components/brand/header-nav";
import { AREA_LABEL, UserMenu } from "@/components/brand/user-menu";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { roleHome } from "@/lib/brand";
import { getProfile } from "@/lib/auth";

export async function SiteHeader() {
  const profile = await getProfile();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="SquatchScout home">
          <Logo />
        </Link>

        <MainNav />

        <div className="flex items-center gap-2">
          {profile ? (
            <>
              <NotificationsBell userId={profile.id} />
              <UserMenu profile={profile} />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className={cn(buttonVariants({ variant: "primary", size: "sm" }), "hidden sm:inline-flex")}
              >
                Get started
              </Link>
            </>
          )}
          <MobileMenu
            authed={!!profile}
            areaHref={profile ? roleHome[profile.role] : undefined}
            areaLabel={profile ? AREA_LABEL[profile.role] : undefined}
          />
        </div>
      </div>
    </header>
  );
}

