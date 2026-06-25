import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { roleFromUser } from "@/lib/roles";
import { roleHome, type Role } from "@/lib/brand";

const AREA_BY_ROLE: Record<Role, string> = {
  customer: "/base-camp",
  contractor: "/den",
  admin: "/admin",
};

const AUTH_PAGES = ["/login", "/signup", "/forgot-password"];

/** Copy refreshed Supabase cookies onto a redirect response. */
function redirectWith(request: NextRequest, pathname: string, from: NextResponse) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  const res = NextResponse.redirect(url);
  from.cookies.getAll().forEach((c) => res.cookies.set(c));
  return res;
}

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const path = request.nextUrl.pathname;
  const role = roleFromUser(user);

  const isProtected =
    path.startsWith("/base-camp") ||
    path.startsWith("/den") ||
    path.startsWith("/admin");
  const isAuthPage = AUTH_PAGES.some((p) => path.startsWith(p));

  // Gate protected areas behind auth.
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(path)}`;
    const res = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  }

  // Signed-in users skip auth pages — send them to their area.
  if (user && isAuthPage) {
    return redirectWith(request, role ? AREA_BY_ROLE[role] : "/base-camp", response);
  }

  // Keep each role inside its own area.
  if (user && role) {
    if (path.startsWith("/base-camp") && role !== "customer")
      return redirectWith(request, roleHome[role], response);
    if (path.startsWith("/den") && role !== "contractor")
      return redirectWith(request, roleHome[role], response);
    if (path.startsWith("/admin") && role !== "admin")
      return redirectWith(request, roleHome[role], response);
  }

  return response;
}

export const config = {
  // Run on everything except static assets & image files.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
