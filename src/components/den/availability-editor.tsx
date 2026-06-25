"use client";

import { useState } from "react";
import { saveAvailability } from "@/app/den/actions";
import { SubmitButton } from "@/components/auth/submit-button";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIMES = Array.from({ length: 16 }, (_, i) => `${String(6 + i).padStart(2, "0")}:00`);

type Row = { day_of_week: number; start_time: string; end_time: string };

export function AvailabilityEditor({ initial }: { initial: Row[] }) {
  const map = new Map(initial.map((r) => [r.day_of_week, r]));
  const [days, setDays] = useState(() =>
    DAYS.map((_, d) => {
      const r = map.get(d);
      return {
        on: !!r,
        start: r ? r.start_time.slice(0, 5) : "08:00",
        end: r ? r.end_time.slice(0, 5) : "17:00",
      };
    }),
  );

  function update(d: number, patch: Partial<{ on: boolean; start: string; end: string }>) {
    setDays((prev) => prev.map((row, i) => (i === d ? { ...row, ...patch } : row)));
  }

  const selectCls =
    "h-9 rounded-lg border border-input bg-background px-2 text-sm disabled:opacity-50 focus-visible:border-primary focus-visible:outline-none";

  return (
    <form action={saveAvailability} className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <h2 className="font-display text-lg font-bold">Weekly hours</h2>
      <ul className="mt-4 divide-y divide-border">
        {DAYS.map((label, d) => (
          <li key={label} className="flex flex-wrap items-center gap-3 py-3">
            <label className="flex w-36 items-center gap-2 font-medium text-ink">
              <input
                type="checkbox"
                name={`day_${d}_on`}
                checked={days[d].on}
                onChange={(e) => update(d, { on: e.target.checked })}
              />
              {label}
            </label>
            {days[d].on ? (
              <div className="flex items-center gap-2 text-sm">
                <select
                  name={`day_${d}_start`}
                  value={days[d].start}
                  onChange={(e) => update(d, { start: e.target.value })}
                  className={selectCls}
                >
                  {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <span className="text-muted-foreground">to</span>
                <select
                  name={`day_${d}_end`}
                  value={days[d].end}
                  onChange={(e) => update(d, { end: e.target.value })}
                  className={selectCls}
                >
                  {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Unavailable</span>
            )}
          </li>
        ))}
      </ul>
      <SubmitButton className="mt-4">Save hours</SubmitButton>
    </form>
  );
}
