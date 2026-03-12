import { NextResponse } from "next/server";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { getUserAsync, USER_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

type Line = {
  problemSlug: string;
  user: string;
  verdict?: "AC" | "PARTIAL" | "WA" | "RE" | "TLE";
  score?: number;
  allPass?: boolean; // backward compat
};

function toVerdict(s: Line) {
  if (s.verdict) return s.verdict;
  if (typeof s.allPass === "boolean") return s.allPass ? "AC" : "WA";
  return "WA";
}

export async function GET() {
  const user = await getUserAsync();
  if (!user) return NextResponse.json({ ok: true, user: null, solved: [], counts: { ac: 0, total: 0 } });

  const file = path.join(process.cwd(), "data", "submissions.jsonl");
  let raw = "";
  try {
    raw = await fs.readFile(file, "utf8");
  } catch {
    return NextResponse.json({ ok: true, user, solved: [], counts: { ac: 0, total: 0 } });
  }

  const solved = new Set<string>();
  let total = 0;
  let ac = 0;

  for (const line of raw.split("\n").filter(Boolean)) {
    try {
      const s = JSON.parse(line) as Line;
      if (s.user !== user) continue;
      total += 1;
      if (toVerdict(s) === "AC" || s.score === 100) {
        ac += 1;
        solved.add(s.problemSlug);
      }
    } catch {
      // ignore
    }
  }

  const res = NextResponse.json({
    ok: true,
    user,
    solved: Array.from(solved.values()),
    counts: { ac, total }
  });
  res.cookies.set(USER_COOKIE, user, { path: "/", sameSite: "lax", maxAge: 30 * 24 * 60 * 60 });
  return res;
}

