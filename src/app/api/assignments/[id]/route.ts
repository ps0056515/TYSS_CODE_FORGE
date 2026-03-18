import { NextResponse } from "next/server";
import { z } from "zod";
import { getAssignment, updateAssignment, deleteAssignment } from "@/lib/assignment-platform-store";
import { getUserAsync, isAdminUser, USER_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const assignment = await getAssignment(id);
  if (!assignment) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, item: assignment });
}

const PatchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  kind: z.enum(["assignment", "assessment"]).optional(),
  dueAt: z.string().optional(),
  startAt: z.string().optional().or(z.literal("")),
  endAt: z.string().optional().or(z.literal("")),
  type: z.enum(["general", "coding_set", "project_usecase"]).optional(),
  templateRepoUrl: z.string().url().optional().or(z.literal("")),
  codeforgeProblemId: z.string().optional().or(z.literal("")),
  projectInstructions: z.string().optional(),
  codingSet: z
    .object({
      filters: z
        .object({
          tags: z.array(z.string().min(1)).optional(),
          difficulties: z.array(z.enum(["Easy", "Medium", "Hard"])).optional(),
          languages: z.array(z.enum(["javascript", "python", "java", "cpp"])).optional(),
          count: z.number().int().min(1).max(200).optional(),
        })
        .optional(),
      problemSlugs: z.array(z.string().min(1)).default([]),
      completionScoreThreshold: z.number().int().min(0).max(100).optional(),
    })
    .optional(),
});

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

    const patch = {
      ...parsed.data,
      templateRepoUrl: parsed.data.templateRepoUrl || undefined,
      codeforgeProblemId: parsed.data.codeforgeProblemId || undefined,
      startAt: parsed.data.startAt || undefined,
      endAt: parsed.data.endAt || undefined,
    };
    const updated = await updateAssignment(id, patch);
    if (!updated) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    const res = NextResponse.json({ ok: true, item: updated });
    res.cookies.set(USER_COOKIE, user, { path: "/", sameSite: "lax", maxAge: 30 * 24 * 60 * 60 });
    return res;
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserAsync();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  if (!isAdminUser(user)) return NextResponse.json({ ok: false, error: "Admins only" }, { status: 403 });
  const { id } = await params;
  const result = await deleteAssignment(id);
  if (!result.ok) {
    const status = result.error === "Not found" ? 404 : 409;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(USER_COOKIE, user, { path: "/", sameSite: "lax", maxAge: 30 * 24 * 60 * 60 });
  return res;
}
