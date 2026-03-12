import { NextResponse } from "next/server";
import { getUserAsync, isAdminUser, USER_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const user = await getUserAsync();
  const res = NextResponse.json({ ok: true, user, role: user && isAdminUser(user) ? "admin" : "student" });
  if (user) res.cookies.set(USER_COOKIE, user, { path: "/", sameSite: "lax", maxAge: 30 * 24 * 60 * 60 });
  return res;
}

