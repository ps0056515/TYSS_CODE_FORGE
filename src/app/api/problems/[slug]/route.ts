import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getProblemBySlug,
  updateProblem,
  deleteProblem,
  isCustomProblem,
} from "@/lib/problems_store";
import { getUserAsync, isAdminUser, USER_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const problem = await getProblemBySlug(slug);
  if (!problem) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  const custom = await isCustomProblem(slug);
  return NextResponse.json({ ok: true, item: problem, custom });
}

const ExampleSchema = z.object({
  input: z.string(),
  output: z.string(),
  explanation: z.string().optional(),
});

const HiddenTestSchema = z.object({
  input: z.string(),
  output: z.string(),
});

const PatchSchema = z.object({
  title: z.string().min(2).max(120).optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  tags: z.array(z.string().min(1).max(30)).optional(),
  languages: z.array(z.enum(["javascript", "python", "java", "cpp"])).optional(),
  statement: z.string().optional(),
  type: z.enum(["algorithm", "project"]).optional(),
  examples: z.array(ExampleSchema).optional(),
  hiddenTests: z.array(HiddenTestSchema).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getUserAsync();
  if (!user) return NextResponse.json({ ok: false, stderr: "Not signed in" }, { status: 401 });
  if (!isAdminUser(user)) return NextResponse.json({ ok: false, stderr: "Admins only" }, { status: 403 });

  const { slug } = await params;
  const custom = await isCustomProblem(slug);
  if (!custom) return NextResponse.json({ ok: false, stderr: "Built-in problems cannot be edited" }, { status: 400 });

  try {
    const json = await req.json();
    const parsed = PatchSchema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ ok: false, stderr: "Invalid payload" }, { status: 400 });

    const updated = await updateProblem(slug, parsed.data);
    if (!updated) return NextResponse.json({ ok: false, stderr: "Not found" }, { status: 404 });

    const res = NextResponse.json({ ok: true, item: updated });
    res.cookies.set(USER_COOKIE, user, { path: "/", sameSite: "lax", maxAge: 30 * 24 * 60 * 60 });
    return res;
  } catch {
    return NextResponse.json({ ok: false, stderr: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getUserAsync();
  if (!user) return NextResponse.json({ ok: false, stderr: "Not signed in" }, { status: 401 });
  if (!isAdminUser(user)) return NextResponse.json({ ok: false, stderr: "Admins only" }, { status: 403 });

  const { slug } = await params;
  const custom = await isCustomProblem(slug);
  if (!custom) return NextResponse.json({ ok: false, stderr: "Built-in problems cannot be deleted" }, { status: 400 });

  const deleted = await deleteProblem(slug);
  if (!deleted) return NextResponse.json({ ok: false, stderr: "Not found" }, { status: 404 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(USER_COOKIE, user, { path: "/", sameSite: "lax", maxAge: 30 * 24 * 60 * 60 });
  return res;
}
