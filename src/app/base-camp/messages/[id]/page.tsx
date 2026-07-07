import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";
import { MessageThread } from "@/components/messaging/message-thread";

export const metadata: Metadata = { title: "Conversation" };

type Conv = {
  id: string;
  contractor: { business_name: string; avatar_url: string | null; slug: string | null } | null;
};
type Msg = { id: string; sender_id: string; body: string | null; created_at: string };

export default async function CustomerThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();
  if (!profile) return null;

  const supabase = await createClient();
  const { data: convData } = await supabase
    .from("conversations")
    .select("id, contractor:contractor_profiles(business_name, avatar_url, slug)")
    .eq("id", id)
    .maybeSingle();
  const conv = convData as unknown as Conv | null;
  if (!conv) notFound();

  const { data: msgs } = await supabase
    .from("messages")
    .select("id, sender_id, body, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/base-camp/messages" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-orange-dark">
        <ArrowLeft className="size-4" /> All messages
      </Link>

      <div className="flex items-center gap-3">
        <Avatar name={conv.contractor?.business_name} src={conv.contractor?.avatar_url} className="size-11" />
        <div>
          <p className="text-lg font-bold">{conv.contractor?.business_name ?? "Pro"}</p>
          {conv.contractor?.slug && (
            <Link href={`/pros/${conv.contractor.slug}`} className="text-xs text-orange-dark hover:underline">
              View profile
            </Link>
          )}
        </div>
      </div>

      <MessageThread
        conversationId={conv.id}
        currentUserId={profile.id}
        initialMessages={(msgs ?? []) as Msg[]}
      />
    </div>
  );
}
