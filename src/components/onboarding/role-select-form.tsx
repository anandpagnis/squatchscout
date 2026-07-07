"use client";

import { useActionState, useState } from "react";
import { Hammer, User } from "lucide-react";
import { chooseRoleAction } from "@/app/onboarding/actions";
import type { AuthState } from "@/app/(auth)/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { SubmitButton } from "@/components/auth/submit-button";

type Role = "customer" | "contractor";

/** Customer-vs-pro choice for first-time OAuth signups (/onboarding/role). */
export function RoleSelectForm() {
  const [role, setRole] = useState<Role>("customer");
  const [state, action] = useActionState<AuthState, FormData>(chooseRoleAction, {});

  return (
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

      <SubmitButton size="lg" className="w-full">
        {role === "contractor" ? "Apply to get scouted" : "Continue to Base Camp"}
      </SubmitButton>
    </form>
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
