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

function getFormData(req: Request): Promise<{ username: string | null; callbackUrl: string | null }> {
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    return req.formData().then((fd) => ({
      username: (fd.get("username") as string)?.trim() ?? null,
      callbackUrl: (fd.get("callbackUrl") as string)?.trim() ?? null,
    }));
  }
  return req.json().then((body: { username?: string; callbackUrl?: string }) => ({
    username: (body?.username as string)?.trim() ?? null,
    callbackUrl: (body?.callbackUrl as string)?.trim() ?? null,
  }));
}

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  const isForm = contentType.includes("application/x-www-form-urlencoded");
  const base = new URL(req.url).origin;

  try {
    const { username: raw, callbackUrl } = await getFormData(req);
    const parsed = Schema.safeParse({ username: raw ?? "" });
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Invalid username (2–24 chars, letters, numbers, underscore only)";
      if (isForm) {
        return NextResponse.redirect(`${base}/login?error=${encodeURIComponent(msg)}`);
      }
      return NextResponse.json({ ok: false, stderr: msg }, { status: 400 });
    }

    const cookieOptions = {
      httpOnly: false,
      sameSite: "lax" as const,
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    };

    if (isForm) {
      const dest = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/practice";
      const redirectUrl = new URL(dest, req.url);
      const res = NextResponse.redirect(redirectUrl);
      res.cookies.set(USER_COOKIE, parsed.data.username, cookieOptions);
      return res;
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(USER_COOKIE, parsed.data.username, cookieOptions);
    return res;
  } catch {
    if (isForm) {
      return NextResponse.redirect(`${base}/login?error=${encodeURIComponent("Server error. Try again.")}`);
    }
    return NextResponse.json({ ok: false, stderr: "Server error" }, { status: 500 });
  }
}

