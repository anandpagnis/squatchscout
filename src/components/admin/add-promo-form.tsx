"use client";

import { useActionState } from "react";
import { addPromo, type PromoFormState } from "@/app/admin/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { SubmitButton } from "@/components/auth/submit-button";

export function AddPromoForm() {
  const [state, action] = useActionState<PromoFormState, FormData>(addPromo, {});
  const selectCls =
    "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

  return (
    <form action={action} className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <h2 className="font-display text-lg font-bold">Create promo code</h2>
      {state.error && <Alert variant="error" className="mt-3">{state.error}</Alert>}
      {state.ok && <Alert variant="success" className="mt-3">Promo code created.</Alert>}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="code">Code</Label>
          <Input id="code" name="code" placeholder="SCOUT10" className="uppercase" required />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <select id="type" name="type" className={selectCls}>
            <option value="percent">Percent off</option>
            <option value="fixed">Fixed amount</option>
          </select>
        </div>
        <div>
          <Label htmlFor="value">Value</Label>
          <Input id="value" name="value" type="number" min="1" step="1" placeholder="10" required />
        </div>
        <div>
          <Label htmlFor="max_uses">Max uses (optional)</Label>
          <Input id="max_uses" name="max_uses" type="number" min="1" placeholder="1000" />
        </div>
        <div>
          <Label htmlFor="days_valid">Valid for (days)</Label>
          <Input id="days_valid" name="days_valid" type="number" min="1" defaultValue={90} />
        </div>
      </div>
      <SubmitButton className="mt-4">Create code</SubmitButton>
    </form>
  );
}
