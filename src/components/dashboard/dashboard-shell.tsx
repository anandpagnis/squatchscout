import { DashboardNav, type DashNavItem } from "./dashboard-nav";

export function DashboardShell({
  area,
  nav,
  children,
}: {
  area: string;
  nav: DashNavItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-8 lg:py-10">
      <aside className="lg:w-60 lg:shrink-0">
        <div className="lg:sticky lg:top-20">
          <p className="mb-3 hidden px-3.5 text-xs font-bold uppercase tracking-wide text-muted-foreground lg:block">
            {area}
          </p>
          <DashboardNav items={nav} />
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
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
