import type { Metadata } from "next";
import { CalendarX2, Hammer, ShieldCheck, Wallet } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-shell";
import { Alert } from "@/components/ui/alert";
import { BecomeProForm } from "@/components/onboarding/become-pro-form";

export const metadata: Metadata = { title: "Become a Scout Pro" };

/** Customer → contractor upgrade. The layout's requireRole("customer") already
 *  keeps contractors and admins out. */
export default function BecomeAProPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <DashboardHeader
        title="Become a Scout Pro"
        subtitle="Turn your skills into bookings — join the Den."
      />

      <ul className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-card text-sm">
        <li className="flex items-start gap-3">
          <Hammer className="mt-0.5 size-4 shrink-0 text-sage-dark" />
          <span>
            List your services, set your schedule, and accept jobs from customers
            in your area.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sage-dark" />
          <span>
            Finish your profile and upload verification docs — staff review
            typically takes 1–2 business days before you go live.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <Wallet className="mt-0.5 size-4 shrink-0 text-sage-dark" />
          <span>Get paid per completed job, minus the platform fee.</span>
        </li>
      </ul>

      <Alert variant="warning">
        <CalendarX2 />
        <div>
          <p className="font-semibold">Your account switches to the Den.</p>
          <p className="text-sm">
            Pro accounts use the Den dashboard, so Base Camp — including your
            past customer bookings — won&apos;t be visible after the switch.
            Wrap up or cancel any active bookings first; the records stay on
            your account either way.
          </p>
        </div>
      </Alert>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <BecomeProForm />
      </div>
    </div>
  );
}
