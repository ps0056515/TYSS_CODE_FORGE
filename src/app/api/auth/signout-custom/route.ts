import { NextResponse } from "next/server";
import { USER_COOKIE } from "@/lib/auth";

/**
 * Clears the CodeForge user cookie and redirects to NextAuth signout so both sessions are cleared.
 * Always use the request origin for the post-signout callback so the user stays on the same host
 * (e.g. EC2 URL), not NEXTAUTH_URL which may be localhost in production.
 */
export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const res = NextResponse.redirect(
    `${origin}/api/auth/signout?callbackUrl=${encodeURIComponent(origin)}`
  );
  res.cookies.set(USER_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
