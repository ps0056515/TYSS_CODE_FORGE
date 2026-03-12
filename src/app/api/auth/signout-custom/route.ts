import { NextResponse } from "next/server";
import { USER_COOKIE } from "@/lib/auth";

/**
 * Clears the CodeForge user cookie and redirects to NextAuth signout so both sessions are cleared.
 * Uses the client-facing host (from headers) so sign-out works on EC2/proxy; req.url can be localhost internally.
 */
function getOriginFromRequest(req: Request): string {
  const url = new URL(req.url);
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const host = forwardedHost ?? req.headers.get("host") ?? url.host;
  const proto = forwardedProto ?? (url.protocol === "https:" ? "https" : "http");
  return `${proto}://${host}`;
}

export async function GET(req: Request) {
  const origin = getOriginFromRequest(req);
  const res = NextResponse.redirect(
    `${origin}/api/auth/signout?callbackUrl=${encodeURIComponent(origin)}`
  );
  res.cookies.set(USER_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
