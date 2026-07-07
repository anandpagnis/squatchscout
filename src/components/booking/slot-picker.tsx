"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarX2, ChevronLeft, ChevronRight } from "lucide-react";
import { getWeekSlots } from "@/app/book/actions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toDateISO, type DaySlots, type SlotStatus } from "@/lib/booking/slots";

const MAX_WEEKS_AHEAD = 8;

const DAY_LABEL = new Intl.DateTimeFormat("en-US", { weekday: "short" });
const DATE_LABEL = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const RANGE_LABEL = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" });

function noon(dateISO: string) {
  return new Date(`${dateISO}T12:00:00`);
}
function addDays(dateISO: string, n: number) {
  const d = noon(dateISO);
  d.setDate(d.getDate() + n);
  return toDateISO(d);
}

const STATUS_HINT: Record<Exclude<SlotStatus, "available">, string> = {
  booked: "Already booked",
  blocked: "Pro is unavailable (time off)",
  past: "In the past",
};

export function SlotPicker({
  contractorId,
  durationMins,
  value,
  onSelect,
  initialStartISO,
}: {
  contractorId: string;
  durationMins: number;
  /** Currently selected slot start (ISO) or null. */
  value: string | null;
  onSelect: (startISO: string, label: string, dateISO: string) => void;
  /** Optional deep-linked slot (e.g. from /pros/[slug]) to open on. */
  initialStartISO?: string;
}) {
  const todayISO = toDateISO(new Date());
  const initialDate =
    initialStartISO && !Number.isNaN(new Date(initialStartISO).getTime())
      ? toDateISO(new Date(initialStartISO))
      : todayISO;

  const [weekStart, setWeekStart] = useState(
    initialDate >= todayISO ? initialDate : todayISO,
  );
  const [pickedDate, setPickedDate] = useState<string | null>(null);
  // Fetch results are keyed by their query; a stale key renders as loading.
  // (No synchronous setState in the effect — react-hooks/set-state-in-effect.)
  const queryKey = `${contractorId}|${durationMins}|${weekStart}`;
  const [result, setResult] = useState<{
    key: string;
    days: DaySlots[] | null;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getWeekSlots({
      contractor_id: contractorId,
      week_start: weekStart,
      duration_mins: durationMins,
    }).then((res) => {
      if (cancelled) return;
      setResult(
        "error" in res
          ? { key: queryKey, days: null, error: res.error }
          : { key: queryKey, days: res.days, error: null },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [contractorId, durationMins, weekStart, queryKey]);

  const days = result?.key === queryKey ? result.days : null;
  const error = result?.key === queryKey ? result.error : null;

  // The user's pick wins while it exists in this week; otherwise default to
  // the first day with an open slot.
  const selectedDate = useMemo(() => {
    if (!days) return null;
    if (pickedDate && days.some((d) => d.dateISO === pickedDate)) return pickedDate;
    const firstOpen = days.find((d) => d.slots.some((s) => s.status === "available"));
    return (firstOpen ?? days[0])?.dateISO ?? null;
  }, [days, pickedDate]);

  const selectedDay = useMemo(
    () => days?.find((d) => d.dateISO === selectedDate) ?? null,
    [days, selectedDate],
  );
  const weekIsEmpty =
    days != null && !days.some((d) => d.slots.some((s) => s.status === "available"));

  const maxWeekStart = addDays(todayISO, MAX_WEEKS_AHEAD * 7 - 7);
  const canPrev = weekStart > todayISO;
  const canNext = addDays(weekStart, 7) <= maxWeekStart;

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canPrev || days == null}
          onClick={() => setWeekStart((w) => {
            const prev = addDays(w, -7);
            return prev < todayISO ? todayISO : prev;
          })}
          aria-label="Previous week"
        >
          <ChevronLeft />
        </Button>
        <p className="text-sm font-semibold text-ink">
          {RANGE_LABEL.format(noon(weekStart))} – {RANGE_LABEL.format(noon(addDays(weekStart, 6)))}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canNext || days == null}
          onClick={() => setWeekStart((w) => addDays(w, 7))}
          aria-label="Next week"
        >
          <ChevronRight />
        </Button>
      </div>

      {/* Day strip */}
      <div className="grid grid-cols-7 gap-1.5">
        {days == null ? (
          Array.from({ length: 7 }, (_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))
        ) : (
          days.map((d) => {
            const open = d.slots.filter((s) => s.status === "available").length;
          const disabled = !d.hasWindows || d.slots.length === 0;
          const date = noon(d.dateISO);
          return (
            <button
              key={d.dateISO}
              type="button"
              disabled={disabled}
              title={disabled ? "No working hours this day" : undefined}
              onClick={() => setPickedDate(d.dateISO)}
              className={cn(
                "flex flex-col items-center rounded-xl border-2 px-1 py-2 text-xs transition-colors",
                selectedDate === d.dateISO
                  ? "border-primary bg-orange-soft/50"
                  : "border-border",
                disabled
                  ? "cursor-not-allowed opacity-40"
                  : "cursor-pointer hover:border-ink/20",
              )}
            >
              <span className="font-semibold text-ink">{DAY_LABEL.format(date)}</span>
              <span className="text-muted-foreground">{DATE_LABEL.format(date)}</span>
              <span
                className={cn(
                  "mt-0.5 text-[10px] font-medium",
                  open > 0 ? "text-sage-dark" : "text-muted-foreground",
                )}
              >
                {disabled ? "—" : open > 0 ? `${open} open` : "full"}
              </span>
            </button>
          );
          })
        )}
      </div>

      {/* Time grid */}
      {error ? (
        <p className="rounded-xl bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
          {error}
        </p>
      ) : days == null ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-10 rounded-xl" />
          ))}
        </div>
      ) : weekIsEmpty ? (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-muted px-4 py-8 text-center">
          <CalendarX2 className="size-6 text-muted-foreground" />
          <p className="text-sm font-medium text-ink">No availability this week</p>
          <p className="text-xs text-muted-foreground">
            Try another week with the arrows above.
          </p>
        </div>
      ) : selectedDay == null || selectedDay.slots.length === 0 ? (
        <p className="rounded-xl bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
          No working hours this day — pick another date.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {selectedDay.slots.map((s) => {
              const taken = s.status !== "available";
              return (
                <button
                  key={s.startISO}
                  type="button"
                  disabled={taken}
                  title={taken ? STATUS_HINT[s.status as keyof typeof STATUS_HINT] : undefined}
                  onClick={() => onSelect(s.startISO, s.label, selectedDay.dateISO)}
                  className={cn(
                    "rounded-xl border-2 px-2 py-2 font-mono text-sm font-semibold transition-colors",
                    value === s.startISO
                      ? "border-primary bg-orange-soft/50 text-ink"
                      : "border-border text-ink",
                    taken
                      ? "cursor-not-allowed border-dashed text-muted-foreground opacity-50 line-through"
                      : "cursor-pointer hover:border-ink/20",
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Struck-through times are already booked or blocked off — hover for the
            reason. Each slot fits this service&apos;s ~{Math.round(durationMins / 60 * 10) / 10}h duration.
          </p>
        </>
      )}
    </div>
  );
}
