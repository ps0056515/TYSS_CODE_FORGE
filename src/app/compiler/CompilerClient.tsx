"use client";

import * as React from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui";
import { Play } from "lucide-react";
import { cn } from "@/lib/cn";

type Lang = "javascript" | "python" | "java" | "cpp";

const LANGS: { id: Lang; label: string }[] = [
  { id: "cpp", label: "C++" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "javascript", label: "JavaScript" },
];

function template(lang: Lang) {
  switch (lang) {
    case "python":
      return `# Write your code here\n\nprint("Hello from Python")\n`;
    case "java":
      return `// Write your code here\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello from Java");\n  }\n}\n`;
    case "cpp":
      return `// Write your code here\n#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n  cout << "Hello from C++" << "\\n";\n  return 0;\n}\n`;
    default:
      return `// Write your code here\nconsole.log("Hello from JavaScript");\n`;
  }
}

const MONACO_LOAD_TIMEOUT_MS = 12_000;

export function CompilerClient() {
  const [language, setLanguage] = React.useState<Lang>("cpp");
  const [code, setCode] = React.useState<string>(template("cpp"));
  const [stdin, setStdin] = React.useState<string>("");
  const [stdout, setStdout] = React.useState<string>("");
  const [stderr, setStderr] = React.useState<string>("");
  const [running, setRunning] = React.useState(false);
  const [monacoReady, setMonacoReady] = React.useState(false);
  const [monacoFailed, setMonacoFailed] = React.useState(false);

  const monacoLang =
    language === "cpp" ? "cpp" : language === "java" ? "java" : language === "python" ? "python" : "javascript";

  React.useEffect(() => {
    if (monacoReady) return;
    const t = setTimeout(() => setMonacoFailed(true), MONACO_LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [monacoReady]);

  async function run() {
    setRunning(true);
    setStdout("");
    setStderr("");
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, input: stdin }),
      });
      const data = (await res.json()) as { ok: boolean; stdout?: string; stderr?: string };
      if (data.ok) setStdout(data.stdout ?? "");
      else setStderr(data.stderr ?? "Run failed.");
    } catch (e) {
      setStderr(e instanceof Error ? e.message : "Run failed.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_420px] min-h-[520px]">
      {/* Left: language picker */}
      <div className="border-r border-border bg-black/10">
        <div className="p-4 border-b border-border">
          <div className="text-xs text-muted uppercase font-semibold tracking-widest">Select language</div>
        </div>
        <div className="p-3 space-y-1">
          {LANGS.map((l) => {
            const active = l.id === language;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => {
                  setLanguage(l.id);
                  setCode(template(l.id));
                  setStdout("");
                  setStderr("");
                }}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg border text-sm transition",
                  active
                    ? "bg-brand/15 border-brand/40 text-text"
                    : "bg-white/5 border-border text-muted hover:bg-white/10 hover:text-text"
                )}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Middle: editor */}
      <div className="min-w-0 bg-[#1e1e1e]">
        <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-border bg-black/30">
          <div className="text-sm text-muted">Editor</div>
          <Button onClick={run} disabled={running} className="py-1.5 px-3 text-xs gap-1">
            <Play className="h-3.5 w-3.5" /> {running ? "Running..." : "Run"}
          </Button>
        </div>
        {monacoFailed ? (
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="w-full h-[460px] min-h-[200px] rounded-b border border-t-0 border-border bg-[#1e1e1e] p-3 font-mono text-sm text-white/90 resize-y focus:ring-2 focus:ring-brand/50 focus:ring-offset-0"
            placeholder="Write your code here"
          />
        ) : (
          <Editor
            height="460px"
            defaultLanguage={monacoLang}
            language={monacoLang}
            value={code}
            onChange={(v) => setCode(v ?? "")}
            onMount={() => setMonacoReady(true)}
            loading={
              <div className="h-[460px] flex items-center justify-center text-muted bg-[#1e1e1e]">
                Loading editor…
              </div>
            }
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "JetBrains Mono, Menlo, Monaco, Consolas, 'Courier New', monospace",
              automaticLayout: true,
              scrollBeyondLastLine: false,
              wordWrap: "on",
            }}
          />
        )}
      </div>

      {/* Right: input + output — error box is scrollable and never obscured */}
      <div className="border-l border-border bg-black/10 flex flex-col min-w-0 min-h-0">
        <div className="p-4 border-b border-border shrink-0">
          <div className="text-sm font-semibold text-text">Input / Output</div>
        </div>

        <div className="p-4 flex flex-col gap-4 flex-1 min-h-0 overflow-hidden">
          <div className="shrink-0">
            <div className="text-xs text-muted uppercase font-semibold tracking-widest">Input</div>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              className="mt-2 w-full min-h-[100px] rounded-xl border border-border bg-[#1e1e1e] p-3 font-mono text-sm text-white/90 placeholder:text-white/40 outline-none focus:ring-2 focus:ring-brand/50"
              placeholder="Enter input here (stdin)"
            />
            <div className="mt-2 text-xs text-muted">
              If your code takes input, add it in the box above before running.
            </div>
          </div>

          <div className="flex flex-col min-h-0 flex-1">
            <div className="text-xs text-muted uppercase font-semibold tracking-widest shrink-0">Output</div>
            <pre
              className={cn(
                "mt-2 flex-1 min-h-0 w-full rounded-xl border p-3 font-mono text-sm whitespace-pre-wrap overflow-auto resize-none",
                stderr ? "border-amber-500/50 bg-amber-950/30 text-amber-100" : "border-border bg-[#1e1e1e] text-white/90"
              )}
            >
              {stderr ? stderr : stdout ? stdout : "Run your code to see output."}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

