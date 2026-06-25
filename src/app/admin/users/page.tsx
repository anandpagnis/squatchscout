import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { setUserStatus } from "../actions";

export const metadata: Metadata = { title: "Users · Admin" };

type Row = {
  id: string;
  email: string;
  full_name: string | null;
  role: "customer" | "contractor" | "admin";
  status: "active" | "suspended";
};

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("id, email, full_name, role, status")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (data ?? []) as Row[];

  return (
    <div className="space-y-6">
      <DashboardHeader title="Users" subtitle={`${rows.length} accounts`} />
      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {rows.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div className="min-w-0">
              <p className="font-semibold text-ink">{u.full_name ?? "—"}</p>
              <p className="text-xs text-muted-foreground">{u.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="neutral">{u.role}</Badge>
              <Badge variant={u.status === "active" ? "success" : "destructive"}>{u.status}</Badge>
              {u.role !== "admin" && (
                <form action={setUserStatus}>
                  <input type="hidden" name="id" value={u.id} />
                  <input type="hidden" name="status" value={u.status === "active" ? "suspended" : "active"} />
                  <Button type="submit" variant="ghost" size="sm" className={u.status === "active" ? "text-destructive" : ""}>
                    {u.status === "active" ? "Suspend" : "Reactivate"}
                  </Button>
                </form>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
