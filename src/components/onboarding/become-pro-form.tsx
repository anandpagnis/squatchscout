"use client";

import { useActionState } from "react";
import { chooseRoleAction } from "@/app/onboarding/actions";
import type { AuthState } from "@/app/(auth)/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { SubmitButton } from "@/components/auth/submit-button";

/** Customer → contractor upgrade form (/base-camp/become-a-pro). */
export function BecomeProForm() {
  const [state, action] = useActionState<AuthState, FormData>(chooseRoleAction, {});

  return (
    <form action={action} className="space-y-4">
      {state.error && <Alert variant="error">{state.error}</Alert>}

      <input type="hidden" name="role" value="contractor" />
      <div>
        <Label htmlFor="business_name">Business name</Label>
        <Input
          id="business_name"
          name="business_name"
          required
          placeholder="Sasquatch Handyman Co."
        />
      </div>

      <SubmitButton size="lg">Become a Scout Pro</SubmitButton>
    </form>
  );
}
