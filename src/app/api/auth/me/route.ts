import { NextResponse } from "next/server";
import { getUser, isAdminUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const user = getUser();
  return NextResponse.json({ ok: true, user, role: user && isAdminUser(user) ? "admin" : "student" });
}

