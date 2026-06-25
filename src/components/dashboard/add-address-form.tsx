"use client";

import { useActionState, useEffect, useRef } from "react";
import { addAddress, type AddressState } from "@/app/base-camp/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { SubmitButton } from "@/components/auth/submit-button";

export function AddAddressForm() {
  const [state, action] = useActionState<AddressState, FormData>(addAddress, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={action} className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <h2 className="font-display text-lg font-bold">Add an address</h2>
      {state.error && <Alert variant="error" className="mt-3">{state.error}</Alert>}
      {state.ok && <Alert variant="success" className="mt-3">Address saved.</Alert>}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="label">Label</Label>
          <Input id="label" name="label" placeholder="Home" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="line1">Street address</Label>
          <Input id="line1" name="line1" required />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="line2">Apt / unit (optional)</Label>
          <Input id="line2" name="line2" />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="state">State</Label>
            <Input id="state" name="state" required />
          </div>
          <div>
            <Label htmlFor="zip">ZIP</Label>
            <Input id="zip" name="zip" required />
          </div>
        </div>
      </div>
      <SubmitButton className="mt-4">Save address</SubmitButton>
    </form>
  );
}
