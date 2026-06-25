const DEMO = [
  { label: "Customer", email: "jordan@example.com" },
  { label: "Scout Pro", email: "sasquatch.handyman@example.com" },
  { label: "Admin", email: "admin@squatchscout.local" },
];

/** Convenience hint so the seeded app is explorable without hunting for creds. */
export function DemoLogins() {
  return (
    <details className="mt-5 rounded-xl border border-border bg-card/70 p-3 text-left text-xs">
      <summary className="cursor-pointer font-semibold text-ink">
        Demo logins · password: password123
      </summary>
      <ul className="mt-2 space-y-1 text-muted-foreground">
        {DEMO.map((d) => (
          <li key={d.email}>
            <span className="font-medium text-ink">{d.label}</span> —{" "}
            <code className="rounded bg-muted px-1 py-0.5">{d.email}</code>
          </li>
        ))}
      </ul>
    </details>
  );
}
