import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { getMyContractorProfile } from "@/lib/data/contractors";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Avatar } from "@/components/ui/avatar";

export const metadata: Metadata = { title: "Messages" };

type Conv = { id: string; last_message_at: string | null };

export default async function DenMessagesPage() {
  const pro = await getMyContractorProfile();
  if (!pro) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("conversations")
    .select("id, last_message_at")
    .eq("contractor_id", pro.id)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  const conversations = (data ?? []) as Conv[];

  return (
    <div className="space-y-6">
      <DashboardHeader title="Messages" subtitle="Chat with your customers." />

      {conversations.length === 0 ? (
        <EmptyState icon={<MessageSquare />} title="No conversations yet" body="When a customer messages you, it shows up here." />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link href={`/den/messages/${c.id}`} className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-muted">
                <Avatar name="Customer" className="size-10" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">Customer</p>
                  <p className="text-xs text-muted-foreground">
                    {c.last_message_at
                      ? new Date(c.last_message_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
                      : "New conversation"}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
