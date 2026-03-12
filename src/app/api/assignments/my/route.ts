import { NextResponse } from "next/server";
import { listMyAssignments } from "@/lib/assignment-platform-store";
import { getUserAsync, USER_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const user = await getUserAsync();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  const items = await listMyAssignments(user);
  const res = NextResponse.json({ ok: true, items });
  // Sync auth cookie so client requests are consistently recognized
  res.cookies.set(USER_COOKIE, user, { path: "/", sameSite: "lax", maxAge: 30 * 24 * 60 * 60 });
  return res;
}
