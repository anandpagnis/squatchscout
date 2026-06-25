import {
  LayoutDashboard,
  BadgeCheck,
  Users,
  CalendarCheck,
  Star,
  Grid3x3,
  Flag,
  Ticket,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { brand } from "@/lib/brand";
import { SiteHeader } from "@/components/brand/site-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { DashNavItem } from "@/components/dashboard/dashboard-nav";

const NAV: DashNavItem[] = [
  { href: "/admin", label: "Overview", icon: <LayoutDashboard />, exact: true },
  { href: "/admin/contractors", label: "Contractors", icon: <BadgeCheck /> },
  { href: "/admin/users", label: "Users", icon: <Users /> },
  { href: "/admin/bookings", label: "Bookings", icon: <CalendarCheck /> },
  { href: "/admin/reviews", label: "Reviews", icon: <Star /> },
  { href: "/admin/categories", label: "Categories", icon: <Grid3x3 /> },
  { href: "/admin/disputes", label: "Disputes", icon: <Flag /> },
  { href: "/admin/promos", label: "Promos", icon: <Ticket /> },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("admin");
  return (
    <>
      <SiteHeader />
      <DashboardShell area={brand.areas.admin} nav={NAV}>
        {children}
      </DashboardShell>
    </>
  );
}
