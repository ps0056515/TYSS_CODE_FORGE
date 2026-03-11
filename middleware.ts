import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { USER_COOKIE_NAME } from "@/lib/auth-config";

/**
 * Syncs NextAuth JWT to cf_user cookie so existing CodeForge auth (getUser(), leaderboard, submissions) works.
 * When the user signs in via OAuth, we set cf_user from the token; when they sign out, the cookie is cleared by NextAuth.
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return res;

  const token = await getToken({ req, secret });
  const cfUser = token ? (token as { cf_user?: string }).cf_user ?? (token as { email?: string }).email : null;

  // Only set cf_user when OAuth session exists. Don't clear when absent so username-only login still works.
  if (cfUser) {
    res.cookies.set(USER_COOKIE_NAME, cfUser, {
      path: "/",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
    });
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
