"use client";

import { useActionState, useState } from "react";
import { addService, type DenState } from "@/app/den/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { SubmitButton } from "@/components/auth/submit-button";

type Opt = { id: string; name: string; category: string };

export function AddServiceForm({ available }: { available: Opt[] }) {
  const [state, action] = useActionState<DenState, FormData>(addService, {});
  const [unit, setUnit] = useState("per job");

  const selectCls =
    "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

  if (available.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-card/60 p-5 text-sm text-muted-foreground">
        You&apos;ve added every service in the catalog. 🎉
      </p>
    );
  }

  return (
    <form action={action} className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <h2 className="font-display text-lg font-bold">Add a service</h2>
      {state.error && <Alert variant="error" className="mt-3">{state.error}</Alert>}
      {state.ok && <Alert variant="success" className="mt-3">Service added.</Alert>}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="service_id">Service</Label>
          <select id="service_id" name="service_id" className={selectCls} required>
            {available.map((s) => (
              <option key={s.id} value={s.id}>
                {s.category} — {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="price_unit">Pricing</Label>
          <select
            id="price_unit"
            name="price_unit"
            className={selectCls}
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          >
            <option value="per job">Fixed (per job)</option>
            <option value="per hour">Hourly (per hour)</option>
            <option value="quote">Custom quote</option>
          </select>
        </div>
        {unit !== "quote" && (
          <div>
            <Label htmlFor="price">Price (USD)</Label>
            <Input id="price" name="price" type="number" min="0" step="1" placeholder="100" />
          </div>
        )}
      </div>
      <SubmitButton className="mt-4">Add service</SubmitButton>
    </form>
  );
}
