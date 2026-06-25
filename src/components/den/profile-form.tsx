"use client";

import { useActionState } from "react";
import { updateDenProfile, type DenState } from "@/app/den/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { SubmitButton } from "@/components/auth/submit-button";

type Initial = {
  business_name: string;
  headline: string | null;
  bio: string | null;
  base_city: string | null;
  base_state: string | null;
  service_radius_miles: number;
  years_experience: number;
};

export function DenProfileForm({ initial }: { initial: Initial }) {
  const [state, action] = useActionState<DenState, FormData>(updateDenProfile, {});

  return (
    <form action={action} className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <h2 className="font-display text-lg font-bold">Public profile</h2>
      <p className="text-sm text-muted-foreground">This is what customers see.</p>
      {state.error && <Alert variant="error" className="mt-3">{state.error}</Alert>}
      {state.ok && <Alert variant="success" className="mt-3">Profile saved.</Alert>}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="business_name">Business name</Label>
          <Input id="business_name" name="business_name" defaultValue={initial.business_name} required />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="headline">Headline</Label>
          <Input id="headline" name="headline" defaultValue={initial.headline ?? ""} placeholder="Your one-line pitch" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="bio">About</Label>
          <Textarea id="bio" name="bio" defaultValue={initial.bio ?? ""} rows={4} />
        </div>
        <div>
          <Label htmlFor="base_city">City</Label>
          <Input id="base_city" name="base_city" defaultValue={initial.base_city ?? ""} />
        </div>
        <div>
          <Label htmlFor="base_state">State</Label>
          <Input id="base_state" name="base_state" defaultValue={initial.base_state ?? ""} />
        </div>
        <div>
          <Label htmlFor="service_radius_miles">Service radius (miles)</Label>
          <Input id="service_radius_miles" name="service_radius_miles" type="number" min="1" max="200" defaultValue={initial.service_radius_miles} />
        </div>
        <div>
          <Label htmlFor="years_experience">Years experience</Label>
          <Input id="years_experience" name="years_experience" type="number" min="0" max="80" defaultValue={initial.years_experience} />
        </div>
      </div>
      <SubmitButton className="mt-4">Save profile</SubmitButton>
    </form>
  );
}
