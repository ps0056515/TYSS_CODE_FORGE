import { NextResponse } from "next/server";
import { USER_COOKIE } from "@/lib/auth";

/**
 * Clears the CodeForge user cookie and redirects to NextAuth signout so both sessions are cleared.
 * Uses NEXTAUTH_URL when set (so sign-out stays on the same app URL, e.g. localhost:3002);
 * otherwise uses the client-facing host from headers for EC2/proxy.
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
  const fromRequest = getOriginFromRequest(req);
  const envUrl = process.env.NEXTAUTH_URL;
  const origin = envUrl ? envUrl.replace(/\/$/, "").split("?")[0] : fromRequest;
  const res = NextResponse.redirect(
    `${origin}/api/auth/signout?callbackUrl=${encodeURIComponent(origin)}`
  );
  res.cookies.set(USER_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
