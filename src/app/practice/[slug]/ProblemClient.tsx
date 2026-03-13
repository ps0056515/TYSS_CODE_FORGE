"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, ListChecks, Send, Upload, FileArchive, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { Button } from "@/components/ui";
import Editor from "@monaco-editor/react";
import { cn } from "@/lib/cn";
import { verdictLabel, verdictColorClass } from "@/lib/verdicts";

type Lang = "javascript" | "python" | "java" | "cpp";

const LANG_LABEL: Record<Lang, string> = {
  javascript: "JavaScript",
  python: "Python",
  java: "Java",
  cpp: "C++"
};

type Verdict = "AC" | "PARTIAL" | "WA" | "RE" | "TLE";

function EditorShell({
  language,
  value,
  onChange,
  height
}: {
  language: Lang;
  value: string;
  onChange: (v: string) => void;
  height: string;
}) {
  const monacoLang =
    language === "javascript" ? "javascript" : language === "python" ? "python" : language === "java" ? "java" : "cpp";

  return (
    <div className="rounded-b border border-t-0 border-border overflow-hidden bg-[#1e1e1e] flex-1 min-h-[200px]">
      <Editor
        height={height}
        defaultLanguage={monacoLang}
        language={monacoLang}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "JetBrains Mono, Menlo, Monaco, Consolas, 'Courier New', monospace",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: "on"
        }}
      />
    </div>
  );
}

function InputShell({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      value={value}
      spellCheck={false}
      className="w-full h-full min-h-[80px] rounded border border-border bg-[#1e1e1e] p-3 font-mono text-sm text-white/90 placeholder:text-white/40 outline-none focus:ring-2 focus:ring-brand/50 resize-y"
      onChange={(e) => onChange(e.target.value)}
      placeholder="Custom input (stdin)"
      name="stdin"
    />
  );
}

function templateFor(language: Lang, title: string) {
  if (language === "python") {
    return `# ${title}
# Write your solution here.

import sys

def solve(data: str) -> str:
    # TODO
    return ""

if __name__ == "__main__":
    data = sys.stdin.read()
    sys.stdout.write(str(solve(data)).strip())
`;
  }
  if (language === "java") {
    return `// ${title}
public class Main {
  public static void main(String[] args) throws Exception {
    // TODO
  }
}
`;
  }
  if (language === "cpp") {
    return `// ${title}
#include <bits/stdc++.h>
using namespace std;
int main() {
  // TODO
  return 0;
}
`;
  }
  return `// ${title}
// Write your solution here.

function solve(input) {
  // TODO
  return "";
}

console.log(solve(require("fs").readFileSync(0, "utf8")));
`;
}

const CODE_STORAGE_KEY = "codeforge:code:";

export function ProblemClient({
  starter,
  title,
  problemSlug,
  problemType = "algorithm",
  assignmentId,
  problemSlugs,
  problemIndex,
}: {
  starter: string;
  title: string;
  problemSlug: string;
  problemType?: "algorithm" | "project";
  assignmentId?: string;
  problemSlugs?: string[];
  problemIndex?: number;
}) {
  const router = useRouter();
  const [code, setCodeState] = React.useState(starter);
  const codeRef = React.useRef(code);
  const setCode = React.useCallback((v: string) => {
    codeRef.current = v;
    setCodeState(v);
  }, []);
  const [output, setOutput] = React.useState<string>("");
  const [stdin, setStdin] = React.useState<string>("");
  const [running, setRunning] = React.useState(false);
  const [runningSamples, setRunningSamples] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [language, setLanguage] = React.useState<Lang>("javascript");
  const [lastSubmitTestResults, setLastSubmitTestResults] = React.useState<
    { input: string; expected: string; actual: string; pass: boolean }[] | null
  >(null);
  const [sampleResults, setSampleResults] = React.useState<
    | null
    | {
        allPass: boolean;
        results: { pass: boolean; ok: boolean; input: string; expected: string; actual: string }[];
      }
  >(null);
  type MineEntry = {
    id: string;
    createdAt: string;
    language: string;
    verdict: Verdict;
    score: number;
    code?: string;
    projectResult?: { useCaseResults: { id: string; title: string; passed: boolean; message?: string }[] };
  };
  const [submissions, setSubmissions] = React.useState<
    { id: string; createdAt: string; language: string; verdict: Verdict; score: number }[]
  >([]);
  const [mine, setMine] = React.useState<MineEntry[]>([]);
  const [viewCodeSubmission, setViewCodeSubmission] = React.useState<MineEntry | null>(null);
  const [user, setUser] = React.useState<string | null>(null);
  const editorContainerRef = React.useRef<HTMLDivElement>(null);
  const [editorHeight, setEditorHeight] = React.useState("320px");
  // Project submission state
  const [projectFile, setProjectFile] = React.useState<File | null>(null);
  const [projectSubmitting, setProjectSubmitting] = React.useState(false);
  const [lastProjectResult, setLastProjectResult] = React.useState<{
    verdict: string;
    score: number;
    useCaseResults?: { id: string; title: string; passed: boolean; message?: string }[];
  } | null>(null);

  React.useEffect(() => {
    const el = editorContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const h = el.clientHeight;
      setEditorHeight(`${Math.max(200, h)}px`);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Load saved code from localStorage when problem changes (avoids stale execution; user sees last saved)
  React.useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(CODE_STORAGE_KEY + problemSlug) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as { code?: string; language?: Lang };
        if (parsed.code) {
          codeRef.current = parsed.code;
          setCodeState(parsed.code);
          if (parsed.language) setLanguage(parsed.language);
        }
      } else {
        codeRef.current = starter;
        setCodeState(starter);
      }
    } catch {
      codeRef.current = starter;
      setCodeState(starter);
    }
  }, [problemSlug, starter]);

  const nextSlug = problemSlugs && problemIndex != null && problemIndex + 1 < problemSlugs.length ? problemSlugs[problemIndex + 1] : null;
  const prevSlug = problemSlugs && problemIndex != null && problemIndex > 0 ? problemSlugs[problemIndex - 1] : null;
  const assignmentParams = (idx: number) => (assignmentId ? `?assignmentId=${encodeURIComponent(assignmentId)}&problemIndex=${idx}` : "");

  async function refreshSubmissions() {
    const res = await fetch(`/api/submissions?problemSlug=${encodeURIComponent(problemSlug)}`);
    const data = (await res.json()) as
      | { ok: true; user: string | null; items: unknown[]; mine: unknown[] }
      | { ok: false };
    if ("ok" in data && data.ok) {
      setUser(data.user);
      setSubmissions((data.items ?? []) as typeof submissions);
      setMine((data.mine ?? []) as typeof mine);
    }
  }

  React.useEffect(() => {
    void refreshSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when problemSlug changes
  }, [problemSlug]);

  async function run() {
    setRunning(true);
    setOutput("");
    setLastSubmitTestResults(null);
    const codeToRun = codeRef.current ?? code;
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code: codeToRun, input: stdin }),
      });
      const data = (await res.json()) as { ok: boolean; stdout?: string; stderr?: string };
      setOutput(data.ok ? data.stdout ?? "" : data.stderr ?? "Run failed.");
    } catch (e) {
      setOutput(e instanceof Error ? e.message : "Run failed.");
    } finally {
      setRunning(false);
    }
  }

  async function runSamples() {
    setRunningSamples(true);
    setOutput("");
    setSampleResults(null);
    setLastSubmitTestResults(null);
    const codeToRun = codeRef.current ?? code;
    try {
      const res = await fetch("/api/runSamples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemSlug, language, code: codeToRun }),
      });
      const data = (await res.json()) as
        | { ok: true; allPass: boolean; results: { pass: boolean; ok: boolean; input: string; expected: string; actual: string }[] }
        | { ok: false; stderr: string };
      if ("ok" in data && data.ok) setSampleResults({ allPass: data.allPass, results: data.results });
      else {
        const msg = ("stderr" in data && data.stderr) || "Run samples failed.";
        setOutput(
          msg +
            "\n\nTip: Ensure sample input format matches the problem (e.g. space-separated numbers like \"2 3\", or one value per line)."
        );
      }
    } catch (e) {
      setOutput(
        (e instanceof Error ? e.message : "Run samples failed.") +
          "\n\nTip: Check that your sample input format matches the problem (e.g. space-separated numbers, correct line endings)."
      );
    } finally {
      setRunningSamples(false);
    }
  }

  async function submit() {
    if (!sampleResults) return;
    const codeToSubmit = codeRef.current ?? code;
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problemSlug, language, code: codeToSubmit, samplesPass: sampleResults.allPass }),
    });
    const data = (await res.json()) as {
      ok: boolean;
      verdict?: string;
      score?: number;
      stderr?: string;
      testResults?: { input: string; expected: string; actual: string; pass: boolean }[];
    };
    if (!data.ok) {
      setOutput(data.stderr ?? "Submit failed.");
      setLastSubmitTestResults(null);
      return;
    }
    await refreshSubmissions();
    const v = data.verdict ?? "—";
    const s = data.score != null ? ` | Score: ${data.score}` : "";
    setLastSubmitTestResults(data.testResults ?? null);
    const hint =
      v === "RE" ? "\n\nYour code could not run successfully. Click Run to see the error, fix it, then submit again."
      : v === "TLE" ? "\n\nYour solution took too long. Try optimizing your approach and submit again."
      : v === "WA" ? "\n\nYour output did not match expected output on some hidden tests. See test details below."
      : v === "PARTIAL" ? "\n\nSome test groups passed, some failed. Improve the solution to pass all tests."
      : "";
    setOutput(`Submit completed.\nResult: ${verdictLabel(v)}${s}${hint}`);
  }

  async function submitProject() {
    if (!projectFile || problemType !== "project") return;
    setProjectSubmitting(true);
    setLastProjectResult(null);
    setOutput("");
    try {
      const form = new FormData();
      form.set("problemSlug", problemSlug);
      form.set("file", projectFile);
      const res = await fetch("/api/submit-project", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as {
        ok: boolean;
        verdict?: string;
        score?: number;
        projectResult?: { useCaseResults: { id: string; title: string; passed: boolean; message?: string }[] };
        stderr?: string;
      };
      if (!data.ok) {
        setOutput(data.stderr ?? "Submit failed.");
        return;
      }
      setLastProjectResult({
        verdict: data.verdict ?? "—",
        score: data.score ?? 0,
        useCaseResults: data.projectResult?.useCaseResults,
      });
      setOutput(`Submit successful.\nVerdict: ${data.verdict ?? "—"} | Score: ${data.score ?? 0}`);
      await refreshSubmissions();
    } catch (e) {
      setOutput(e instanceof Error ? e.message : "Submit failed.");
    } finally {
      setProjectSubmitting(false);
    }
  }

  const showAlgorithmActions = problemType !== "project";

  // Prevent resubmitting identical code when the last submission was already accepted
  const lastACSubmission = React.useMemo(
    () => mine.find((m) => m.verdict === "AC"),
    [mine]
  );
  const normalizeCode = (s: string) => (s ?? "").trim();
  const isSameCodeAsLastAC = Boolean(
    lastACSubmission &&
    lastACSubmission.code !== undefined &&
    normalizeCode(lastACSubmission.code) === normalizeCode(code)
  );
  const canSubmit = sampleResults && !runningSamples && !running && !isSameCodeAsLastAC && !submitting;

  function saveToStorageAndNext() {
    try {
      const key = CODE_STORAGE_KEY + problemSlug;
      localStorage.setItem(key, JSON.stringify({ code: codeRef.current ?? code, language }));
    } catch {}
    if (nextSlug != null && assignmentId != null)
      router.push(`/practice/${nextSlug}${assignmentParams((problemIndex ?? 0) + 1)}`);
  }

  async function handleSubmit() {
    if (!sampleResults || submitting) return;
    if (isSameCodeAsLastAC) {
      setOutput("You have already submitted this code. Modify your code to submit again.");
      return;
    }
    setSubmitting(true);
    try {
      await submit();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-black/30 shrink-0">
        {showAlgorithmActions ? (
          <>
            <span className="text-xs text-muted mr-1">Language</span>
            <select
              value={language}
              onChange={(e) => {
                const next = e.target.value as Lang;
                setLanguage(next);
                setCode(templateFor(next, title));
                setOutput("");
              }}
              className="h-8 rounded border border-border bg-black/40 px-2 text-sm text-text outline-none focus:ring-2 focus:ring-brand/50"
            >
              {(Object.keys(LANG_LABEL) as Lang[]).map((l) => (
                <option key={l} value={l}>{LANG_LABEL[l]}</option>
              ))}
            </select>
            <Button type="button" variant="ghost" onClick={run} disabled={running} className="gap-1 py-1.5 px-3 text-xs">
              <Play className="h-3.5 w-3.5" /> {running ? "Running..." : "Run"}
            </Button>
            <Button type="button" variant="ghost" onClick={runSamples} disabled={runningSamples || running} className="gap-1 py-1.5 px-3 text-xs">
              <ListChecks className="h-3.5 w-3.5" /> {runningSamples ? "Running..." : "Run Samples"}
            </Button>
            <Button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="gap-1 py-1.5 px-3 text-xs ml-auto"
            >
              <Send className="h-3.5 w-3.5" /> {submitting ? "Submitting…" : "Submit"}
            </Button>
          </>
        ) : (
          <span className="text-xs text-muted">Project — upload a ZIP of your codebase</span>
        )}
      </div>

      {/* Disabled reason for Submit (avoids confusion) */}
      {showAlgorithmActions && (
        <div className="px-4 py-2 border-b border-border bg-black/15 text-sm text-muted">
          {!sampleResults && (
            <>Run <strong>Run Samples</strong> to enable <strong>Submit</strong>. Submit runs hidden tests for grading.</>
          )}
          {sampleResults && isSameCodeAsLastAC && (
            <span>You have already submitted this code. Change your solution to submit again.</span>
          )}
          {sampleResults && !isSameCodeAsLastAC && !runningSamples && !running && !submitting && (
            <>Run Samples passed. Click <strong>Submit</strong> to run hidden tests.</>
          )}
          {submitting && <span className="text-amber-600 dark:text-amber-400">Submitting… please wait.</span>}
        </div>
      )}

      {problemType === "project" ? (
        /* Project: upload ZIP + result */
        <div className="flex-1 min-h-0 flex flex-col overflow-auto">
          <div className="p-4 space-y-4 border-b border-border">
            <p className="text-sm text-muted">
              Upload a <strong>.zip</strong> containing your solution (e.g. <code className="bg-white/10 px-1 rounded">solution.js</code>). Max 5 MB. The server will run the test suite and show use-case results.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 cursor-pointer rounded-lg border border-border bg-black/30 px-3 py-2 text-sm hover:bg-white/5 transition">
                <FileArchive className="h-4 w-4" />
                <input
                  type="file"
                  accept=".zip,application/zip"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setProjectFile(f ?? null);
                    setLastProjectResult(null);
                  }}
                />
                {projectFile ? projectFile.name : "Choose ZIP"}
              </label>
              <Button
                type="button"
                disabled={!projectFile || projectSubmitting}
                onClick={submitProject}
                className="gap-1"
              >
                <Upload className="h-3.5 w-3.5" />
                {projectSubmitting ? "Submitting…" : "Submit project"}
              </Button>
            </div>
          </div>
          <div className="p-4 flex-1 overflow-auto">
            <div className="text-xs font-medium text-muted uppercase mb-2">Result</div>
            {lastProjectResult ? (
              <div className="space-y-3">
                <p className="text-sm">
                  <span className={cn("font-semibold", verdictColorClass(lastProjectResult.verdict))}>
                    {verdictLabel(lastProjectResult.verdict)}
                  </span>
                  {" "}
                  <span className="text-muted">Score: {lastProjectResult.score}/100</span>
                </p>
                {lastProjectResult.useCaseResults && lastProjectResult.useCaseResults.length > 0 && (
                  <ul className="space-y-2">
                    {lastProjectResult.useCaseResults.map((uc) => (
                      <li
                        key={uc.id}
                        className={cn(
                          "rounded border px-3 py-2 text-sm",
                          uc.passed ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-rose-500/30 bg-rose-500/10 text-rose-200"
                        )}
                      >
                        <span className="font-medium">{uc.title}</span>
                        {uc.passed ? " — Passed" : ` — Failed${uc.message ? `: ${uc.message}` : ""}`}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : output ? (
              <pre className="rounded border border-border bg-[#1e1e1e] p-3 font-mono text-sm text-white/90 whitespace-pre-wrap">
                {output}
              </pre>
            ) : (
              <p className="text-sm text-muted">Submit your project to see results.</p>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Editor — fills available space */}
          <div ref={editorContainerRef} className="flex-1 min-h-0 flex flex-col">
            <EditorShell language={language} value={code} onChange={setCode} height={editorHeight} />
          </div>

          {/* Input | Output — side by side like CodeChef */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-border shrink-0">
            <div className="border-r border-border p-3 flex flex-col min-h-[100px]">
              <div className="text-xs font-medium text-muted uppercase mb-2">Custom Input</div>
              <InputShell value={stdin} onChange={setStdin} />
            </div>
            <div className="p-3 flex flex-col min-h-[100px] min-w-0">
              <div className="text-xs font-medium text-muted uppercase mb-2 shrink-0">Output</div>
              <pre className="flex-1 min-h-[60px] min-w-0 rounded border border-border bg-[#1e1e1e] p-3 font-mono text-sm text-white/90 whitespace-pre-wrap overflow-auto">
                {output || "Run your code to see output."}
              </pre>
            </div>
          </div>
        </>
      )}

      {/* Submission test case details (hidden test breakdown) */}
      {lastSubmitTestResults != null && lastSubmitTestResults.length > 0 && (
        <div className="px-4 py-3 border-t border-border bg-black/20 shrink-0">
          <div className="text-xs font-semibold text-muted uppercase mb-2">Test case details</div>
          <div className="space-y-2 max-h-[200px] overflow-auto">
            {lastSubmitTestResults.map((r, i) => (
              <div key={i} className={cn("rounded border p-2 text-xs", r.pass ? "border-emerald-500/30 bg-emerald-500/10" : "border-rose-500/30 bg-rose-500/10")}>
                <span className={cn("font-medium", r.pass ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                  Test {i + 1}: {r.pass ? "Passed" : "Failed"}
                </span>
                {!r.pass && (
                  <div className="mt-1 grid gap-1 font-mono text-muted">
                    <div>Input: <pre className="inline whitespace-pre-wrap break-all">{r.input}</pre></div>
                    <div>Expected: <pre className="inline whitespace-pre-wrap break-all">{r.expected}</pre></div>
                    <div>Actual: <pre className="inline whitespace-pre-wrap break-all">{r.actual}</pre></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sample results + Submit reminder */}
      {sampleResults && showAlgorithmActions && (
        <div className="px-4 py-3 border-t border-border bg-black/20 shrink-0">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <span
              className={cn(
                "text-sm font-medium",
                sampleResults.allPass ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"
              )}
            >
              {sampleResults.allPass ? "All sample tests passed." : "Some sample tests failed. Open \"View sample details\" below to see expected vs actual output."}
            </span>
            <div className="flex items-center gap-2">
              {assignmentId && nextSlug != null && (
                <Button type="button" variant="ghost" onClick={saveToStorageAndNext} className="py-1.5 px-3 text-xs gap-1">
                  <Save className="h-3.5 w-3.5" /> Save and Next
                </Button>
              )}
              <Button disabled={!canSubmit} onClick={handleSubmit} className="py-1.5 px-3 text-xs">
                <Send className="h-3.5 w-3.5 mr-1" /> {submitting ? "Submitting…" : "Submit"}
              </Button>
            </div>
          </div>
          <details className="mt-2">
            <summary className="text-xs text-muted cursor-pointer">View sample details</summary>
            <div className="mt-2 space-y-2">
              {sampleResults.results.map((r, i) => (
                <div key={i} className="rounded border border-border bg-black/30 p-2 text-xs">
                  <span className={cn("font-medium", r.pass ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300")}>
                    Sample {i + 1}: {r.pass ? "Passed" : r.ok ? "Failed" : "Error"}
                  </span>
                  {!r.pass && (
                    <pre className="mt-1 text-muted">Expected: {r.expected}\nActual: {r.actual}</pre>
                  )}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Assignment: Next / Previous question */}
      {assignmentId && problemSlugs && problemSlugs.length > 0 && (
        <div className="px-4 py-2 border-t border-border bg-black/10 shrink-0 flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs text-muted">
            Assignment · Question {(problemIndex ?? 0) + 1} of {problemSlugs.length}
          </span>
          <div className="flex items-center gap-2">
            {prevSlug != null && (
              <Link
                href={`/practice/${prevSlug}${assignmentParams((problemIndex ?? 1) - 1)}`}
                className="inline-flex items-center gap-1 text-xs text-brand hover:underline"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </Link>
            )}
            {nextSlug != null && (
              <Link
                href={`/practice/${nextSlug}${assignmentParams((problemIndex ?? 0) + 1)}`}
                className="inline-flex items-center gap-1 text-xs text-brand hover:underline"
              >
                Next question <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Submissions strip */}
      <div className="px-4 py-2 border-t border-border bg-black/10 shrink-0">
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          <span className="text-muted">
            {user ? (
              <>Signed in as <span className="text-text font-medium">{user}</span></>
            ) : (
              <>Not signed in. <a href="/login" className="underline">Log in</a> to submit.</>
            )}
          </span>
          {user && mine.length > 0 && (
            <span className="text-muted flex items-center gap-2 flex-wrap">
              Your submissions (click to view code):
              {mine.slice(0, 5).map((s, idx, arr) => (
                <span key={s.id} className="inline-flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewCodeSubmission(s)}
                    className={cn(
                      "underline hover:no-underline focus:outline-none focus:ring-1 focus:ring-brand/50 rounded px-0.5",
                      verdictColorClass(s.verdict)
                    )}
                    title="View submitted code"
                  >
                    {verdictLabel(s.verdict)}{s.score !== undefined && s.verdict === "PARTIAL" ? ` (${s.score})` : ""}
                  </button>
                  {idx < arr.length - 1 && <span className="text-muted">·</span>}
                </span>
              ))}
            </span>
          )}
        </div>
      </div>

      {/* Modal: view previously submitted code */}
      {viewCodeSubmission && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={() => setViewCodeSubmission(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Submitted code"
        >
          <div
            className="bg-background border border-border rounded-xl shadow-xl max-w-4xl w-full max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border shrink-0">
              <span className="text-sm font-medium text-text">
                Submission — {verdictLabel(viewCodeSubmission.verdict)}
                {viewCodeSubmission.score !== undefined && viewCodeSubmission.verdict === "PARTIAL" && ` (${viewCodeSubmission.score})`}
                {" "}
                · {viewCodeSubmission.language} · {new Date(viewCodeSubmission.createdAt).toLocaleString()}
              </span>
              <Button type="button" variant="ghost" className="text-xs py-1.5 px-3" onClick={() => setViewCodeSubmission(null)}>
                Close
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4 min-h-0">
              {viewCodeSubmission.code !== undefined && viewCodeSubmission.code !== "" ? (
                <pre className="text-xs font-mono text-text whitespace-pre-wrap break-words bg-[#1e1e1e] rounded-lg p-4 overflow-auto">
                  {viewCodeSubmission.code}
                </pre>
              ) : (
                <p className="text-sm text-muted">Code not stored for this submission (e.g. project upload).</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
