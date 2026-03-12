import { NextResponse } from "next/server";
import { z } from "zod";
import { addProblem, listProblems } from "@/lib/problems_store";
import { getUserAsync, isAdminUser, USER_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

const ExampleSchema = z.object({
  input: z.string(),
  output: z.string(),
  explanation: z.string().optional()
});

const ProblemSchema = z.object({
  title: z.string().min(2).max(120),
  slug: z.string().min(1).max(80).optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  tags: z.array(z.string().min(1).max(30)).default([]),
  languages: z.array(z.enum(["javascript", "python", "java", "cpp"])).min(1),
  statement: z.string().optional(),
  type: z.enum(["algorithm", "project"]).optional(),
  examples: z.array(ExampleSchema).optional()
});

export async function GET() {
  const items = await listProblems();
  return NextResponse.json({ ok: true, items });
}

export async function POST(req: Request) {
  const user = await getUserAsync();
  if (!user) return NextResponse.json({ ok: false, stderr: "Not signed in" }, { status: 401 });
  if (!isAdminUser(user)) return NextResponse.json({ ok: false, stderr: "Admins only" }, { status: 403 });

  try {
    const json = await req.json();
    const parsed = ProblemSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, stderr: "Invalid payload" }, { status: 400 });
    }

    const created = await addProblem(parsed.data);
    const res = NextResponse.json({ ok: true, item: created });
    res.cookies.set(USER_COOKIE, user, { path: "/", sameSite: "lax", maxAge: 30 * 24 * 60 * 60 });
    return res;
  } catch {
    return NextResponse.json({ ok: false, stderr: "Server error" }, { status: 500 });
  }
}

