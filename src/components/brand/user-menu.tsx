import Link from "next/link";
import { ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { brand, roleHome } from "@/lib/brand";
import type { Profile } from "@/lib/auth";
import { signOutAction } from "@/app/(auth)/actions";

export const AREA_LABEL: Record<Profile["role"], string> = {
  customer: brand.areas.customer,
  contractor: brand.areas.contractor,
  admin: brand.areas.admin,
};

export function UserMenu({ profile }: { profile: Profile }) {
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
