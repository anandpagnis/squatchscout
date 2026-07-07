"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export type DashNavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
};

export function DashboardNav({ items }: { items: DashNavItem[] }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenu>
      {items.map((it) => {
        const active = it.exact
          ? pathname === it.href
          : pathname === it.href || pathname.startsWith(`${it.href}/`);
        return (
          <SidebarMenuItem key={it.href}>
            <SidebarMenuButton
              isActive={active}
              tooltip={it.label}
              render={
                <Link
                  href={it.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpenMobile(false)}
                />
              }
            >
              {it.icon}
              <span>{it.label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
