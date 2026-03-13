import { NextResponse } from "next/server";
import { z } from "zod";
import { updateBusinessUnit } from "@/lib/assignment-platform-store";
import { getUserAsync, isAdminUser, USER_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

const PatchSchema = z.object({ name: z.string().min(1).max(120) });

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserAsync();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  if (!isAdminUser(user)) return NextResponse.json({ ok: false, error: "Admins only" }, { status: 403 });
  const { id } = await params;
  try {
    const json = await req.json();
    const parsed = PatchSchema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    const item = await updateBusinessUnit(id, parsed.data);
    if (!item) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    const res = NextResponse.json({ ok: true, item });
    res.cookies.set(USER_COOKIE, user, { path: "/", sameSite: "lax", maxAge: 30 * 24 * 60 * 60 });
    return res;
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
