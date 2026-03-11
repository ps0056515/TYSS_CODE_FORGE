import { NextResponse } from "next/server";
import { z } from "zod";
import { addProblem, listProblems } from "@/lib/problems_store";
import { getUser, isAdminUser } from "@/lib/auth";

export const runtime = "nodejs";

const ProblemSchema = z.object({
  title: z.string().min(2).max(120),
  slug: z.string().optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  tags: z.array(z.string().min(1).max(30)).default([]),
  languages: z.array(z.enum(["javascript", "python", "java", "cpp"])).min(1),
  statement: z.string().optional()
});

export async function GET() {
  const items = await listProblems();
  return NextResponse.json({ ok: true, items });
}

export async function POST(req: Request) {
  const user = getUser();
  if (!user) return NextResponse.json({ ok: false, stderr: "Not signed in" }, { status: 401 });
  if (!isAdminUser(user)) return NextResponse.json({ ok: false, stderr: "Admins only" }, { status: 403 });

  try {
    const json = await req.json();
    const parsed = ProblemSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, stderr: "Invalid payload" }, { status: 400 });
    }

    const created = await addProblem(parsed.data);
    return NextResponse.json({ ok: true, item: created });
  } catch {
    return NextResponse.json({ ok: false, stderr: "Server error" }, { status: 500 });
  }
}

