import { NextResponse } from "next/server";
import { z } from "zod";
import { spawn } from "node:child_process";
import * as fs from "node:fs/promises";
import * as fsSync from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

const RunSchema = z.object({
  language: z.string().min(1),
  code: z.string().min(1),
  input: z.string().optional().default("")
});

export const runtime = "nodejs";

const MAX_OUTPUT_CHARS = 80_000;
const TIMEOUT_MS = 2_000;

type RunResult = { ok: boolean; stdout: string; stderr: string };

function runProcess(command: string, args: string[], input: string): Promise<RunResult> {
  return new Promise<RunResult>((resolve) => {
    const child = spawn(command, args, {
      stdio: ["pipe", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";
    let finished = false;

    const timeout = setTimeout(() => {
      if (finished) return;
      stderr += `\nTime Limit Exceeded (${TIMEOUT_MS}ms)`;
      child.kill("SIGKILL");
    }, TIMEOUT_MS);

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");

    child.stdout.on("data", (chunk) => {
      if (stdout.length < MAX_OUTPUT_CHARS) stdout += chunk;
      if (stdout.length + stderr.length > MAX_OUTPUT_CHARS) child.kill("SIGKILL");
    });
    child.stderr.on("data", (chunk) => {
      if (stderr.length < MAX_OUTPUT_CHARS) stderr += chunk;
      if (stdout.length + stderr.length > MAX_OUTPUT_CHARS) child.kill("SIGKILL");
    });

    child.on("error", (err) => {
      finished = true;
      clearTimeout(timeout);
      resolve({ ok: false, stdout: "", stderr: err.message });
    });

    child.on("close", (code) => {
      finished = true;
      clearTimeout(timeout);
      resolve({
        ok: code === 0,
        stdout: stdout.slice(0, MAX_OUTPUT_CHARS),
        stderr: stderr.slice(0, MAX_OUTPUT_CHARS)
      });
    });

    child.stdin.write(input ?? "");
    child.stdin.end();
  });
}

async function runJavaScript(code: string, input: string) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "codeforge-"));
  const file = path.join(dir, "main.js");
  await fs.writeFile(file, code, "utf8");

  return await runProcess(process.execPath, [file], input).finally(async () => {
    // Best-effort cleanup
    try {
      await fs.rm(dir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });
}

async function runPython(code: string, input: string) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "codeforge-"));
  const file = path.join(dir, "main.py");
  await fs.writeFile(file, code, "utf8");

  // Windows-friendly: try `python`, then fallback to `py -3`
  const first = await runProcess("python", [file], input);
  if (!first.ok && /not recognized|ENOENT/i.test(first.stderr)) {
    const second = await runProcess("py", ["-3", file], input);
    return second;
  }

  return first;
}

async function runJava(code: string, input: string) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "codeforge-"));
  const file = path.join(dir, "Main.java");
  await fs.writeFile(file, code, "utf8");

  const compile = await runProcess("javac", [file], "");
  if (!compile.ok && /not recognized|ENOENT/i.test(compile.stderr)) {
    return {
      ok: false,
      stdout: "",
      stderr:
        "Java not installed. Install a JDK (adds `javac` and `java` to PATH), then retry.\nSuggested: Temurin (Adoptium) JDK 17+."
    };
  }
  if (!compile.ok) return compile;

  // Run from the temp directory so Main.class is discoverable
  const run = await runProcess("java", ["-cp", dir, "Main"], input);
  return run;
}

async function runCpp(code: string, input: string) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "codeforge-"));
  const file = path.join(dir, "main.cpp");
  const exe = path.join(dir, process.platform === "win32" ? "main.exe" : "main");
  await fs.writeFile(file, code, "utf8");

  const compile = await runProcess("g++", ["-O2", "-std=c++17", file, "-o", exe], "");
  if (!compile.ok && /not recognized|ENOENT/i.test(compile.stderr)) {
    return {
      ok: false,
      stdout: "",
      stderr:
        "C++ compiler not installed. Install MSYS2/MinGW-w64 (g++) or Visual Studio Build Tools, ensure `g++` is on PATH, then retry."
    };
  }
  if (!compile.ok) return compile;

  // Ensure executable exists (compile might succeed but path issues)
  if (!fsSync.existsSync(exe)) {
    return { ok: false, stdout: "", stderr: "Compiled binary not found after compilation." };
  }

  const run = await runProcess(exe, [], input);
  return run;
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = RunSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, stderr: "Invalid payload" }, { status: 400 });
    }

    const { language, code, input } = parsed.data;

    if (language === "javascript") {
      const result = await runJavaScript(code, input);
      return NextResponse.json(result);
    }

    if (language === "python") {
      const result = await runPython(code, input);
      return NextResponse.json(result);
    }

    if (language === "java") {
      const result = await runJava(code, input);
      return NextResponse.json(result);
    }

    if (language === "cpp") {
      const result = await runCpp(code, input);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      {
        ok: false,
        stdout: "",
        stderr:
          `Language not supported yet: ${language}`
      },
      { status: 400 }
    );
  } catch {
    return NextResponse.json({ ok: false, stderr: "Server error" }, { status: 500 });
  }
}

