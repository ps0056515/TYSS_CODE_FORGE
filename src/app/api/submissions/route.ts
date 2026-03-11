import { NextResponse } from "next/server";
import { z } from "zod";
import { listSubmissions } from "@/lib/submissions";
import { getUser } from "@/lib/auth";

export const runtime = "nodejs";

const Schema = z.object({
  problemSlug: z.string().min(1)
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = Schema.safeParse({ problemSlug: url.searchParams.get("problemSlug") ?? "" });
  if (!parsed.success) {
    return NextResponse.json({ ok: false, stderr: "Missing problemSlug" }, { status: 400 });
  }

  const items = await listSubmissions(parsed.data.problemSlug, 25);
  const user = getUser();
  const mine = user ? await listSubmissions(parsed.data.problemSlug, 25, user) : [];
  return NextResponse.json({ ok: true, items, mine, user });
}

