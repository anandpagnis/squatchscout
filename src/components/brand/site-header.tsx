import Link from "next/link";
import { ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/avatar";
import { NotificationsBell } from "@/components/notifications/notifications-bell";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { brand, roleHome } from "@/lib/brand";
import { getProfile, type Profile } from "@/lib/auth";
import { signOutAction } from "@/app/(auth)/actions";

const NAV = [
  { href: "/services", label: "Browse services" },
  { href: "/#how", label: "How it works" },
  { href: "/for-contractors", label: "For pros" },
];

const AREA_LABEL: Record<Profile["role"], string> = {
  customer: brand.areas.customer,
  contractor: brand.areas.contractor,
  admin: brand.areas.admin,
};

export async function SiteHeader() {
  const profile = await getProfile();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="SquatchScout home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-muted hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

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
              <Link href="/signup" className={buttonVariants({ variant: "primary", size: "sm" })}>
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function UserMenu({ profile }: { profile: Profile }) {
  const area = roleHome[profile.role];

  return (
    <details className="group relative [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2.5 shadow-xs transition-colors hover:bg-muted">
        <Avatar name={profile.full_name} src={profile.avatar_url} className="size-8" />
        <span className="hidden text-sm font-semibold text-ink sm:inline">
          {profile.full_name?.split(" ")[0] ?? "Scout"}
        </span>
        <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>

      <div className="absolute right-0 z-50 mt-2 w-60 rounded-2xl border border-border bg-card p-2 shadow-soft">
        <div className="px-3 py-2">
          <p className="truncate text-sm font-semibold text-ink">{profile.full_name}</p>
          <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
        </div>
        <div className="my-1 border-t border-border" />
        <MenuLink href={area} icon={<LayoutDashboard />}>
          Go to {AREA_LABEL[profile.role]}
        </MenuLink>
        <div className="my-1 border-t border-border" />
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-ink transition-colors hover:bg-muted [&_svg]:size-4 [&_svg]:text-muted-foreground"
          >
            <LogOut />
            Log out
          </button>
        </form>
      </div>
    </details>
  );
}

function MenuLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-muted [&_svg]:size-4 [&_svg]:text-muted-foreground"
    >
      {icon}
      {children}
    </Link>
  );
}
