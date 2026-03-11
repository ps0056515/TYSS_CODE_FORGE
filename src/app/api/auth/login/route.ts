import { NextResponse } from "next/server";
import { z } from "zod";
import { USER_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

const Schema = z.object({
  username: z
    .string()
    .min(2)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, underscore")
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = Schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, stderr: "Invalid username" }, { status: 400 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(USER_COOKIE, parsed.data.username, {
      httpOnly: false,
      sameSite: "lax",
      path: "/"
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false, stderr: "Server error" }, { status: 500 });
  }
}

