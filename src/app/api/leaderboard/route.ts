import { NextResponse } from "next/server";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { z } from "zod";

export const runtime = "nodejs";

const Schema = z.object({
  problemSlug: z.string().optional()
});

type SubmissionLine = {
  problemSlug: string;
  user: string;
  verdict?: "AC" | "PARTIAL" | "WA" | "RE" | "TLE";
  score?: number;
  allPass?: boolean; // backward compat
};

function toVerdict(s: SubmissionLine) {
  if (s.verdict) return s.verdict;
  if (typeof s.allPass === "boolean") return s.allPass ? "AC" : "WA";
  return "WA";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = Schema.safeParse({ problemSlug: url.searchParams.get("problemSlug") ?? undefined });
  if (!parsed.success) {
    return NextResponse.json({ ok: false, stderr: "Invalid query" }, { status: 400 });
  }

  const problemSlug = parsed.data.problemSlug;
  const file = path.join(process.cwd(), "data", "submissions.jsonl");

  let raw = "";
  try {
    raw = await fs.readFile(file, "utf8");
  } catch {
    return NextResponse.json({ ok: true, rows: [] });
  }

  const rows = new Map<string, { user: string; bestScore: number; ac: number; attempts: number }>();
  for (const line of raw.split("\n").filter(Boolean)) {
    try {
      const s = JSON.parse(line) as SubmissionLine;
      if (problemSlug && s.problemSlug !== problemSlug) continue;
      if (!s.user) continue;

      const key = s.user;
      const r = rows.get(key) ?? { user: s.user, bestScore: 0, ac: 0, attempts: 0 };
      r.attempts += 1;
      const score = typeof s.score === "number" ? s.score : toVerdict(s) === "AC" ? 100 : 0;
      if (score > r.bestScore) r.bestScore = score;
      if (toVerdict(s) === "AC" || score === 100) r.ac += 1;
      rows.set(key, r);
    } catch {
      // ignore
    }
  }

  return NextResponse.json({
    ok: true,
    rows: Array.from(rows.values())
      .sort((a, b) => b.bestScore - a.bestScore || b.ac - a.ac || b.attempts - a.attempts)
      .slice(0, 50)
  });
}

