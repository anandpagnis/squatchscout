import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { roleFromUser } from "@/lib/roles";
import { roleHome } from "@/lib/brand";

/** OAuth + magic-link callback: exchange the code for a session, then route by role. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      // Email signups always carry a role in user_metadata; OAuth signups
      // don't until they've answered the customer-vs-pro question. Route
      // first-timers there before anything else (handle_new_user has already
      // defaulted them to customer in the DB — this makes the choice explicit).
      if (user && !user.user_metadata?.role) {
        return NextResponse.redirect(`${origin}/onboarding/role`);
      }
      const dest = next || roleHome[roleFromUser(user) ?? "customer"];
      return NextResponse.redirect(`${origin}${dest}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
