import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { appendSubmission } from "@/lib/submissions";
import { getProblemBySlug } from "@/lib/problems_store";
import { getUserAsync, USER_COOKIE } from "@/lib/auth";
import type { UseCaseResult } from "@/lib/submissions";

export const runtime = "nodejs";

/** Max size for uploaded ZIP (5 MB) */
const MAX_ZIP_BYTES = 5 * 1024 * 1024;

function submissionId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

type ResultJson = {
  useCaseResults?: { id: string; title: string; passed: boolean; message?: string }[];
  score?: number;
  codeQuality?: { score: number; summary?: string };
};

export async function POST(req: Request) {
  try {
    const user = await getUserAsync();
    if (!user) {
      return NextResponse.json({ ok: false, stderr: "Not signed in" }, { status: 401 });
    }

    const formData = await req.formData();
    const problemSlug = formData.get("problemSlug");
    const file = formData.get("file");

    if (typeof problemSlug !== "string" || !problemSlug.trim()) {
      return NextResponse.json({ ok: false, stderr: "Missing problemSlug" }, { status: 400 });
    }
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ ok: false, stderr: "Missing or invalid file (ZIP required)" }, { status: 400 });
    }

    const problem = await getProblemBySlug(problemSlug.trim());
    if (!problem) {
      return NextResponse.json({ ok: false, stderr: "Problem not found" }, { status: 404 });
    }
    if (problem.type !== "project" || !problem.runConfig) {
      return NextResponse.json(
        { ok: false, stderr: "This problem does not accept project (ZIP) submissions" },
        { status: 400 }
      );
    }

    const { testCommand, timeoutSeconds = 30 } = problem.runConfig;
    const testSuiteDir = path.join(process.cwd(), "data", "test-suites", problemSlug.trim());
    try {
      await fs.access(testSuiteDir);
    } catch {
      return NextResponse.json(
        { ok: false, stderr: `Test suite not found for this problem (expected: data/test-suites/${problemSlug})` },
        { status: 400 }
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    if (buf.length > MAX_ZIP_BYTES) {
      return NextResponse.json(
        { ok: false, stderr: `ZIP too large (max ${MAX_ZIP_BYTES / 1024 / 1024} MB)` },
        { status: 400 }
      );
    }

    let tempDir: string | null = null;
    try {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "codeforge-project-"));
      // Copy test suite (run.js etc.) into temp
      await fs.cp(testSuiteDir, tempDir, { recursive: true });
      // Extract student ZIP into temp (solution.js etc.)
      const AdmZip = (await import("adm-zip")).default;
      const zip = new AdmZip(buf);
      zip.extractAllTo(tempDir, true);

      const timeoutMs = Math.min(timeoutSeconds * 1000, 60_000);
      const resultJsonPath = path.join(tempDir, "result.json");
      // Remove result.json if left from a previous run so we can detect if the runner wrote it
      try {
        await fs.unlink(resultJsonPath);
      } catch {
        // ignore
      }

      const { stdout, stderr, exitCode } = await new Promise<{
        stdout: string;
        stderr: string;
        exitCode: number | null;
      }>((resolve) => {
        const child = spawn(testCommand, [], {
          cwd: tempDir!,
          shell: true,
          stdio: ["ignore", "pipe", "pipe"],
        });
        let out = "";
        let err = "";
        child.stdout?.on("data", (c) => (out += c.toString()));
        child.stderr?.on("data", (c) => (err += c.toString()));
        const t = setTimeout(() => {
          child.kill("SIGKILL");
          err += "\nTime limit exceeded.";
        }, timeoutMs);
        child.on("close", (code) => {
          clearTimeout(t);
          resolve({ stdout: out, stderr: err, exitCode: code ?? null });
        });
      });

      let resultJson: ResultJson | null = null;
      try {
        const raw = await fs.readFile(resultJsonPath, "utf8");
        resultJson = JSON.parse(raw) as ResultJson;
      } catch {
        // result.json missing or invalid — runner failed
      }

      let useCaseResults: UseCaseResult[] = [];
      let score = 0;
      let verdict: "AC" | "PARTIAL" | "WA" | "RE" | "TLE" = "WA";

      if (resultJson?.useCaseResults && Array.isArray(resultJson.useCaseResults)) {
        useCaseResults = resultJson.useCaseResults.map((r) => ({
          id: r.id ?? "",
          title: r.title ?? "",
          passed: Boolean(r.passed),
          message: r.message,
        }));
        score = typeof resultJson.score === "number"
          ? Math.min(100, Math.max(0, Math.round(resultJson.score)))
          : useCaseResults.length > 0
            ? Math.round(
                (useCaseResults.filter((u) => u.passed).length / useCaseResults.length) * 100
              )
            : 0;
        if (score >= 100) verdict = "AC";
        else if (score > 0) verdict = "PARTIAL";
        else verdict = "WA";
      } else {
        useCaseResults = [
          {
            id: "run",
            title: "Run tests",
            passed: false,
            message: exitCode !== 0
              ? (stderr || stdout || "Process exited with non-zero code").slice(0, 500)
              : "Test runner did not produce result.json",
          },
        ];
        if (stderr.toLowerCase().includes("time") && stderr.toLowerCase().includes("exceeded")) {
          verdict = "TLE";
        } else if (exitCode !== 0) {
          verdict = "RE";
        }
      }

      const projectResult = {
        useCaseResults,
        ...(resultJson?.codeQuality && {
          codeQuality: {
            score: resultJson.codeQuality.score,
            summary: resultJson.codeQuality.summary,
          },
        }),
      };

      await appendSubmission({
        id: submissionId(),
        createdAt: new Date().toISOString(),
        problemSlug: problem.slug,
        user,
        language: problem.runConfig.language,
        verdict,
        score,
        code: "[Project ZIP]",
        submissionType: "project",
        projectResult,
      });

      const res = NextResponse.json({
        ok: true,
        verdict,
        score,
        projectResult: { useCaseResults: projectResult.useCaseResults, codeQuality: projectResult.codeQuality },
      });
      res.cookies.set(USER_COOKIE, user, { path: "/", sameSite: "lax", maxAge: 30 * 24 * 60 * 60 });
      return res;
    } finally {
      if (tempDir) {
        try {
          await fs.rm(tempDir, { recursive: true, force: true });
        } catch {
          // best-effort cleanup
        }
      }
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ ok: false, stderr: message }, { status: 500 });
  }
}
