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
      const dest = next || roleHome[roleFromUser(user) ?? "customer"];
      return NextResponse.redirect(`${origin}${dest}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
