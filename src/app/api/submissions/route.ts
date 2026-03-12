import { NextResponse } from "next/server";
import { z } from "zod";
import { listSubmissions } from "@/lib/submissions";
import { getUserAsync, USER_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

const Schema = z.object({
  problemSlug: z.string().min(1)
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = Schema.safeParse({ problemSlug: url.searchParams.get("problemSlug") ?? "" });
  if (!parsed.success) {
    return NextResponse.json({ ok: false, stderr: "Missing problemSlug" }, { status: 400 });
  }

  const items = await listSubmissions(parsed.data.problemSlug, 25);
  const user = await getUserAsync();
  const mine = user ? await listSubmissions(parsed.data.problemSlug, 25, user) : [];
  const res = NextResponse.json({ ok: true, items, mine, user });
  // Best-effort cookie sync (helps clients that rely on cf_user).
  if (user) {
    res.cookies.set(USER_COOKIE, user, { path: "/", sameSite: "lax", maxAge: 30 * 24 * 60 * 60 });
  }
  return res;
}

