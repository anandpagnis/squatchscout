"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Note = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

export function NotificationsBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const unread = notes.filter((n) => !n.read_at).length;

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase
      .from("notifications")
      .select("id, title, body, link, read_at, created_at")
      .order("created_at", { ascending: false })
      .limit(15)
      .then(({ data }) => {
        if (active && data) setNotes(data as Note[]);
      });

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => setNotes((prev) => [payload.new as Note, ...prev]),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  async function markAllRead() {
    const now = new Date().toISOString();
    setNotes((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? now })));
    const supabase = createClient();
    await supabase.from("notifications").update({ read_at: now }).is("read_at", null);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative flex size-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-muted"
      >
        <Bell className="size-5" />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 24 }}
              className="absolute right-1.5 top-1.5 flex min-w-4 items-center justify-center rounded-full bg-amber px-1 text-[10px] font-bold text-ink"
            >
              {unread > 9 ? "9+" : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-elevated"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="font-display text-sm font-bold">Notifications</p>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs font-medium text-forest-mid hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            <ul className="max-h-96 overflow-y-auto">
              {notes.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications yet.</li>
              ) : (
                notes.map((n) => {
                  const inner = (
                    <div className={cn("px-4 py-3", !n.read_at && "bg-amber-soft/40")}>
                      <p className="text-sm font-semibold text-ink">{n.title}</p>
                      {n.body && <p className="text-xs text-muted-foreground">{n.body}</p>}
                    </div>
                  );
                  return (
                    <li key={n.id} className="border-b border-border last:border-0">
                      {n.link ? (
                        <Link href={n.link} onClick={() => setOpen(false)} className="block hover:bg-muted">
                          {inner}
                        </Link>
                      ) : (
                        inner
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </motion.div>
        </>
      )}
    </div>
  );
}
