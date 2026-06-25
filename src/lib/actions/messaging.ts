"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { notify } from "@/lib/notify";

/** Get or create the conversation between the current customer and a contractor. */
export async function getOrCreateConversation(contractorId: string): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("customer_id", user.id)
    .eq("contractor_id", contractorId)
    .maybeSingle();
  if (existing) return (existing as { id: string }).id;

  const { data: created } = await supabase
    .from("conversations")
    .insert({ customer_id: user.id, contractor_id: contractorId })
    .select("id")
    .single();
  return (created as { id: string } | null)?.id ?? null;
}

export type SendState = { error?: string; sentAt?: number };

export async function sendMessage(_prev: SendState, formData: FormData): Promise<SendState> {
  const conversationId = String(formData.get("conversation_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!conversationId || !body) return { error: "Type a message first." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in again." };

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body,
  });
  if (error) return { error: "Couldn't send that message." };

  // Notify the other party.
  const { data: conv } = await supabase
    .from("conversations")
    .select("customer_id, contractor_id")
    .eq("id", conversationId)
    .maybeSingle();
  const c = conv as { customer_id: string; contractor_id: string } | null;
  if (c) {
    if (user.id === c.customer_id) {
      const { data: pro } = await supabase
        .from("contractor_profiles")
        .select("user_id")
        .eq("id", c.contractor_id)
        .maybeSingle();
      const proUser = (pro as { user_id: string } | null)?.user_id;
      if (proUser)
        await notify(proUser, {
          type: "message",
          title: "New message 💬",
          body: "You have a new message from a customer.",
          link: `/den/messages/${conversationId}`,
        });
    } else {
      await notify(c.customer_id, {
        type: "message",
        title: "New message 💬",
        body: "Your pro replied.",
        link: `/base-camp/messages/${conversationId}`,
      });
    }
  }

  revalidatePath(`/base-camp/messages/${conversationId}`);
  revalidatePath(`/den/messages/${conversationId}`);
  return { sentAt: Date.now() };
}
