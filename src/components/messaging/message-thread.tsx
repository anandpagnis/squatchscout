"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sendMessage, type SendState } from "@/lib/actions/messaging";
import { SubmitButton } from "@/components/auth/submit-button";
import { cn } from "@/lib/utils";

type Msg = { id: string; sender_id: string; body: string | null; created_at: string };

export function MessageThread({
  conversationId,
  currentUserId,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: Msg[];
}) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [state, action] = useActionState<SendState, FormData>(sendMessage, {});
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Realtime: append new messages for this conversation (RLS-scoped).
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const m = payload.new as Msg;
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    if (state.sentAt && inputRef.current) inputRef.current.value = "";
  }, [state.sentAt]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-[62vh] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No messages yet — say hello 👋
          </p>
        )}
        {messages.map((m) => {
          const own = m.sender_id === currentUserId;
          return (
            <div key={m.id} className={cn("flex", own ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                  own ? "bg-primary text-primary-foreground" : "bg-muted text-ink",
                )}
              >
                {m.body}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form action={action} className="flex items-end gap-2 border-t border-border p-3">
        <input type="hidden" name="conversation_id" value={conversationId} />
        <textarea
          ref={inputRef}
          name="body"
          rows={1}
          placeholder="Type a message…"
          className="flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        />
        <SubmitButton size="icon" aria-label="Send">
          <Send />
        </SubmitButton>
      </form>
    </div>
  );
}
