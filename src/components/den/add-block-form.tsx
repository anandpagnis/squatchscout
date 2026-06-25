"use client";

import { useActionState } from "react";
import { addBlock, type DenState } from "@/app/den/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { SubmitButton } from "@/components/auth/submit-button";

export function AddBlockForm() {
  const [state, action] = useActionState<DenState, FormData>(addBlock, {});
  return (
    <form action={action} className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <h2 className="font-display text-lg font-bold">Block time off</h2>
      {state.error && <Alert variant="error" className="mt-3">{state.error}</Alert>}
      {state.ok && <Alert variant="success" className="mt-3">Time off added.</Alert>}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="start_datetime">Start</Label>
          <Input id="start_datetime" name="start_datetime" type="datetime-local" required />
        </div>
        <div>
          <Label htmlFor="end_datetime">End</Label>
          <Input id="end_datetime" name="end_datetime" type="datetime-local" required />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="reason">Reason (optional)</Label>
          <Input id="reason" name="reason" placeholder="Vacation, already booked…" />
        </div>
      </div>
      <SubmitButton className="mt-4">Add time off</SubmitButton>
    </form>
  );
}
