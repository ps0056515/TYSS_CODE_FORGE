import { NextResponse } from "next/server";
import { z } from "zod";
import { listAssignments, createAssignment } from "@/lib/assignment-platform-store";
import { getUserAsync, isAdminUser, USER_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const batchId = searchParams.get("batchId");
  if (!batchId) return NextResponse.json({ ok: false, error: "batchId required" }, { status: 400 });
  const list = await listAssignments(batchId);
  return NextResponse.json({ ok: true, items: list });
}

const CreateSchema = z.object({
  batchId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().default(""),
  dueAt: z.string().min(1),
  type: z.enum(["general", "coding_set", "project_usecase"]).optional(),
  templateRepoUrl: z.string().url().optional().or(z.literal("")),
  codeforgeProblemId: z.string().optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const user = await getUserAsync();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  if (!isAdminUser(user)) return NextResponse.json({ ok: false, error: "Admins only" }, { status: 403 });
  try {
    const json = await req.json();
    const parsed = CreateSchema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    const item = await createAssignment({
      ...parsed.data,
      type: parsed.data.type ?? "general",
      templateRepoUrl: parsed.data.templateRepoUrl || undefined,
      codeforgeProblemId: parsed.data.codeforgeProblemId || undefined,
    });
    const res = NextResponse.json({ ok: true, item });
    res.cookies.set(USER_COOKIE, user, { path: "/", sameSite: "lax", maxAge: 30 * 24 * 60 * 60 });
    return res;
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
