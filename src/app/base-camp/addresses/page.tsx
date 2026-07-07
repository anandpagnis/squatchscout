import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { AddAddressForm } from "@/components/base-camp/add-address-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteAddress, setDefaultAddress } from "../actions";

export const metadata: Metadata = { title: "Addresses" };

type Addr = {
  id: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  zip: string;
  is_default: boolean;
};

export default async function AddressesPage() {
  const profile = await getProfile();
  if (!profile) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("customer_addresses")
    .select("id, label, line1, line2, city, state, zip, is_default")
    .eq("customer_id", profile.id)
    .is("deleted_at", null)
    .order("is_default", { ascending: false });

  const addresses = (data ?? []) as Addr[];

  return (
    <div className="space-y-6">
      <DashboardHeader title="Addresses" subtitle="Where your jobs happen." />

      {addresses.length === 0 ? (
        <EmptyState icon={<MapPin />} title="No addresses yet" body="Add one to speed up booking." />
      ) : (
        <ul className="space-y-3">
          {addresses.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5 shadow-card"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-ink">{a.label ?? "Address"}</p>
                  {a.is_default && <Badge variant="sage">Default</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.zip}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!a.is_default && (
                  <form action={setDefaultAddress}>
                    <input type="hidden" name="id" value={a.id} />
                    <Button type="submit" variant="ghost" size="sm">Make default</Button>
                  </form>
                )}
                <form action={deleteAddress}>
                  <input type="hidden" name="id" value={a.id} />
                  <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                    Remove
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AddAddressForm />
    </div>
  );
}
