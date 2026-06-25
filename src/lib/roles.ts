import type { User } from "@supabase/supabase-js";
import type { Role } from "@/lib/brand";

/**
 * Best-effort role used for redirect/routing decisions (UX only).
 * Authorization is enforced by Row-Level Security at the database layer.
 * Pure module — safe to import from Edge middleware.
 */
export function roleFromUser(user: User | null | undefined): Role | undefined {
  return (user?.app_metadata?.role ?? user?.user_metadata?.role) as
    | Role
    | undefined;
}
