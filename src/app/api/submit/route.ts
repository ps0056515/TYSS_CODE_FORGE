import { NextResponse } from "next/server";
import { z } from "zod";
import { appendSubmission } from "@/lib/submissions";
import { getProblemBySlug } from "@/lib/problems_store";
import { getUserAsync, USER_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

const Schema = z.object({
  problemSlug: z.string().min(1),
  language: z.string().min(1),
  code: z.string().min(1),
  samplesPass: z.boolean().optional().default(false)
});

function id() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = Schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, stderr: "Invalid payload" }, { status: 400 });
    }

    const s = parsed.data;
    const user = await getUserAsync();
    if (!user) {
      return NextResponse.json({ ok: false, stderr: "Not signed in" }, { status: 401 });
    }
    const problem = await getProblemBySlug(s.problemSlug);
    if (!problem) {
      return NextResponse.json({ ok: false, stderr: "Problem not found" }, { status: 404 });
    }

    // Project problems (type === "project"): would run runConfig.testCommand against uploaded
    // codebase, read result.json for useCaseResults + score. Not implemented yet — see docs/EVALUATION_LOGIC.md.
    if (problem.type === "project") {
      return NextResponse.json(
        { ok: false, stderr: "Project submission (ZIP/codebase) is not supported yet. Use algorithm problems." },
        { status: 400 }
      );
    }

    const norm = (x: string) => (x ?? "").replace(/\r\n/g, "\n").trim();

    /** Run one test in isolation; uses only the code from this request (no caching). */
    async function runOne(input: string, expected: string): Promise<
      { ok: true; pass: boolean; actual: string } | { ok: false; kind: "RE" | "TLE"; actual?: string }
    > {
      const res = await fetch(new URL("/api/run", req.url), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: s.language, code: s.code, input }),
      });
      const data = (await res.json()) as { ok: boolean; stdout?: string; stderr?: string };
      if (!data.ok) {
        const err = (data.stderr ?? "").toLowerCase();
        const kind = err.includes("time limit exceeded") ? ("TLE" as const) : ("RE" as const);
        return { ok: false, kind, actual: data.stderr ?? "" };
      }
      const actual = norm(data.stdout ?? "");
      const pass = actual === norm(expected);
      return { ok: true, pass, actual };
    }

    // Scoring
    let verdict: "AC" | "PARTIAL" | "WA" | "RE" | "TLE" = "WA";
    let score = 0;

    const scoring = problem.scoring?.mode ?? "verdict";
    if (scoring === "subtasks" && problem.scoring?.subtasks?.length) {
      verdict = "PARTIAL";
      score = 0;

      for (const st of problem.scoring.subtasks) {
        let subtaskPass = true;
        for (const t of st.tests) {
          const r = await runOne(t.input, t.output);
          if (!r.ok) {
            verdict = (r as { kind: "RE" | "TLE" }).kind;
            subtaskPass = false;
            break;
          }
          if (!r.pass) {
            subtaskPass = false;
            break;
          }
        }
        if (verdict === "RE" || verdict === "TLE") break;
        if (subtaskPass) score += st.points;
      }

      if (verdict !== "RE" && verdict !== "TLE") {
        if (score >= 100) {
          verdict = "AC";
          score = 100;
        } else if (score === 0) {
          verdict = "WA";
        }
      }
    } else {
      const hidden = problem.hiddenTests ?? [];
      if (hidden.length === 0) {
        return NextResponse.json({ ok: false, stderr: "No hidden tests configured for this problem" }, { status: 400 });
      }

      const testResults: { input: string; expected: string; actual: string; pass: boolean }[] = [];
      verdict = "AC";
      for (const t of hidden) {
        const r = await runOne(t.input, t.output);
        const actual = r.ok ? (r as { actual: string }).actual : (r as { actual?: string }).actual ?? "";
        const pass = r.ok && (r as { pass: boolean }).pass;
        testResults.push({ input: t.input, expected: t.output, actual, pass });
        if (!r.ok) {
          verdict = (r as { kind: "RE" | "TLE" }).kind;
          break;
        }
        if (!r.pass) {
          verdict = "WA";
          break;
        }
      }
      score = verdict === "AC" ? 100 : 0;

      await appendSubmission({
        id: id(),
        createdAt: new Date().toISOString(),
        problemSlug: s.problemSlug,
        user,
        language: s.language,
        verdict,
        score,
        code: s.code,
        samplesPass: s.samplesPass
      });

      const res = NextResponse.json({ ok: true, verdict, score, testResults });
      res.cookies.set(USER_COOKIE, user, { path: "/", sameSite: "lax", maxAge: 30 * 24 * 60 * 60 });
      return res;
    }

    await appendSubmission({
      id: id(),
      createdAt: new Date().toISOString(),
      problemSlug: s.problemSlug,
      user,
      language: s.language,
      verdict,
      score,
      code: s.code,
      samplesPass: s.samplesPass
    });

    const res = NextResponse.json({ ok: true, verdict, score });
    res.cookies.set(USER_COOKIE, user, { path: "/", sameSite: "lax", maxAge: 30 * 24 * 60 * 60 });
    return res;
  } catch {
    return NextResponse.json({ ok: false, stderr: "Server error" }, { status: 500 });
  }
}

