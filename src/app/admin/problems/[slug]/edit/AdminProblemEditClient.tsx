"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container, Card, Button } from "@/components/ui";
import {
  DATA_STRUCTURES,
  ALGORITHMS,
  COMPANIES,
} from "@/lib/practice-categories";
import { cn } from "@/lib/cn";
import type { Problem } from "@/lib/data";

type Lang = "javascript" | "python" | "java" | "cpp";
const LANGS: { id: Lang; label: string }[] = [
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
];

type ExampleRow = { input: string; output: string; explanation: string };

export function AdminProblemEditClient({
  slug,
  initialProblem,
}: {
  slug: string;
  initialProblem: Problem;
}) {
  const router = useRouter();
  const [title, setTitle] = React.useState(initialProblem.title);
  const [difficulty, setDifficulty] = React.useState<"Easy" | "Medium" | "Hard">(initialProblem.difficulty);
  const [tags, setTags] = React.useState<string[]>(initialProblem.tags ?? []);
  const [customTagInput, setCustomTagInput] = React.useState("");
  const [languages, setLanguages] = React.useState<Lang[]>((initialProblem.languages as Lang[]) ?? ["javascript", "python"]);
  const [statement, setStatement] = React.useState(initialProblem.statement ?? "");
  const [examples, setExamples] = React.useState<ExampleRow[]>(
    (initialProblem.examples?.length ? initialProblem.examples.map((e) => ({
      input: e.input,
      output: e.output,
      explanation: e.explanation ?? "",
    })) : [{ input: "", output: "", explanation: "" }]) as ExampleRow[]
  );
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const tagsList = React.useMemo(() => {
    const custom = customTagInput.split(",").map((t) => t.trim()).filter(Boolean);
    return [...new Set([...tags, ...custom])];
  }, [tags, customTagInput]);

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const addExample = () => setExamples((prev) => [...prev, { input: "", output: "", explanation: "" }]);
  const removeExample = (i: number) => setExamples((prev) => (prev.length > 1 ? prev.filter((_, j) => j !== i) : prev));
  const updateExample = (i: number, field: keyof ExampleRow, value: string) => {
    setExamples((prev) => prev.map((row, j) => (j === i ? { ...row, [field]: value } : row)));
  };

  const handleSubmit = async () => {
    setError(null);
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        difficulty,
        tags: tagsList,
        languages,
        statement: statement.trim() || undefined,
        examples: examples.filter((e) => e.input.trim() || e.output.trim()).map((e) => ({
          input: e.input.trim(),
          output: e.output.trim(),
          ...(e.explanation.trim() ? { explanation: e.explanation.trim() } : {}),
        })),
      };
      const res = await fetch(`/api/problems/${encodeURIComponent(slug)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok: boolean; stderr?: string };
      if (!data.ok) {
        setError(data.stderr ?? "Update failed.");
        return;
      }
      router.push("/admin/problems");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container className="py-8 md:py-10">
      <nav className="mb-6">
        <Link href="/admin/problems" className="text-sm text-muted hover:text-text transition">
          ← Back to Admin / Problems
        </Link>
      </nav>
      <div className="mb-8">
        <div className="text-xs tracking-[0.2em] text-muted uppercase">Admin</div>
        <h1 className="text-2xl font-extrabold text-text mt-1">Edit problem</h1>
        <p className="text-sm text-muted mt-2">Slug: <code className="bg-white/10 px-1 rounded">{slug}</code></p>
      </div>

      <div className="max-w-3xl space-y-8">
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-text border-b border-border pb-2 mb-4">Basic info</h2>
          <label className="grid gap-2">
            <span className="text-xs text-muted">Title *</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 rounded-xl bg-black/40 dark:bg-white/5 border border-border px-4 text-sm"
            />
          </label>
        </Card>

        <Card className="p-6">
          <h2 className="text-sm font-semibold text-text border-b border-border pb-2 mb-4">Classification</h2>
          <div className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-xs text-muted">Difficulty</span>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as "Easy" | "Medium" | "Hard")}
                className="h-11 rounded-xl bg-black/40 border border-border px-3 text-sm max-w-[140px]"
              >
                {(["Easy", "Medium", "Hard"] as const).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </label>
            <div>
              <span className="text-xs text-muted block mb-2">Topic tags</span>
              <div className="flex flex-wrap gap-2">
                {DATA_STRUCTURES.map((ds) => (
                  <button key={ds.id} type="button" onClick={() => toggleTag(ds.id)}
                    className={cn("text-xs rounded-lg border px-2.5 py-1.5", tags.includes(ds.id) ? "bg-brand/20 text-text border-brand/40" : "bg-white/5 text-muted border-border")}
                  >{ds.name}</button>
                ))}
                {ALGORITHMS.map((algo) => (
                  <button key={algo.id} type="button" onClick={() => toggleTag(algo.id)}
                    className={cn("text-xs rounded-lg border px-2.5 py-1.5", tags.includes(algo.id) ? "bg-brand/20 text-text border-brand/40" : "bg-white/5 text-muted border-border")}
                  >{algo.name}</button>
                ))}
                {COMPANIES.filter((c) => c.id !== "company-prep").map((co) => (
                  <button key={co.id} type="button" onClick={() => toggleTag(co.id)}
                    className={cn("text-xs rounded-lg border px-2.5 py-1.5", tags.includes(co.id) ? "bg-amber-500/20 text-amber-200 border-amber-500/40" : "bg-white/5 text-muted border-border")}
                  >{co.name}</button>
                ))}
              </div>
            </div>
            <label className="grid gap-2">
              <span className="text-xs text-muted">Additional tags (comma-separated)</span>
              <input value={customTagInput} onChange={(e) => setCustomTagInput(e.target.value)}
                className="h-11 rounded-xl bg-black/40 border border-border px-4 text-sm" placeholder="e.g. basics, loops" />
            </label>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-sm font-semibold text-text border-b border-border pb-2 mb-4">Allowed languages</h2>
          <div className="flex flex-wrap gap-2">
            {LANGS.map((l) => {
              const active = languages.includes(l.id);
              return (
                <button key={l.id} type="button"
                  onClick={() => setLanguages((prev) => (active ? prev.filter((x) => x !== l.id) : [...prev, l.id]))}
                  className={cn("text-sm rounded-xl border px-3 py-2", active ? "bg-brand/20 text-text border-brand/40" : "bg-white/5 text-muted border-border")}
                >{l.label}</button>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-sm font-semibold text-text border-b border-border pb-2 mb-4">Problem statement</h2>
          <textarea value={statement} onChange={(e) => setStatement(e.target.value)}
            className="min-h-[160px] w-full rounded-xl bg-black/40 border border-border px-4 py-3 text-sm" placeholder="Describe the problem..." />
        </Card>

        <Card className="p-6">
          <h2 className="text-sm font-semibold text-text border-b border-border pb-2 mb-4">Sample I/O</h2>
          <p className="text-xs text-muted mb-4">Use the same format as in the problem (e.g. space-separated numbers, one line per case).</p>
          <div className="space-y-4">
            {examples.map((ex, i) => (
              <div key={i} className="grid gap-2 rounded-xl border border-border p-4 bg-black/20">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted">Example {i + 1}</span>
                  <button type="button" onClick={() => removeExample(i)} className="text-xs text-muted hover:text-rose-400">Remove</button>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <label className="grid gap-1">
                    <span className="text-xs text-muted">Input</span>
                    <textarea value={ex.input} onChange={(e) => updateExample(i, "input", e.target.value)}
                      className="min-h-[60px] rounded-lg bg-black/40 border border-border px-3 py-2 text-xs font-mono"
                      placeholder="e.g. 2 3 or one value per line" />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-xs text-muted">Output</span>
                    <textarea value={ex.output} onChange={(e) => updateExample(i, "output", e.target.value)}
                      className="min-h-[60px] rounded-lg bg-black/40 border border-border px-3 py-2 text-xs font-mono"
                      placeholder="Expected output" />
                  </label>
                </div>
                <label className="grid gap-1">
                  <span className="text-xs text-muted">Explanation (optional)</span>
                  <input value={ex.explanation} onChange={(e) => updateExample(i, "explanation", e.target.value)}
                    className="rounded-lg bg-black/40 border border-border px-3 py-2 text-xs" placeholder="Short explanation" />
                </label>
              </div>
            ))}
            <Button type="button" variant="ghost" onClick={addExample}>+ Add example</Button>
          </div>
        </Card>

        <div className="flex flex-wrap items-center gap-4">
          {error && <div className="text-sm text-rose-300" role="alert">{error}</div>}
          <Button disabled={saving || title.trim().length < 2 || languages.length === 0} onClick={handleSubmit}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
          <Button variant="ghost" onClick={() => router.push("/admin/problems")}>Cancel</Button>
        </div>
      </div>
    </Container>
  );
}
