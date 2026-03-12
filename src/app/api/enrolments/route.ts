import { NextResponse } from "next/server";
import { z } from "zod";
import {
  listEnrolments,
  joinAssignment,
  listEnrolmentsByUser,
  getAssignment,
} from "@/lib/assignment-platform-store";
import { getUserAsync, USER_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const assignmentId = searchParams.get("assignmentId");
  const userId = searchParams.get("userId");
  if (assignmentId) {
    const list = await listEnrolments(assignmentId);
    return NextResponse.json({ ok: true, items: list });
  }
  if (userId) {
    const list = await listEnrolmentsByUser(userId);
    return NextResponse.json({ ok: true, items: list });
  }
  return NextResponse.json({ ok: false, error: "assignmentId or userId required" }, { status: 400 });
}

const JoinSchema = z.object({ assignmentId: z.string().min(1) });

export async function POST(req: Request) {
  const user = await getUserAsync();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  try {
    const json = await req.json();
    const parsed = JoinSchema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    const assignment = await getAssignment(parsed.data.assignmentId);
    if (!assignment) return NextResponse.json({ ok: false, error: "Assignment not found" }, { status: 404 });
    const enrolment = await joinAssignment(parsed.data.assignmentId, user);
    const res = NextResponse.json({ ok: true, item: enrolment });
    res.cookies.set(USER_COOKIE, user, { path: "/", sameSite: "lax", maxAge: 30 * 24 * 60 * 60 });
    return res;
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
