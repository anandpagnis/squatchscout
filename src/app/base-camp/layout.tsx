import {
  LayoutDashboard,
  CalendarCheck,
  MessageSquare,
  Heart,
  MapPin,
  Star,
  Settings,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { brand } from "@/lib/brand";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { DashNavItem } from "@/components/dashboard/dashboard-nav";

const NAV: DashNavItem[] = [
  { href: "/base-camp", label: "Overview", icon: <LayoutDashboard />, exact: true },
  { href: "/base-camp/bookings", label: "My bookings", icon: <CalendarCheck /> },
  { href: "/base-camp/messages", label: "Messages", icon: <MessageSquare /> },
  { href: "/base-camp/favorites", label: "Saved pros", icon: <Heart /> },
  { href: "/base-camp/addresses", label: "Addresses", icon: <MapPin /> },
  { href: "/base-camp/reviews", label: "Reviews", icon: <Star /> },
  { href: "/base-camp/settings", label: "Settings", icon: <Settings /> },
];

export default async function BaseCampLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole("customer");
  return (
    <DashboardShell
      area={brand.areas.customer}
      areaKey="base-camp"
      nav={NAV}
      profile={profile}
    >
      {children}
    </DashboardShell>
  );
}
