import { NextResponse } from "next/server";
import { USER_COOKIE } from "@/lib/auth";

/**
 * Clears the CodeForge user cookie and redirects to NextAuth signout so both sessions are cleared.
 */
export async function GET() {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3002";
  const res = NextResponse.redirect(`${base}/api/auth/signout?callbackUrl=${encodeURIComponent(base)}`);
  res.cookies.set(USER_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
