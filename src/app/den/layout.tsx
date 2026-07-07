import {
  LayoutDashboard,
  Briefcase,
  CalendarRange,
  Tags,
  Wallet,
  Star,
  MessageSquare,
  Settings,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { brand } from "@/lib/brand";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { DashNavItem } from "@/components/dashboard/dashboard-nav";

const NAV: DashNavItem[] = [
  { href: "/den", label: "Overview", icon: <LayoutDashboard />, exact: true },
  { href: "/den/jobs", label: "Jobs", icon: <Briefcase /> },
  { href: "/den/schedule", label: "Schedule", icon: <CalendarRange /> },
  { href: "/den/services", label: "Services & pricing", icon: <Tags /> },
  { href: "/den/earnings", label: "Earnings", icon: <Wallet /> },
  { href: "/den/reviews", label: "Reviews", icon: <Star /> },
  { href: "/den/messages", label: "Messages", icon: <MessageSquare /> },
  { href: "/den/settings", label: "Settings", icon: <Settings /> },
];

export default async function DenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole("contractor");
  return (
    <DashboardShell
      area={brand.areas.contractor}
      areaKey="den"
      nav={NAV}
      profile={profile}
    >
      {children}
    </DashboardShell>
  );
}
