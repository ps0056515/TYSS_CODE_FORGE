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

type Lang = "javascript" | "python" | "java" | "cpp";
const LANGS: { id: Lang; label: string }[] = [
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
];

type ProblemType = "algorithm" | "project";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

type ExampleRow = { input: string; output: string; explanation: string };

export default function AdminNewProblemPage() {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [slugOverride, setSlugOverride] = React.useState("");
  const [difficulty, setDifficulty] = React.useState<"Easy" | "Medium" | "Hard">("Easy");
  const [tags, setTags] = React.useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = React.useState("");
  const [languages, setLanguages] = React.useState<Lang[]>(["javascript", "python"]);
  const [statement, setStatement] = React.useState("");
  const [problemType, setProblemType] = React.useState<ProblemType>("algorithm");
  const [showInCompanyPrep, setShowInCompanyPrep] = React.useState(false);
  const [examples, setExamples] = React.useState<ExampleRow[]>([
    { input: "", output: "", explanation: "" },
  ]);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [createdSlug, setCreatedSlug] = React.useState<string | null>(null);

  const suggestedSlug = React.useMemo(
    () => (title.trim() ? slugify(title.trim()) : ""),
    [title]
  );
  const effectiveSlug = slugOverride.trim() || suggestedSlug;

  const tagsList = React.useMemo(() => {
    const custom = customTagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const list = [...new Set([...tags, ...custom])];
    if (showInCompanyPrep && !list.includes("company-prep")) {
      list.push("company-prep");
    }
    return list;
  }, [tags, customTagInput, showInCompanyPrep]);

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addExample = () => {
    setExamples((prev) => [...prev, { input: "", output: "", explanation: "" }]);
  };
  const removeExample = (i: number) => {
    setExamples((prev) => (prev.length > 1 ? prev.filter((_, j) => j !== i) : prev));
  };
  const updateExample = (i: number, field: keyof ExampleRow, value: string) => {
    setExamples((prev) =>
      prev.map((row, j) => (j === i ? { ...row, [field]: value } : row))
    );
  };

  const handleSubmit = async () => {
    setError(null);
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        slug: effectiveSlug || undefined,
        difficulty,
        tags: tagsList,
        languages,
        statement: statement.trim() || undefined,
        type: problemType,
        examples:
          problemType === "algorithm" && examples.some((e) => e.input || e.output)
            ? examples
                .filter((e) => e.input.trim() || e.output.trim())
                .map((e) => ({
                  input: e.input.trim(),
                  output: e.output.trim(),
                  ...(e.explanation.trim() ? { explanation: e.explanation.trim() } : {}),
                }))
            : undefined,
      };
      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok: boolean; item?: { slug: string }; stderr?: string };
      if (!data.ok) {
        setError(data.stderr ?? "Failed to create problem.");
        return;
      }
      setCreatedSlug(data.item?.slug ?? null);
      router.refresh();
      router.push("/practice");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create problem.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container className="py-8 md:py-10">
      {/* Breadcrumb / back */}
      <nav className="mb-6">
        <Link
          href="/admin/problems"
          className="text-sm text-muted hover:text-text transition"
        >
          ← Admin / Problems
        </Link>
      </nav>

      <div className="mb-8">
        <div className="text-xs tracking-[0.2em] text-muted uppercase">Admin</div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-text mt-1">
          Add practice problem
        </h1>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          Create a new problem for the Practice section. It will appear by{" "}
          <strong>difficulty</strong>, <strong>tags</strong>, and in topic/company sections when configured.
        </p>
      </div>

      <div className="max-w-3xl space-y-8">
        {/* Basic info */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-text border-b border-border pb-2 mb-4">
            Basic info
          </h2>
          <div className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-xs text-muted">Title *</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 rounded-xl bg-black/40 dark:bg-white/5 border border-border px-4 text-sm outline-none focus:ring-2 focus:ring-brand/50"
                placeholder="e.g. Reverse a String"
              />
            </label>
            <div className="grid gap-2">
              <span className="text-xs text-muted">URL slug (optional)</span>
              <div className="flex gap-2 flex-wrap">
                <input
                  value={slugOverride}
                  onChange={(e) => setSlugOverride(e.target.value)}
                  className="flex-1 min-w-[200px] h-11 rounded-xl bg-black/40 dark:bg-white/5 border border-border px-4 text-sm outline-none focus:ring-2 focus:ring-brand/50"
                  placeholder={suggestedSlug || "auto-generated from title"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSlugOverride(suggestedSlug)}
                  className="shrink-0"
                >
                  Use title
                </Button>
              </div>
              {suggestedSlug && (
                <p className="text-xs text-muted">
                  Preview: <code className="bg-white/10 px-1 rounded">/practice/{effectiveSlug || suggestedSlug}</code>
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Classification */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-text border-b border-border pb-2 mb-4">
            Classification
          </h2>
          <div className="space-y-5">
            <div>
              <span className="text-xs text-muted block mb-2">Type &amp; sections</span>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={problemType === "algorithm"}
                    onChange={() => setProblemType("algorithm")}
                    className="rounded border-border text-brand focus:ring-brand/50"
                  />
                  <span>Algorithm</span>
                  <span className="text-muted">(I/O, samples, topic-wise)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={problemType === "project"}
                    onChange={() => setProblemType("project")}
                    className="rounded border-border text-brand focus:ring-brand/50"
                  />
                  <span>Project</span>
                  <span className="text-muted">(codebase, use cases)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showInCompanyPrep}
                    onChange={(e) => setShowInCompanyPrep(e.target.checked)}
                    className="rounded border-border text-brand focus:ring-brand/50"
                  />
                  <span>Company Prep</span>
                  <span className="text-muted">(adds company-prep tag)</span>
                </label>
              </div>
            </div>

            <div className="grid gap-2">
              <span className="text-xs text-muted">Difficulty</span>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as "Easy" | "Medium" | "Hard")}
                className="h-11 rounded-xl bg-black/40 dark:bg-white/5 border border-border px-3 text-sm outline-none focus:ring-2 focus:ring-brand/50 max-w-[140px]"
              >
                {(["Easy", "Medium", "Hard"] as const).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-xs text-muted block mb-2">Topic tags</span>
              <p className="text-xs text-muted mb-2">Data structures &amp; algorithms (click to toggle)</p>
              <div className="flex flex-wrap gap-2">
                {DATA_STRUCTURES.map((ds) => (
                  <button
                    key={ds.id}
                    type="button"
                    onClick={() => toggleTag(ds.id)}
                    className={cn(
                      "text-xs rounded-lg border px-2.5 py-1.5 transition",
                      tags.includes(ds.id)
                        ? "bg-brand/20 text-text border-brand/40"
                        : "bg-white/5 text-muted border-border hover:bg-white/10 hover:text-text"
                    )}
                  >
                    {ds.name}
                  </button>
                ))}
                {ALGORITHMS.map((algo) => (
                  <button
                    key={algo.id}
                    type="button"
                    onClick={() => toggleTag(algo.id)}
                    className={cn(
                      "text-xs rounded-lg border px-2.5 py-1.5 transition",
                      tags.includes(algo.id)
                        ? "bg-brand/20 text-text border-brand/40"
                        : "bg-white/5 text-muted border-border hover:bg-white/10 hover:text-text"
                    )}
                  >
                    {algo.name}
                  </button>
                ))}
              </div>
            </div>

            {showInCompanyPrep && (
              <div>
                <span className="text-xs text-muted block mb-2">Company tags (optional)</span>
                <div className="flex flex-wrap gap-2">
                  {COMPANIES.filter((c) => c.id !== "company-prep").map((co) => (
                    <button
                      key={co.id}
                      type="button"
                      onClick={() => toggleTag(co.id)}
                      className={cn(
                        "text-xs rounded-lg border px-2.5 py-1.5 transition",
                        tags.includes(co.id)
                          ? "bg-amber-500/20 text-amber-200 border-amber-500/40"
                          : "bg-white/5 text-muted border-border hover:bg-white/10 hover:text-text"
                      )}
                    >
                      {co.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <label className="grid gap-2">
              <span className="text-xs text-muted">Additional tags (comma separated)</span>
              <input
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                className="h-11 rounded-xl bg-black/40 dark:bg-white/5 border border-border px-4 text-sm outline-none focus:ring-2 focus:ring-brand/50"
                placeholder="e.g. basics, loops, conditionals"
              />
            </label>
          </div>
        </Card>

        {/* Languages */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-text border-b border-border pb-2 mb-4">
            Allowed languages
          </h2>
          <div className="flex flex-wrap gap-2">
            {LANGS.map((l) => {
              const active = languages.includes(l.id);
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() =>
                    setLanguages((prev) =>
                      active ? prev.filter((x) => x !== l.id) : [...prev, l.id]
                    )
                  }
                  className={cn(
                    "text-sm rounded-xl border px-3 py-2 transition",
                    active
                      ? "bg-brand/20 text-text border-brand/40"
                      : "bg-white/5 text-muted border-border hover:bg-white/10 hover:text-text"
                  )}
                >
                  {l.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted mt-2">At least one language is required.</p>
        </Card>

        {/* Statement */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-text border-b border-border pb-2 mb-4">
            Problem statement
          </h2>
          <label className="grid gap-2">
            <span className="text-xs text-muted">Markdown supported (optional)</span>
            <textarea
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              className="min-h-[160px] rounded-xl bg-black/40 dark:bg-white/5 border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/50 resize-y"
              placeholder="Describe the problem, constraints, and I/O format..."
            />
          </label>
        </Card>

        {/* Examples (algorithm only) */}
        {problemType === "algorithm" && (
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-text border-b border-border pb-2 mb-4">
              Sample I/O (optional)
            </h2>
            <p className="text-xs text-muted mb-4">
              Add example input/output pairs shown to users. Use the <strong>exact format</strong> your problem expects (e.g. space-separated numbers like <code className="bg-white/10 px-1 rounded">2 3</code>, or one value per line). At least one non-empty pair is recommended.
            </p>
            <div className="space-y-4">
              {examples.map((ex, i) => (
                <div
                  key={i}
                  className="grid gap-2 rounded-xl border border-border p-4 bg-black/20 dark:bg-white/5"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted">Example {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeExample(i)}
                      className="text-xs text-muted hover:text-rose-400 transition"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <label className="grid gap-1">
                      <span className="text-xs text-muted">Input (match problem format exactly)</span>
                      <textarea
                        value={ex.input}
                        onChange={(e) => updateExample(i, "input", e.target.value)}
                        className="min-h-[60px] rounded-lg bg-black/40 dark:bg-white/5 border border-border px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-brand/50"
                        placeholder="e.g. 2 3 for two space-separated numbers, or one value per line"
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className="text-xs text-muted">Output</span>
                      <textarea
                        value={ex.output}
                        onChange={(e) => updateExample(i, "output", e.target.value)}
                        className="min-h-[60px] rounded-lg bg-black/40 dark:bg-white/5 border border-border px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-brand/50"
                        placeholder="Expected output"
                      />
                    </label>
                  </div>
                  <label className="grid gap-1">
                    <span className="text-xs text-muted">Explanation (optional)</span>
                    <input
                      value={ex.explanation}
                      onChange={(e) => updateExample(i, "explanation", e.target.value)}
                      className="rounded-lg bg-black/40 dark:bg-white/5 border border-border px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-brand/50"
                      placeholder="Short explanation"
                    />
                  </label>
                </div>
              ))}
              <Button type="button" variant="ghost" onClick={addExample} className="w-full sm:w-auto">
                + Add example
              </Button>
            </div>
          </Card>
        )}

        {/* Error & actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {error && (
            <div className="text-sm text-rose-300 flex-1" role="alert">
              {error}
            </div>
          )}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              disabled={
                saving || title.trim().length < 2 || languages.length === 0
              }
              onClick={handleSubmit}
            >
              {saving ? "Creating…" : "Create problem"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/admin/problems")}
            >
              Cancel
            </Button>
          </div>
        </div>
        {createdSlug && (
          <p className="text-sm text-emerald-400">
            Created. Redirecting to Practice… Problem slug: <code className="bg-white/10 px-1 rounded">{createdSlug}</code>
          </p>
        )}
      </div>
    </Container>
  );
}
