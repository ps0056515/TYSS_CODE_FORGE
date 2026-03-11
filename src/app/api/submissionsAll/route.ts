import { NextResponse } from "next/server";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { z } from "zod";

export const runtime = "nodejs";

const Schema = z.object({
  limit: z.coerce.number().min(1).max(200).optional().default(50)
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = Schema.safeParse({ limit: url.searchParams.get("limit") ?? undefined });
  if (!parsed.success) return NextResponse.json({ ok: false, stderr: "Invalid query" }, { status: 400 });

  const file = path.join(process.cwd(), "data", "submissions.jsonl");
  let raw = "";
  try {
    raw = await fs.readFile(file, "utf8");
  } catch {
    return NextResponse.json({ ok: true, items: [] });
  }

  const lines = raw.split("\n").filter(Boolean);
  const items = [];
  for (let i = lines.length - 1; i >= 0 && items.length < parsed.data.limit; i--) {
    try {
      items.push(JSON.parse(lines[i]));
    } catch {
      // ignore
    }
  }

  return NextResponse.json({ ok: true, items });
}

