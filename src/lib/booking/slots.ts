// Pure slot computation for the booking slot picker. No IO here — the
// server action in app/book/actions.ts gathers rows and calls computeDaySlots
// so the logic stays unit-testable and identical for every entry point.

export type SlotStatus = "available" | "booked" | "blocked" | "past";

export type Slot = {
  /** Exact booking start, ISO — becomes scheduled_start on submit. */
  startISO: string;
  /** Display label, e.g. "09:30". */
  label: string;
  status: SlotStatus;
};

export type DaySlots = {
  /** Calendar date, YYYY-MM-DD. */
  dateISO: string;
  /** False when the pro has no recurring window this weekday. */
  hasWindows: boolean;
  slots: Slot[];
};

export type AvailabilityWindow = {
  day_of_week: number; // 0 = Sunday
  start_time: string; // "08:00:00"
  end_time: string;
};

export type TimeRange = { start: Date; end: Date };

/** Slot starts are offered on this grid within each availability window. */
export const SLOT_STEP_MINS = 30;

function overlaps(aStart: Date, aEnd: Date, r: TimeRange) {
  return aStart < r.end && aEnd > r.start;
}

function atTime(dateISO: string, time: string): Date {
  // Local server time, matching how createBooking parses scheduled_start.
  return new Date(`${dateISO}T${time.length === 5 ? `${time}:00` : time}`);
}

export function computeDaySlots(params: {
  dateISO: string;
  windows: AvailabilityWindow[];
  blocks: TimeRange[];
  booked: TimeRange[];
  durationMins: number;
  now?: Date;
}): DaySlots {
  const { dateISO, windows, blocks, booked, durationMins } = params;
  const now = params.now ?? new Date();
  const weekday = atTime(dateISO, "12:00:00").getDay();
  const todays = windows.filter((w) => w.day_of_week === weekday);

  const slots: Slot[] = [];
  const seen = new Set<string>();
  for (const w of todays) {
    const windowEnd = atTime(dateISO, w.end_time);
    for (
      let start = atTime(dateISO, w.start_time);
      start.getTime() + durationMins * 60_000 <= windowEnd.getTime();
      start = new Date(start.getTime() + SLOT_STEP_MINS * 60_000)
    ) {
      const key = start.toISOString();
      if (seen.has(key)) continue;
      seen.add(key);
      const end = new Date(start.getTime() + durationMins * 60_000);
      let status: SlotStatus = "available";
      if (start <= now) status = "past";
      else if (booked.some((r) => overlaps(start, end, r))) status = "booked";
      else if (blocks.some((r) => overlaps(start, end, r))) status = "blocked";
      slots.push({
        startISO: key,
        label: `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`,
        status,
      });
    }
  }
  slots.sort((a, b) => a.startISO.localeCompare(b.startISO));

  return { dateISO, hasWindows: todays.length > 0, slots };
}

/** YYYY-MM-DD for a Date in local time. */
export function toDateISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** The 7 consecutive dates starting at weekStartISO. */
export function weekDates(weekStartISO: string): string[] {
  const start = atTime(weekStartISO, "12:00:00");
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return toDateISO(d);
  });
}
