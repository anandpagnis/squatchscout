"use client";

import { useActionState, useState } from "react";
import { Hammer, User } from "lucide-react";
import { signupAction, type AuthState } from "@/app/(auth)/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { SubmitButton } from "./submit-button";
import { GoogleButton } from "./google-button";

type Role = "customer" | "contractor";

export function SignupForm({ defaultRole = "customer" }: { defaultRole?: Role }) {
  const [role, setRole] = useState<Role>(defaultRole);
  const [state, action] = useActionState<AuthState, FormData>(signupAction, {});

  return (
    <div className="space-y-4">
      <form action={action} className="space-y-4">
      {state.error && <Alert variant="error">{state.error}</Alert>}

      <input type="hidden" name="role" value={role} />
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
        <RoleTab
          active={role === "customer"}
          onClick={() => setRole("customer")}
          icon={<User />}
          label="I need help"
        />
        <RoleTab
          active={role === "contractor"}
          onClick={() => setRole("contractor")}
          icon={<Hammer />}
          label="I'm a pro"
        />
      </div>

      <div>
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" name="full_name" autoComplete="name" required placeholder="Jordan Mills" />
      </div>

      {role === "contractor" && (
        <div>
          <Label htmlFor="business_name">Business name</Label>
          <Input
            id="business_name"
            name="business_name"
            required
            placeholder="Sasquatch Handyman Co."
          />
        </div>
      )}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </div>

      <div>
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="555-555-0123" />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="At least 8 characters"
        />
      </div>

      <SubmitButton size="lg" className="w-full">
        {role === "contractor" ? "Apply to get scouted" : "Create my account"}
      </SubmitButton>
      </form>

      <div className="relative py-1 text-center text-xs text-muted-foreground">
        <span className="relative z-10 bg-card px-2">or</span>
        <div className="absolute inset-x-0 top-1/2 border-t border-border" />
      </div>

      <GoogleButton />

      <p className="text-center text-xs text-muted-foreground">
        By continuing you agree to our{" "}
        <a href="/legal/terms" className="underline">Terms</a> and{" "}
        <a href="/legal/privacy" className="underline">Privacy Policy</a>.
      </p>
    </div>
  );
}

function RoleTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all [&_svg]:size-4",
        active
          ? "bg-card text-ink shadow-card"
          : "text-muted-foreground hover:text-ink",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
