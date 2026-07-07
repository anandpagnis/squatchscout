import type { Metadata } from "next";
import { ShieldCheck, ShieldAlert, FileUp } from "lucide-react";
import { getMyContractorProfile } from "@/lib/data/contractors";
import { DashboardHeader } from "@/components/dashboard/dashboard-shell";
import { DenProfileForm } from "@/components/den/profile-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { toggleGoLive } from "../actions";

export const metadata: Metadata = { title: "Settings" };

export default async function DenSettingsPage() {
  const pro = await getMyContractorProfile();
  if (!pro) return null;

  const approved = pro.verification_status === "approved";

  return (
    <div className="space-y-6">
      <DashboardHeader title="Settings" subtitle="Your profile, verification and visibility." />

      {/* Verification + go-live */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-sage-soft text-sage-dark [&_svg]:size-5">
              {approved ? <ShieldCheck /> : <ShieldAlert />}
            </span>
            <div>
              <p className="text-lg font-bold">Verification</p>
              <p className="text-sm text-muted-foreground">
                Status:{" "}
                <Badge variant={approved ? "success" : "warning"}>{pro.verification_status}</Badge>
              </p>
            </div>
          </div>

          {approved && (
            <form action={toggleGoLive}>
              <input type="hidden" name="is_active" value={(!pro.is_active).toString()} />
              <Button type="submit" variant={pro.is_active ? "outline" : "primary"}>
                {pro.is_active ? "Pause listing" : "Go live"}
              </Button>
            </form>
          )}
        </div>

        {!approved && (
          <Alert variant="warning" className="mt-4">
            <FileUp />
            <div>
              <p className="font-semibold">Upload verification docs to go live.</p>
              <p className="text-sm">
                Secure ID + insurance upload (private storage bucket) lands with the
                verification flow — staff review then approves your account.
              </p>
            </div>
          </Alert>
        )}
        {approved && (
          <p className="mt-3 text-sm text-muted-foreground">
            {pro.is_active ? "You're live and bookable. 🎉" : "You're approved — go live when you're ready for bookings."}
          </p>
        )}
      </div>

      <DenProfileForm
        initial={{
          business_name: pro.business_name,
          headline: pro.headline,
          bio: pro.bio,
          base_city: pro.base_city,
          base_state: pro.base_state,
          service_radius_miles: pro.service_radius_miles,
          years_experience: pro.years_experience,
        }}
      />
    </div>
  );
}
