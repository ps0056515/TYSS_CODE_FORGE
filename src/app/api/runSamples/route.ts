import { NextResponse } from "next/server";
import { z } from "zod";
import { getProblemBySlug } from "@/lib/problems_store";

export const runtime = "nodejs";

const Schema = z.object({
  problemSlug: z.string().min(1),
  language: z.string().min(1),
  code: z.string().min(1)
});

function norm(s: string) {
  return (s ?? "").replace(/\r\n/g, "\n").trim();
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = Schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, stderr: "Invalid payload" }, { status: 400 });
    }

    const { problemSlug, language, code } = parsed.data;
    const problem = await getProblemBySlug(problemSlug);
    if (!problem) {
      return NextResponse.json({ ok: false, stderr: "Problem not found" }, { status: 404 });
    }

    const tests = problem.examples.map((e) => ({ input: e.input, expected: e.output }));

    const results = [];
    for (const t of tests) {
      const res = await fetch(new URL("/api/run", req.url), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, input: t.input })
      });
      const data = (await res.json()) as { ok: boolean; stdout?: string; stderr?: string };
      const actual = data.ok ? data.stdout ?? "" : data.stderr ?? "";
      const pass = data.ok && norm(actual) === norm(t.expected);
      results.push({
        ok: data.ok,
        pass,
        input: t.input,
        expected: t.expected,
        actual
      });
    }

    const allPass = results.every((r) => r.pass);
    return NextResponse.json({ ok: true, allPass, results });
  } catch {
    return NextResponse.json({ ok: false, stderr: "Server error" }, { status: 500 });
  }
}

