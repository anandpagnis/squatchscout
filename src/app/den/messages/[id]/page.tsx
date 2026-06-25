import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";
import { MessageThread } from "@/components/messaging/message-thread";

export const metadata: Metadata = { title: "Conversation" };

type Msg = { id: string; sender_id: string; body: string | null; created_at: string };

export default async function DenThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();
  if (!profile) return null;

  const supabase = await createClient();
  const { data: conv } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (!conv) notFound();

  const { data: msgs } = await supabase
    .from("messages")
    .select("id, sender_id, body, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/den/messages" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-orange-dark">
        <ArrowLeft className="size-4" /> All messages
      </Link>

      <div className="flex items-center gap-3">
        <Avatar name="Customer" className="size-11" />
        <p className="font-display text-lg font-bold">Customer</p>
      </div>

      <MessageThread
        conversationId={(conv as { id: string }).id}
        currentUserId={profile.id}
        initialMessages={(msgs ?? []) as Msg[]}
      />
    </div>
  );
}
