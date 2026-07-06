"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const NAV = [
  { href: "/services", label: "Browse services" },
  { href: "/#how", label: "How it works" },
  { href: "/for-contractors", label: "For pros" },
] as const;

function isActive(pathname: string, href: string) {
  if (href.startsWith("/#")) return false; // in-page anchor, never "active"
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Desktop nav with active-route highlighting. */
export function MainNav() {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-1 md:flex">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative rounded-full px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "text-forest"
                : "text-ink-soft hover:bg-muted hover:text-ink",
            )}
          >
            {item.label}
            {active && (
              <motion.span
                layoutId="nav-active"
                className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-amber"
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/** Mobile hamburger + slide-down panel. Auth state comes from the server shell. */
export function MobileMenu({
  authed,
  areaHref,
  areaLabel,
}: {
  authed: boolean;
  areaHref?: string;
  areaLabel?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-muted"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-full border-b border-border bg-card shadow-elevated"
          >
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-base font-medium transition-colors",
                    isActive(pathname, item.href)
                      ? "bg-forest-soft text-forest"
                      : "text-ink hover:bg-muted",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-2 flex gap-2 border-t border-border pt-3">
                {authed && areaHref ? (
                  <Link
                    href={areaHref}
                    onClick={close}
                    className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "flex-1")}
                  >
                    Go to {areaLabel}
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={close}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1")}
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      onClick={close}
                      className={cn(buttonVariants({ variant: "primary", size: "sm" }), "flex-1")}
                    >
                      Get started
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
