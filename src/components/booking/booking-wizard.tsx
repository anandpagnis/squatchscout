"use client";

import { useActionState, useMemo, useState } from "react";
import { Check, ChevronLeft } from "lucide-react";
import { createBooking, type BookingState } from "@/app/book/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { SubmitButton } from "@/components/auth/submit-button";
import { cn, formatPrice } from "@/lib/utils";
import { brand } from "@/lib/brand";
import type { PricingType } from "@/lib/types";

type ServiceLite = {
  id: string;
  name: string;
  pricingType: PricingType;
  price: number | null;
  priceUnit: string;
  durationMins: number;
};
type AddressLite = {
  id: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  zip: string;
  is_default: boolean;
};

const STEPS = ["Service", "Date & time", "Address", "Review"];
const TIMES = Array.from({ length: 10 }, (_, i) => `${String(8 + i).padStart(2, "0")}:00`);

export function BookingWizard({
  contractorId,
  services,
  addresses,
  preselectServiceId,
}: {
  contractorId: string;
  services: ServiceLite[];
  addresses: AddressLite[];
  preselectServiceId?: string;
}) {
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState(
    preselectServiceId && services.some((s) => s.id === preselectServiceId)
      ? preselectServiceId
      : services[0]?.id ?? "",
  );
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("09:00");

  const defaultAddr = addresses.find((a) => a.is_default) ?? addresses[0];
  const [useNew, setUseNew] = useState(addresses.length === 0);
  const [addressId, setAddressId] = useState(defaultAddr?.id ?? "");
  const [addr, setAddr] = useState({
    line1: defaultAddr?.line1 ?? "",
    line2: defaultAddr?.line2 ?? "",
    city: defaultAddr?.city ?? "",
    state: defaultAddr?.state ?? "",
    zip: defaultAddr?.zip ?? "",
  });
  const [saveAddress, setSaveAddress] = useState(false);
  const [notes, setNotes] = useState("");

  const [state, dispatch] = useActionState<BookingState, FormData>(createBooking, {});

  const selected = useMemo(
    () => services.find((s) => s.id === serviceId),
    [services, serviceId],
  );

  function pickSaved(a: AddressLite) {
    setUseNew(false);
    setAddressId(a.id);
    setAddr({ line1: a.line1, line2: a.line2 ?? "", city: a.city, state: a.state, zip: a.zip });
  }

  const quoted = selected?.pricingType !== "quote" ? selected?.price ?? null : null;
  const fee = quoted ? Math.round(quoted * brand.platformFeeRate * 100) / 100 : null;

  const canNext =
    (step === 0 && !!serviceId) ||
    (step === 1 && !!date && !!time) ||
    (step === 2 && !!addr.line1 && !!addr.city && !!addr.state && !!addr.zip) ||
    step === 3;

  return (
    <div>
      <Stepper step={step} />

      <form action={dispatch} className="mt-6">
        {/* Submitted values */}
        <input type="hidden" name="contractor_id" value={contractorId} />
        <input type="hidden" name="service_id" value={serviceId} />
        <input type="hidden" name="scheduled_start" value={date && time ? `${date}T${time}` : ""} />
        <input type="hidden" name="duration_mins" value={selected?.durationMins ?? 120} />
        <input type="hidden" name="quoted_price" value={quoted ?? ""} />
        <input type="hidden" name="address_id" value={useNew ? "" : addressId} />
        <input type="hidden" name="line1" value={addr.line1} />
        <input type="hidden" name="line2" value={addr.line2} />
        <input type="hidden" name="city" value={addr.city} />
        <input type="hidden" name="state" value={addr.state} />
        <input type="hidden" name="zip" value={addr.zip} />
        <input type="hidden" name="save_address" value={useNew && saveAddress ? "on" : ""} />
        <input type="hidden" name="job_notes" value={notes} />

        {state.error && <Alert variant="error" className="mb-4">{state.error}</Alert>}

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          {/* Step 1 — Service */}
          {step === 0 && (
            <fieldset className="space-y-2">
              <legend className="mb-2 font-display text-lg font-bold">Choose a service</legend>
              {services.map((s) => (
                <label
                  key={s.id}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-colors",
                    serviceId === s.id ? "border-primary bg-orange-soft/50" : "border-border hover:border-ink/20",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="service_pick"
                      className="accent-[color:var(--color-primary)]"
                      checked={serviceId === s.id}
                      onChange={() => setServiceId(s.id)}
                    />
                    <span className="font-semibold text-ink">{s.name}</span>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {s.pricingType === "quote" || s.price == null
                      ? "Custom quote"
                      : `${formatPrice(s.price)} ${s.priceUnit}`}
                  </span>
                </label>
              ))}
            </fieldset>
          )}

          {/* Step 2 — Date & time */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold">When works for you?</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    min={today}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Start time</Label>
                  <select
                    id="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  >
                    {TIMES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Address */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold">Where&apos;s the job?</h2>
              {addresses.length > 0 && (
                <div className="space-y-2">
                  {addresses.map((a) => (
                    <label
                      key={a.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-colors",
                        !useNew && addressId === a.id ? "border-primary bg-orange-soft/50" : "border-border hover:border-ink/20",
                      )}
                    >
                      <input
                        type="radio"
                        name="addr_pick"
                        className="accent-[color:var(--color-primary)]"
                        checked={!useNew && addressId === a.id}
                        onChange={() => pickSaved(a)}
                      />
                      <span className="text-sm">
                        <span className="font-semibold text-ink">{a.label ?? "Saved"}</span> —{" "}
                        {a.line1}, {a.city}, {a.state} {a.zip}
                      </span>
                    </label>
                  ))}
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-border p-4 hover:border-ink/20">
                    <input
                      type="radio"
                      name="addr_pick"
                      className="accent-[color:var(--color-primary)]"
                      checked={useNew}
                      onChange={() => {
                        setUseNew(true);
                        setAddr({ line1: "", line2: "", city: "", state: "", zip: "" });
                      }}
                    />
                    <span className="text-sm font-semibold text-ink">Use a new address</span>
                  </label>
                </div>
              )}

              {useNew && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="line1">Street address</Label>
                    <Input id="line1" value={addr.line1} onChange={(e) => setAddr({ ...addr, line1: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="line2">Apt / unit (optional)</Label>
                    <Input id="line2" value={addr.line2} onChange={(e) => setAddr({ ...addr, line2: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input id="state" value={addr.state} onChange={(e) => setAddr({ ...addr, state: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP</Label>
                      <Input id="zip" value={addr.zip} onChange={(e) => setAddr({ ...addr, zip: e.target.value })} />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-ink-soft sm:col-span-2">
                    <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
                    Save this address to my account
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Step 4 — Review */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold">Review &amp; confirm</h2>
              <div>
                <Label htmlFor="notes">Job notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything the pro should know — access, parking, scope…"
                />
              </div>
              <dl className="space-y-2 rounded-xl bg-muted p-4 text-sm">
                <Row label="Service" value={selected?.name ?? "—"} />
                <Row label="When" value={`${date} at ${time}`} />
                <Row label="Address" value={`${addr.line1}, ${addr.city}, ${addr.state} ${addr.zip}`} />
                <div className="my-1 border-t border-border" />
                {quoted != null ? (
                  <>
                    <Row label="Service price" value={formatPrice(quoted)} />
                    <Row label={`Platform fee (${Math.round(brand.platformFeeRate * 100)}%)`} value={formatPrice(fee ?? 0)} />
                    <Row label="Estimated total" value={formatPrice(quoted)} strong />
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    Price confirmed after the pro sends a quote. No charge until you accept.
                  </p>
                )}
              </dl>
              <p className="text-xs text-muted-foreground">
                You&apos;re sending a request — the pro accepts before any charge.
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
        <div className="mt-5 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ChevronLeft /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
              Continue
            </Button>
          ) : (
            <SubmitButton size="lg">
              <Check /> Confirm booking
            </SubmitButton>
          )}
        </div>
      </form>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-2">
      {STEPS.map((label, i) => (
        <li key={label} className="flex flex-1 items-center gap-2">
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
              i < step
                ? "bg-sage-dark text-white"
                : i === step
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {i < step ? <Check className="size-4" /> : i + 1}
          </span>
          <span className={cn("hidden text-sm font-medium sm:inline", i === step ? "text-ink" : "text-muted-foreground")}>
            {label}
          </span>
          {i < STEPS.length - 1 && <span className="h-px flex-1 bg-border" />}
        </li>
      ))}
    </ol>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("text-right", strong ? "font-display text-base font-bold text-ink" : "font-medium text-ink")}>
        {value}
      </dd>
    </div>
  );
}
