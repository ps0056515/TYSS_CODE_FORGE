"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Container, Card, Button } from "@/components/ui";

type Lang = "javascript" | "python" | "java" | "cpp";
const LANGS: { id: Lang; label: string }[] = [
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" }
];

export default function AdminNewProblemPage() {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [difficulty, setDifficulty] = React.useState<"Easy" | "Medium" | "Hard">("Easy");
  const [tags, setTags] = React.useState("basics");
  const [languages, setLanguages] = React.useState<Lang[]>(["javascript", "python"]);
  const [statement, setStatement] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  return (
    <Container className="py-10">
      <div>
        <div className="text-xs tracking-[0.35em] text-muted">ADMIN</div>
        <h2 className="text-2xl font-extrabold mt-2">Add practice problem</h2>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          Creates a new practice test with difficulty and allowed languages. It will appear in `/practice`.
        </p>
      </div>

      <Card className="p-6 mt-8 max-w-3xl">
        <div className="grid gap-4">
          <label className="grid gap-2">
            <div className="text-xs text-muted">Title</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 rounded-xl bg-black/40 border border-border px-4 text-sm outline-none focus:ring-2 focus:ring-brand/50"
              placeholder="e.g. Reverse a String"
            />
          </label>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="grid gap-2">
              <div className="text-xs text-muted">Difficulty</div>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="h-11 rounded-xl bg-black/40 border border-border px-3 text-sm outline-none focus:ring-2 focus:ring-brand/50"
              >
                {["Easy", "Medium", "Hard"].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <div className="text-xs text-muted">Tags (comma separated)</div>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="h-11 rounded-xl bg-black/40 border border-border px-4 text-sm outline-none focus:ring-2 focus:ring-brand/50"
                placeholder="strings, basics"
              />
            </label>
          </div>

          <div className="grid gap-2">
            <div className="text-xs text-muted">Allowed languages</div>
            <div className="flex flex-wrap gap-2">
              {LANGS.map((l) => {
                const active = languages.includes(l.id);
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      setLanguages((prev) => (active ? prev.filter((x) => x !== l.id) : [...prev, l.id]));
                    }}
                    className={
                      "text-sm rounded-xl border px-3 py-2 transition " +
                      (active ? "bg-brand/20 text-text border-brand/40" : "bg-white/5 text-muted border-border hover:bg-white/10")
                    }
                  >
                    {l.label}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="grid gap-2">
            <div className="text-xs text-muted">Statement (optional)</div>
            <textarea
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              className="min-h-[120px] rounded-xl bg-black/40 border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/50"
              placeholder="Problem statement..."
            />
          </label>

          {error ? <div className="text-sm text-rose-300">{error}</div> : null}

          <div className="flex items-center gap-3">
            <Button
              disabled={saving || title.trim().length < 2 || languages.length === 0}
              onClick={async () => {
                setSaving(true);
                setError(null);
                try {
                  const res = await fetch("/api/problems", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      title: title.trim(),
                      difficulty,
                      tags: tags
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                      languages,
                      statement: statement.trim() || undefined
                    })
                  });
                  const data = (await res.json()) as { ok: boolean; stderr?: string };
                  if (!data.ok) {
                    setError(data.stderr ?? "Failed to create problem.");
                    return;
                  }
                  router.push("/practice");
                  router.refresh();
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Failed to create problem.");
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? "Saving..." : "Create problem"}
            </Button>
            <Button variant="ghost" onClick={() => router.push("/admin/problems")}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </Container>
  );
}

