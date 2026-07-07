"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SlotPicker } from "@/components/booking/slot-picker";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BookableService = { id: string; name: string; durationMins: number };

/**
 * Availability preview on a pro's public profile. Picking a slot deep-links
 * into the /book wizard (?start=…) — booking still goes through the single
 * createBooking server action, this never creates anything itself.
 */
export function ProAvailabilityCard({
  contractorId,
  services,
}: {
  contractorId: string;
  services: BookableService[];
}) {
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [slot, setSlot] = useState<{ startISO: string; label: string } | null>(null);
  const selected = services.find((s) => s.id === serviceId);

  if (services.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <p className="text-lg font-bold">Check availability</p>
      {services.length > 1 && (
        <select
          value={serviceId}
          onChange={(e) => {
            setSlot(null);
            setServiceId(e.target.value);
          }}
          aria-label="Service"
          className="mt-3 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      )}
      <div className="mt-4">
        <SlotPicker
          contractorId={contractorId}
          durationMins={selected?.durationMins ?? 120}
          value={slot?.startISO ?? null}
          onSelect={(startISO, label) => setSlot({ startISO, label })}
        />
      </div>
      <Link
        href={
          slot
            ? `/book?contractor=${contractorId}&service=${serviceId}&start=${encodeURIComponent(slot.startISO)}`
            : "#"
        }
        aria-disabled={!slot}
        className={cn(
          buttonVariants({ variant: "primary", size: "lg" }),
          "mt-5 w-full",
          !slot && "pointer-events-none opacity-50",
        )}
      >
        {slot ? `Book ${slot.label}` : "Pick a time to book"} <ArrowRight />
      </Link>
    </div>
  );
}
