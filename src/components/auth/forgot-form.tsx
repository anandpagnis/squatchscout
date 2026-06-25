"use client";

import { useActionState } from "react";
import { forgotAction, type AuthState } from "@/app/(auth)/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { SubmitButton } from "./submit-button";

export function ForgotForm() {
  const [state, action] = useActionState<AuthState, FormData>(forgotAction, {});

  return (
    <form action={action} className="space-y-4">
      {state.message && <Alert variant="success">{state.message}</Alert>}
      {state.error && <Alert variant="error">{state.error}</Alert>}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </div>

      <SubmitButton size="lg" className="w-full">
        Send reset link
      </SubmitButton>
    </form>
  );
}
