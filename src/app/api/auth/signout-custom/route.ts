import { NextResponse } from "next/server";
import { USER_COOKIE } from "@/lib/auth";

/**
 * Clears the CodeForge user cookie and redirects to NextAuth signout so both sessions are cleared.
 */
export async function GET(req: Request) {
  // Use request origin for redirects so sign-out works on any host.
  const origin = new URL(req.url).origin;
  const callbackUrl = process.env.NEXTAUTH_URL || origin;
  const res = NextResponse.redirect(
    `${origin}/api/auth/signout?callbackUrl=${encodeURIComponent(callbackUrl)}`
  );
  res.cookies.set(USER_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
