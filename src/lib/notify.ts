import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

type Notification = { type: string; title: string; body?: string; link?: string };

/** Create an in-app notification for a user (server-side, bypasses RLS). */
export async function notify(userId: string, n: Notification) {
  const admin = createAdminClient();
  await admin.from("notifications").insert({
    user_id: userId,
    type: n.type,
    title: n.title,
    body: n.body ?? null,
    link: n.link ?? null,
  });
}

/** Notify a contractor by their contractor_profiles id. */
export async function notifyContractor(contractorProfileId: string, n: Notification) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("contractor_profiles")
    .select("user_id")
    .eq("id", contractorProfileId)
    .maybeSingle();
  const userId = (data as { user_id: string } | null)?.user_id;
  if (userId) await notify(userId, n);
}
