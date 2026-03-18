"use client";

import * as React from "react";
import Link from "next/link";
import { Container, Card, Button } from "@/components/ui";
import {
  DATA_STRUCTURES,
  ALGORITHMS,
  COMPANIES,
  PROJECT_CATEGORIES,
} from "@/lib/practice-categories";
import { cn } from "@/lib/cn";

type Lang = "javascript" | "python" | "java" | "cpp";
const LANGS: { id: Lang; label: string }[] = [
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
];

export default function AdminBulkProblemsPage() {
  const [difficulty, setDifficulty] = React.useState<"Easy" | "Medium" | "Hard">("Easy");
  const [tags, setTags] = React.useState<string[]>([]);
  const [languages, setLanguages] = React.useState<Lang[]>(["javascript", "python"]);
  const [titlesText, setTitlesText] = React.useState("");
  const [itemsJson, setItemsJson] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [result, setResult] = React.useState<{
    created: number;
    slugs: string[];
    errors?: { index: number; message: string }[];
  } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const titlesList = React.useMemo(() => {
    return titlesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [titlesText]);

  const handleSubmit = async () => {
    const hasItems = itemsJson.trim().length > 0;
    if (!hasItems && titlesList.length === 0) {
      setError("Enter at least one problem title (one per line), or paste JSON import items.");
      return;
    }
    if (languages.length === 0) {
      setError("Select at least one language.");
      return;
    }
    setError(null);
    setResult(null);
    setSaving(true);
    try {
      let items: unknown[] | undefined;
      if (hasItems) {
        try {
          const parsed = JSON.parse(itemsJson) as unknown;
          if (!Array.isArray(parsed)) throw new Error("JSON import must be an array.");
          items = parsed;
        } catch (e) {
          setError(e instanceof Error ? `Invalid JSON: ${e.message}` : "Invalid JSON.");
          setSaving(false);
          return;
        }
      }
      const res = await fetch("/api/problems/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shared: { difficulty, tags, languages },
          ...(items ? { items } : { titles: titlesList }),
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        created?: number;
        slugs?: string[];
        errors?: { index: number; message: string }[];
        stderr?: string;
      };
      if (!data.ok) {
        setError(data.stderr ?? "Bulk add failed.");
        return;
      }
      setResult({
        created: data.created ?? 0,
        slugs: data.slugs ?? [],
        errors: data.errors,
      });
      setTitlesText("");
      setItemsJson("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container className="py-8 md:py-10">
      <nav className="mb-6 flex flex-wrap items-center gap-2">
        <Link href="/admin/problems" className="text-sm text-muted hover:text-text transition">
          ← Admin / Problems
        </Link>
        <span className="text-muted">·</span>
        <Link href="/admin/problems/new" className="text-sm text-muted hover:text-text transition">
          Add single problem
        </Link>
      </nav>

      <div className="mb-8">
        <div className="text-xs tracking-[0.2em] text-muted uppercase">Admin</div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-text mt-1">
          Bulk add problems
        </h1>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          Add many problems at once with the same topic tags, difficulty, and languages. One title per line; optional slug after a comma (e.g. <code className="bg-white/10 px-1 rounded">Two Sum, two-sum</code>).
        </p>
      </div>

      <div className="max-w-4xl space-y-6">
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-text border-b border-border pb-2 mb-4">
            Shared settings
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <span className="text-xs text-muted block mb-2">Difficulty</span>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as "Easy" | "Medium" | "Hard")}
                className="h-10 rounded-xl bg-black/40 dark:bg-white/5 border border-border px-3 text-sm outline-none focus:ring-2 focus:ring-brand/50"
              >
                {(["Easy", "Medium", "Hard"] as const).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <span className="text-xs text-muted block mb-2">Languages</span>
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
                        "text-sm rounded-lg border px-2.5 py-1.5 transition",
                        active ? "bg-brand/20 text-text border-brand/40" : "bg-white/5 text-muted border-border hover:bg-white/10 hover:text-text"
                      )}
                    >
                      {l.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-sm font-semibold text-text border-b border-border pb-2 mb-4">
            Topic tags (select all that apply)
          </h2>
          <p className="text-xs text-muted mb-3">Problems will be tagged with these and will appear under the matching Practice sections.</p>
          <div className="space-y-4">
            <div>
              <span className="text-xs text-muted block mb-2">Data structures</span>
              <div className="flex flex-wrap gap-2">
                {DATA_STRUCTURES.map((ds) => (
                  <button
                    key={ds.id}
                    type="button"
                    onClick={() => toggleTag(ds.id)}
                    className={cn(
                      "text-xs rounded-lg border px-2.5 py-1.5 transition",
                      tags.includes(ds.id) ? "bg-brand/20 text-text border-brand/40" : "bg-white/5 text-muted border-border hover:bg-white/10 hover:text-text"
                    )}
                  >
                    {ds.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs text-muted block mb-2">Algorithms</span>
              <div className="flex flex-wrap gap-2">
                {ALGORITHMS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleTag(a.id)}
                    className={cn(
                      "text-xs rounded-lg border px-2.5 py-1.5 transition",
                      tags.includes(a.id) ? "bg-brand/20 text-text border-brand/40" : "bg-white/5 text-muted border-border hover:bg-white/10 hover:text-text"
                    )}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs text-muted block mb-2">Company</span>
              <div className="flex flex-wrap gap-2">
                {COMPANIES.filter((c) => c.id !== "company-prep").map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleTag(c.id)}
                    className={cn(
                      "text-xs rounded-lg border px-2.5 py-1.5 transition",
                      tags.includes(c.id) ? "bg-amber-500/20 text-amber-200 border-amber-500/40" : "bg-white/5 text-muted border-border hover:bg-white/10 hover:text-text"
                    )}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs text-muted block mb-2">Project / category</span>
              <div className="flex flex-wrap gap-2">
                {PROJECT_CATEGORIES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleTag(p.id)}
                    className={cn(
                      "text-xs rounded-lg border px-2.5 py-1.5 transition",
                      tags.includes(p.id) ? "bg-brand/20 text-text border-brand/40" : "bg-white/5 text-muted border-border hover:bg-white/10 hover:text-text"
                    )}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-sm font-semibold text-text border-b border-border pb-2 mb-4">
            Problem titles (one per line)
          </h2>
          <p className="text-xs text-muted mb-2">
            Enter one problem title per line. Optionally add a slug after a comma: <code className="bg-white/10 px-1 rounded">Title, my-slug</code>. Max 200 problems per submit.
          </p>
          <textarea
            value={titlesText}
            onChange={(e) => setTitlesText(e.target.value)}
            placeholder={"Two Sum\nAdd Two Numbers\nLongest Substring Without Repeating Characters"}
            className="w-full min-h-[200px] rounded-xl bg-black/40 dark:bg-white/5 border border-border px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-brand/50 resize-y"
          />
          <p className="text-xs text-muted mt-2">
            {titlesList.length} problem{titlesList.length !== 1 ? "s" : ""} will be created.
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-sm font-semibold text-text border-b border-border pb-2 mb-4">
            Advanced JSON import (optional)
          </h2>
          <p className="text-xs text-muted mb-3">
            If you paste JSON here, it will be used instead of the titles list. This supports{" "}
            <strong>sample examples</strong> and <strong>hidden tests</strong> per problem.
          </p>
          <details className="mb-3">
            <summary className="text-xs text-muted cursor-pointer select-none">Show JSON template</summary>
            <pre className="mt-2 text-[11px] font-mono bg-card/60 border border-border rounded-lg p-3 text-muted whitespace-pre-wrap">
{`[
  {
    "title": "Two Sum",
    "slug": "two-sum",
    "type": "algorithm",
    "statement": "Solve ...",
    "examples": [
      { "input": "2 3", "output": "5", "explanation": "2+3=5" }
    ],
    "hiddenTests": [
      { "input": "10 20", "output": "30" }
    ]
  }
]`}
            </pre>
          </details>
          <textarea
            value={itemsJson}
            onChange={(e) => setItemsJson(e.target.value)}
            className="w-full min-h-[220px] rounded-xl bg-black/40 dark:bg-white/5 border border-border px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-brand/50 resize-y"
            placeholder='Paste a JSON array of problem objects (see template above).'
          />
        </Card>

        {error && (
          <div className="text-sm text-rose-400" role="alert">
            {error}
          </div>
        )}
        {result && (
          <Card className="p-6 border-emerald-500/30 bg-emerald-500/5">
            <p className="text-sm font-medium text-emerald-200">
              Created {result.created} problem{result.created !== 1 ? "s" : ""}.
            </p>
            {result.slugs.length > 0 && (
              <details className="mt-2">
                <summary className="text-xs text-muted cursor-pointer">Slugs</summary>
                <pre className="mt-2 text-xs text-muted overflow-auto max-h-40 font-mono">
                  {result.slugs.join("\n")}
                </pre>
              </details>
            )}
            {result.errors && result.errors.length > 0 && (
              <p className="text-xs text-amber-400 mt-2">
                {result.errors.length} row(s) skipped: {result.errors.map((e) => `#${e.index + 1}: ${e.message}`).join("; ")}
              </p>
            )}
          </Card>
        )}

        <div className="flex items-center gap-3">
          <Button
            disabled={saving || titlesList.length === 0 || languages.length === 0}
            onClick={handleSubmit}
          >
            {saving ? "Adding…" : `Add ${titlesList.length} problem${titlesList.length !== 1 ? "s" : ""}`}
          </Button>
          <Link href="/admin/problems">
            <Button variant="ghost">Cancel</Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
