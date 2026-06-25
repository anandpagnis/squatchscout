import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateConversation } from "@/lib/actions/messaging";
import { DashboardHeader } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { microcopy } from "@/lib/brand";

export const metadata: Metadata = { title: "Messages" };

type Conv = {
  id: string;
  last_message_at: string | null;
  contractor: { business_name: string; avatar_url: string | null } | null;
};

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ contractor?: string }>;
}) {
  const sp = await searchParams;
  if (sp.contractor) {
    const id = await getOrCreateConversation(sp.contractor);
    if (id) redirect(`/base-camp/messages/${id}`);
  }

  const profile = await getProfile();
  if (!profile) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("conversations")
    .select("id, last_message_at, contractor:contractor_profiles(business_name, avatar_url)")
    .eq("customer_id", profile.id)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  const conversations = (data ?? []) as unknown as Conv[];

  return (
    <div className="space-y-6">
      <DashboardHeader title="Messages" subtitle="Chat with your pros." />

      {conversations.length === 0 ? (
        <EmptyState icon={<MessageSquare />} title={microcopy.emptyMessages} />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link href={`/base-camp/messages/${c.id}`} className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-muted">
                <Avatar name={c.contractor?.business_name} src={c.contractor?.avatar_url} className="size-10" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{c.contractor?.business_name ?? "Pro"}</p>
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
