import type { Metadata } from "next";
import { getMyContractorProfile } from "@/lib/data/contractors";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-shell";
import { AvailabilityEditor } from "@/components/den/availability-editor";
import { AddBlockForm } from "@/components/den/add-block-form";
import { Button } from "@/components/ui/button";
import { removeBlock } from "../actions";

export const metadata: Metadata = { title: "Schedule" };

type Block = { id: string; start_datetime: string; end_datetime: string; reason: string | null };

export default async function DenSchedulePage() {
  const pro = await getMyContractorProfile();
  if (!pro) return null;

  const supabase = await createClient();
  const [{ data: avail }, { data: blocks }] = await Promise.all([
    supabase
      .from("availability")
      .select("day_of_week, start_time, end_time")
      .eq("contractor_id", pro.id),
    supabase
      .from("availability_blocks")
      .select("id, start_datetime, end_datetime, reason")
      .eq("contractor_id", pro.id)
      .order("start_datetime"),
  ]);

  return (
    <div className="space-y-6">
      <DashboardHeader title="Schedule" subtitle="Set your weekly hours and block time off." />

      <AvailabilityEditor initial={(avail ?? []) as never} />

      <div>
        <h2 className="mb-3 font-display text-lg font-bold">Time off</h2>
        {((blocks ?? []) as Block[]).length === 0 ? (
          <p className="text-sm text-muted-foreground">No time off scheduled.</p>
        ) : (
          <ul className="mb-4 space-y-2">
            {((blocks ?? []) as Block[]).map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm"
              >
                <span>
                  <span className="font-medium text-ink">
                    {new Date(b.start_datetime).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    {" → "}
                    {new Date(b.end_datetime).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </span>
                  {b.reason && <span className="text-muted-foreground"> · {b.reason}</span>}
                </span>
                <form action={removeBlock}>
                  <input type="hidden" name="id" value={b.id} />
                  <Button type="submit" variant="ghost" size="sm" className="text-destructive">Remove</Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AddBlockForm />
    </div>
  );
}
