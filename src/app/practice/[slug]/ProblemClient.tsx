"use client";

import * as React from "react";
import { Play, ListChecks, Lightbulb } from "lucide-react";
import { Button, Card } from "@/components/ui";
import Editor from "@monaco-editor/react";

type Lang = "javascript" | "python" | "java" | "cpp";

const LANG_LABEL: Record<Lang, string> = {
  javascript: "JavaScript",
  python: "Python",
  java: "Java",
  cpp: "C++"
};

function EditorShell({
  language,
  value,
  onChange
}: {
  language: Lang;
  value: string;
  onChange: (v: string) => void;
}) {
  const monacoLang =
    language === "javascript" ? "javascript" : language === "python" ? "python" : language === "java" ? "java" : "cpp";

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-black/40">
      <Editor
        height="380px"
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
      className="w-full min-h-[96px] rounded-xl bg-black/40 border border-border p-4 font-mono text-sm text-text outline-none focus:ring-2 focus:ring-brand/50"
      onChange={(e) => onChange(e.target.value)}
      placeholder="Custom stdin input (optional)"
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
// Java runner not enabled yet in this MVP.
public class Main {
  public static void main(String[] args) throws Exception {
    System.out.println("Java not enabled yet.");
  }
}
`;
  }
  if (language === "cpp") {
    return `// ${title}
// C++ runner not enabled yet in this MVP.
#include <bits/stdc++.h>
using namespace std;
int main() {
  cout << "C++ not enabled yet." << endl;
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

export function ProblemClient({
  starter,
  title,
  problemSlug
}: {
  starter: string;
  title: string;
  problemSlug: string;
}) {
  const [code, setCode] = React.useState(starter);
  const [output, setOutput] = React.useState<string>("");
  const [stdin, setStdin] = React.useState<string>("");
  const [running, setRunning] = React.useState(false);
  const [runningSamples, setRunningSamples] = React.useState(false);
  const [language, setLanguage] = React.useState<Lang>("javascript");
  const [sampleResults, setSampleResults] = React.useState<
    | null
    | {
        allPass: boolean;
        results: { pass: boolean; ok: boolean; input: string; expected: string; actual: string }[];
      }
  >(null);
  const [submissions, setSubmissions] = React.useState<
    {
      id: string;
      createdAt: string;
      language: string;
      verdict: "AC" | "PARTIAL" | "WA" | "RE" | "TLE";
      score: number;
    }[]
  >([]);
  const [mine, setMine] = React.useState<
    {
      id: string;
      createdAt: string;
      language: string;
      verdict: "AC" | "PARTIAL" | "WA" | "RE" | "TLE";
      score: number;
    }[]
  >([]);
  const [user, setUser] = React.useState<string | null>(null);

  async function refreshSubmissions() {
    const res = await fetch(`/api/submissions?problemSlug=${encodeURIComponent(problemSlug)}`);
    const data = (await res.json()) as
      | {
          ok: true;
          user: string | null;
          items: {
            id: string;
            createdAt: string;
            language: string;
            verdict: "AC" | "PARTIAL" | "WA" | "RE" | "TLE";
            score: number;
          }[];
          mine: {
            id: string;
            createdAt: string;
            language: string;
            verdict: "AC" | "PARTIAL" | "WA" | "RE" | "TLE";
            score: number;
          }[];
        }
      | { ok: false };
    if ("ok" in data && data.ok) {
      setUser(data.user);
      setSubmissions(data.items);
      setMine(data.mine);
    }
  }

  React.useEffect(() => {
    void refreshSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemSlug]);

  async function run() {
    setRunning(true);
    setOutput("");
    setSampleResults(null);
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, input: stdin })
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
    try {
      const res = await fetch("/api/runSamples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemSlug, language, code })
      });
      const data = (await res.json()) as
        | { ok: true; allPass: boolean; results: { pass: boolean; ok: boolean; input: string; expected: string; actual: string }[] }
        | { ok: false; stderr: string };

      if ("ok" in data && data.ok === true) {
        setSampleResults({ allPass: data.allPass, results: data.results });
      } else {
        setOutput(("stderr" in data && data.stderr) || "Run samples failed.");
      }
    } catch (e) {
      setOutput(e instanceof Error ? e.message : "Run samples failed.");
    } finally {
      setRunningSamples(false);
    }
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs tracking-[0.35em] text-muted">EDITOR</div>
              <div className="text-sm text-muted mt-2">Choose language, write code, and run.</div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => {
                  const next = e.target.value as Lang;
                  setLanguage(next);
                  setCode(templateFor(next, title));
                  setOutput("");
                }}
                className="h-10 rounded-xl bg-black/40 border border-border px-3 text-sm text-text outline-none focus:ring-2 focus:ring-brand/50"
              >
                {(Object.keys(LANG_LABEL) as Lang[]).map((l) => (
                  <option key={l} value={l}>
                    {LANG_LABEL[l]}
                  </option>
                ))}
              </select>
              <Button type="button" onClick={runSamples} disabled={runningSamples || running}>
                <ListChecks className="h-4 w-4" /> {runningSamples ? "Running..." : "Run Samples"}
              </Button>
              <Button type="button" onClick={run} disabled={running}>
                <Play className="h-4 w-4" /> {running ? "Running..." : "Run"}
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <EditorShell language={language} value={code} onChange={setCode} />
          </div>
        </div>

        <div className="w-full lg:w-64 lg:flex-shrink-0 rounded-xl border border-border bg-black/40 p-4 text-xs text-muted space-y-2">
          <div className="flex items-center gap-2 text-text">
            <Lightbulb className="h-4 w-4 text-amber-300" />
            <span className="text-[11px] tracking-[0.2em]">LANGUAGE HINTS</span>
          </div>
          {language === "python" && (
            <ul className="list-disc list-inside space-y-1">
              <li>Use <code>sys.stdin.read()</code> for full input.</li>
              <li>Remember to print only the required output.</li>
            </ul>
          )}
          {language === "javascript" && (
            <ul className="list-disc list-inside space-y-1">
              <li>Use <code>{`fs.readFileSync(0, "utf8")`}</code> to read stdin.</li>
              <li>Avoid console logs other than the final answer.</li>
            </ul>
          )}
          {language === "java" && (
            <ul className="list-disc list-inside space-y-1">
              <li>
                Class name must be <code>Main</code>.
              </li>
              <li>
                Use <code>Scanner</code> or <code>BufferedReader</code> for input.
              </li>
            </ul>
          )}
          {language === "cpp" && (
            <ul className="list-disc list-inside space-y-1">
              <li>Use fast I/O (<code>ios::sync_with_stdio(false)</code>).</li>
              <li>Print exactly as required (no extra spaces).</li>
            </ul>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs tracking-[0.35em] text-muted">INPUT</div>
        <div className="mt-2">
          <InputShell value={stdin} onChange={setStdin} />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs tracking-[0.35em] text-muted">OUTPUT</div>
        <pre className="mt-2 min-h-[120px] rounded-xl bg-black/40 border border-border p-4 font-mono text-sm text-text whitespace-pre-wrap">
          {output}
        </pre>
      </div>

      {sampleResults ? (
        <div className="mt-4">
          <div className="text-xs tracking-[0.35em] text-muted">SAMPLE RESULTS</div>
          <div className="mt-2 text-sm">
            {sampleResults.allPass ? (
              <span className="text-emerald-300">All sample tests passed.</span>
            ) : (
              <span className="text-rose-300">Some sample tests failed.</span>
            )}
          </div>
          <div className="mt-3 grid gap-3">
            {sampleResults.results.map((r, i) => (
              <div key={i} className="rounded-xl border border-border bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Sample #{i + 1}</div>
                  <div className={r.pass ? "text-emerald-300 text-xs" : "text-rose-300 text-xs"}>
                    {r.pass ? "PASS" : r.ok ? "FAIL" : "ERROR"}
                  </div>
                </div>
                <div className="text-xs text-muted mt-3">Input</div>
                <pre className="mt-1 text-sm whitespace-pre-wrap">{r.input}</pre>
                <div className="text-xs text-muted mt-3">Expected</div>
                <pre className="mt-1 text-sm whitespace-pre-wrap">{r.expected}</pre>
                <div className="text-xs text-muted mt-3">Actual</div>
                <pre className="mt-1 text-sm whitespace-pre-wrap">{r.actual}</pre>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-sm text-muted">
              Submit runs hidden tests and stores your verdict.
            </div>
            <Button
              type="button"
              disabled={!sampleResults || runningSamples || running}
              onClick={async () => {
                const res = await fetch("/api/submit", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ problemSlug, language, code, samplesPass: sampleResults.allPass })
                });
                const data = (await res.json()) as { ok: boolean; verdict?: string; score?: number; stderr?: string };
                if (!data.ok) setOutput(data.stderr ?? "Submit failed.");
                if (data.ok) await refreshSubmissions();
              }}
            >
              Submit
            </Button>
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        <div className="text-xs tracking-[0.35em] text-muted">SUBMISSIONS</div>
        <div className="mt-2 text-sm text-muted">
          {user ? (
            <span>
              Signed in as <span className="text-text font-semibold">{user}</span>
            </span>
          ) : (
            <span>
              Not signed in. Go to <a className="underline" href="/login">/login</a> to submit.
            </span>
          )}
        </div>

        {user ? (
          <div className="mt-4">
            <div className="text-xs tracking-[0.35em] text-muted">MY SUBMISSIONS</div>
            <div className="mt-2 grid gap-2">
              {mine.length === 0 ? (
                <div className="text-sm text-muted">No submissions yet.</div>
              ) : (
                mine.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-xl border border-border bg-white/5 p-3 flex items-center justify-between"
                  >
                    <div className="text-sm">
                      <span
                        className={
                          s.verdict === "AC"
                            ? "text-emerald-300"
                            : s.verdict === "PARTIAL"
                              ? "text-amber-300"
                            : s.verdict === "WA"
                              ? "text-rose-300"
                              : s.verdict === "TLE"
                                ? "text-amber-300"
                                : "text-rose-300"
                        }
                      >
                        {s.verdict === "PARTIAL" ? `PARTIAL (${s.score})` : s.verdict}
                      </span>
                      <span className="text-muted">· {LANG_LABEL[s.language as Lang] ?? s.language}</span>
                    </div>
                    <div className="text-xs text-muted">{new Date(s.createdAt).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}

        <div className="mt-2 grid gap-2">
          {submissions.length === 0 ? (
            <div className="text-sm text-muted">No submissions yet.</div>
          ) : (
            submissions.map((s) => (
              <div key={s.id} className="rounded-xl border border-border bg-white/5 p-3 flex items-center justify-between">
                <div className="text-sm">
                  <span
                    className={
                      s.verdict === "AC"
                        ? "text-emerald-300"
                        : s.verdict === "PARTIAL"
                          ? "text-amber-300"
                        : s.verdict === "WA"
                          ? "text-rose-300"
                          : s.verdict === "TLE"
                            ? "text-amber-300"
                            : "text-rose-300"
                    }
                  >
                    {s.verdict === "PARTIAL" ? `PARTIAL (${s.score})` : s.verdict}
                  </span>
                  <span className="text-muted">· {LANG_LABEL[s.language as Lang] ?? s.language}</span>
                </div>
                <div className="text-xs text-muted">{new Date(s.createdAt).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}

