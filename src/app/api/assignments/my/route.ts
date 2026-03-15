import { NextResponse } from "next/server";
import { listMyAssignments } from "@/lib/assignment-platform-store";
import { getUserAsync, USER_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Read cf_user from request Cookie header to avoid getServerSession() which can hang */
function userFromRequestCookie(req: Request): string | null {
  const cookie = req.headers.get("cookie");
  if (!cookie) return null;
  const match = cookie.match(/\bcf_user=([^;]+)/);
  return match ? decodeURIComponent(match[1].trim()) : null;
}

export async function GET(req: Request) {
  try {
    let user = userFromRequestCookie(req);
    if (!user) user = await getUserAsync();
    if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
    const items = await listMyAssignments(user);
    const res = NextResponse.json({ ok: true, items });
    res.cookies.set(USER_COOKIE, user, { path: "/", sameSite: "lax", maxAge: 30 * 24 * 60 * 60 });
    return res;
  } catch (e) {
    console.error("[assignments/my]", e);
    return NextResponse.json({ ok: false, error: "Failed to load assignments" }, { status: 500 });
  }
}
