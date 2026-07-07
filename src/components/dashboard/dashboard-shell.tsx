import Link from "next/link";
import { Compass } from "lucide-react";
import { brand } from "@/lib/brand";
import type { Profile } from "@/lib/auth";
import { LogoMark } from "@/components/brand/logo";
import { UserMenu } from "@/components/brand/user-menu";
import { NotificationsBell } from "@/components/notifications/notifications-bell";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { DashboardNav, type DashNavItem } from "./dashboard-nav";

/** Which dashboard this shell hosts — drives the per-area sidebar theme. */
export type DashboardArea = "base-camp" | "den" | "admin";

export function DashboardShell({
  area,
  areaKey,
  nav,
  profile,
  children,
}: {
  /** Human label, e.g. "Base Camp" / "The Den". */
  area: string;
  areaKey: DashboardArea;
  nav: DashNavItem[];
  profile: Profile;
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider data-dashboard={areaKey}>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="lg"
                  tooltip={brand.name}
                  render={<Link href="/" aria-label={`${brand.name} home`} />}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-card">
                    <LogoMark className="size-7" />
                  </span>
                  <span className="grid flex-1 text-left leading-tight">
                    <span className="truncate font-display text-base font-bold">
                      {brand.name}
                    </span>
                    <span className="truncate text-xs opacity-70">{area}</span>
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>{area}</SidebarGroupLabel>
              <SidebarGroupContent>
                <DashboardNav items={nav} />
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Back to site" render={<Link href="/" />}>
                  <Compass />
                  <span>Back to site</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6">
            <SidebarTrigger className="-ml-1.5" />
            <Separator orientation="vertical" className="mr-1 data-vertical:h-4 data-vertical:self-center" />
            <p className="truncate text-sm font-semibold">{area}</p>
            <div className="ml-auto flex items-center gap-2">
              <NotificationsBell userId={profile.id} />
              <UserMenu profile={profile} />
            </div>
          </header>
          <div className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

/** Page header used inside dashboards. */
export function DashboardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
