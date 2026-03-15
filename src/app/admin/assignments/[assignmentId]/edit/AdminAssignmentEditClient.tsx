"use client";

import * as React from "react";
import Link from "next/link";
import { Card, Button } from "@/components/ui";

type Problem = {
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  languages: Array<"javascript" | "python" | "java" | "cpp">;
  type?: "algorithm" | "project";
};

type Assignment = {
  id: string;
  title: string;
  description: string;
  dueAt: string;
  startAt?: string;
  endAt?: string;
  type?: "general" | "coding_set" | "project_usecase";
  codeforgeProblemId?: string;
  projectInstructions?: string;
  codingSet?: {
    filters?: {
      tags?: string[];
      difficulties?: Array<"Easy" | "Medium" | "Hard">;
      languages?: Array<"javascript" | "python" | "java" | "cpp">;
      count?: number;
    };
    problemSlugs: string[];
    completionScoreThreshold?: number;
  };
};

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

export function AdminAssignmentEditClient({ assignmentId }: { assignmentId: string }) {
  const [assignment, setAssignment] = React.useState<Assignment | null>(null);
  const [problems, setProblems] = React.useState<Problem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  // UI fields for coding-set filters
  const [tagsCsv, setTagsCsv] = React.useState("");
  const [diffs, setDiffs] = React.useState<Array<"Easy" | "Medium" | "Hard">>([]);
  const [langs, setLangs] = React.useState<Array<"javascript" | "python" | "java" | "cpp">>([]);
  const [count, setCount] = React.useState<string>("20");
  const [threshold, setThreshold] = React.useState<string>("100");
  const [search, setSearch] = React.useState("");

  const load = React.useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/assignments/${encodeURIComponent(assignmentId)}`).then((r) => r.json()),
      fetch("/api/problems").then((r) => r.json()),
    ])
      .then(([a, p]) => {
        if (a.ok) {
          const item: Assignment = a.item;
          setAssignment(item);
          const f = item.codingSet?.filters;
          setTagsCsv((f?.tags ?? []).join(", "));
          setDiffs(f?.difficulties ?? []);
          setLangs(f?.languages ?? []);
          setCount(String(f?.count ?? 20));
          setThreshold(String(item.codingSet?.completionScoreThreshold ?? 100));
        }
        if (p.ok) setProblems(p.items as Problem[]);
      })
      .finally(() => setLoading(false));
  }, [assignmentId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const allTags = React.useMemo(() => {
    const t = problems.flatMap((p) => p.tags ?? []);
    return uniq(t).sort((a, b) => a.localeCompare(b));
  }, [problems]);

  const curated = assignment?.codingSet?.problemSlugs ?? [];

  const filteredCandidates = React.useMemo(() => {
    const a = assignment;
    if (!a || a.type !== "coding_set") return [];
    const tags = tagsCsv
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const desiredCount = Math.max(1, Math.min(200, parseInt(count || "20", 10) || 20));
    const q = search.trim().toLowerCase();

    const langList = (p: Problem) => (p.languages ?? []).map((x) => String(x).toLowerCase());
    const candidates = problems
      .filter((p) => (p.type ?? "algorithm") === "algorithm")
      .filter((p) => (diffs.length ? diffs.includes(p.difficulty) : true))
      .filter((p) => (langs.length ? langs.some((l) => langList(p).includes(l.toLowerCase())) : true))
      .filter((p) => (tags.length ? tags.some((t) => p.tags?.includes(t)) : true))
      .filter((p) => (q ? `${p.slug} ${p.title}`.toLowerCase().includes(q) : true))
      .sort((a, b) => a.title.localeCompare(b.title));

    return candidates.slice(0, desiredCount);
  }, [assignment, problems, tagsCsv, diffs, langs, count, search]);

  const regenerate = () => {
    if (!assignment) return;
    const tags = tagsCsv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const newFilters = {
      tags,
      difficulties: diffs.length ? diffs : undefined,
      languages: langs.length ? langs : undefined,
      count: Math.max(1, Math.min(200, parseInt(count || "20", 10) || 20)),
    };
    const slugs = filteredCandidates.map((p) => p.slug);
    setAssignment({
      ...assignment,
      type: "coding_set",
      codingSet: {
        filters: newFilters,
        problemSlugs: slugs,
        completionScoreThreshold: Math.max(0, Math.min(100, parseInt(threshold || "100", 10) || 100)),
      },
    });
  };

  const addProblem = (slug: string) => {
    if (!assignment) return;
    const next = uniq([...(assignment.codingSet?.problemSlugs ?? []), slug]);
    setAssignment({
      ...assignment,
      codingSet: {
        filters: assignment.codingSet?.filters,
        problemSlugs: next,
        completionScoreThreshold: assignment.codingSet?.completionScoreThreshold ?? 100,
      },
    });
  };

  const removeProblem = (slug: string) => {
    if (!assignment) return;
    const next = (assignment.codingSet?.problemSlugs ?? []).filter((s) => s !== slug);
    setAssignment({
      ...assignment,
      codingSet: {
        filters: assignment.codingSet?.filters,
        problemSlugs: next,
        completionScoreThreshold: assignment.codingSet?.completionScoreThreshold ?? 100,
      },
    });
  };

  const toDatetimeLocal = (iso: string | undefined) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return "";
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const h = String(d.getHours()).padStart(2, "0");
      const min = String(d.getMinutes()).padStart(2, "0");
      return `${y}-${m}-${day}T${h}:${min}`;
    } catch {
      return "";
    }
  };
  const fromDatetimeLocal = (local: string) => {
    if (!local.trim()) return undefined;
    try {
      const d = new Date(local);
      return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
    } catch {
      return undefined;
    }
  };

  const save = () => {
    if (!assignment) return;
    setSaving(true);
    const payload: Partial<Assignment> = {
      type: assignment.type ?? "general",
      codeforgeProblemId: assignment.codeforgeProblemId ?? "",
      projectInstructions: assignment.projectInstructions,
      startAt: assignment.startAt ?? "",
      endAt: assignment.endAt ?? "",
      codingSet: assignment.type === "coding_set" ? assignment.codingSet : undefined,
    };
    fetch(`/api/assignments/${encodeURIComponent(assignmentId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setAssignment(d.item);
        else alert(d.error || "Failed to save");
      })
      .finally(() => setSaving(false));
  };

  if (loading) return <p className="text-sm text-muted mt-6">Loading…</p>;
  if (!assignment) return <p className="text-sm text-muted mt-6">Assignment not found.</p>;

  return (
    <div className="mt-8 grid gap-4">
      <Card className="p-5">
        <div className="text-sm font-semibold">Start & end time</div>
        <div className="text-sm text-muted mt-1">When the assignment becomes available and when it closes. Leave empty for “available immediately” or “due at deadline”.</div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label>
            <span className="block text-xs text-muted mb-1">Start time (optional)</span>
            <input
              type="datetime-local"
              value={toDatetimeLocal(assignment.startAt)}
              onChange={(e) => {
                const v = fromDatetimeLocal(e.target.value);
                setAssignment({ ...assignment, startAt: v });
              }}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
            />
            <span className="block text-xs text-muted mt-1">Leave empty = available immediately</span>
          </label>
          <label>
            <span className="block text-xs text-muted mb-1">End time (optional)</span>
            <input
              type="datetime-local"
              value={toDatetimeLocal(assignment.endAt ?? assignment.dueAt)}
              onChange={(e) => {
                const v = fromDatetimeLocal(e.target.value);
                setAssignment({ ...assignment, endAt: v });
              }}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
            />
            <span className="block text-xs text-muted mt-1">Leave empty = use due date</span>
          </label>
        </div>
      </Card>

      <Card className="p-5">
        <div className="text-sm font-semibold">Assignment type</div>
        <div className="text-sm text-muted mt-1">Choose how this assignment is graded and what students must do.</div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
          <label>
            <span className="block text-xs text-muted mb-1">Type</span>
            <select
              value={assignment.type ?? "general"}
              onChange={(e) => {
                const t = e.target.value as Assignment["type"];
                setAssignment({
                  ...assignment,
                  type: t,
                  codingSet: t === "coding_set" ? (assignment.codingSet ?? { problemSlugs: [], completionScoreThreshold: 100 }) : assignment.codingSet,
                });
              }}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
            >
              <option value="coding_set">Coding set (in-browser)</option>
              <option value="project_usecase">Project / use-case (ZIP)</option>
              <option value="general">General (no grading)</option>
            </select>
          </label>

          {assignment.type === "project_usecase" && (
            <>
              <label>
                <span className="block text-xs text-muted mb-1">Project problem slug</span>
                <input
                  type="text"
                  value={assignment.codeforgeProblemId ?? ""}
                  onChange={(e) => setAssignment({ ...assignment, codeforgeProblemId: e.target.value })}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
                  placeholder="e.g. cart-module"
                />
                <span className="block text-xs text-muted mt-1">This should match a CodeForge project problem slug.</span>
              </label>
              <label className="sm:col-span-2">
                <span className="block text-xs text-muted mb-1">Detailed instructions for candidates</span>
                <textarea
                  value={assignment.projectInstructions ?? ""}
                  onChange={(e) => setAssignment({ ...assignment, projectInstructions: e.target.value })}
                  className="w-full min-h-[120px] rounded-lg border border-border bg-bg px-3 py-2 text-sm resize-y"
                  placeholder="Describe project requirements, deliverables, evaluation criteria, and any setup or submission instructions..."
                />
                <span className="block text-xs text-muted mt-1">Rich context so candidates understand what to build and how it will be assessed.</span>
              </label>
            </>
          )}
        </div>

        <div className="mt-4">
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </Card>

      {assignment.type === "coding_set" && (
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Coding set (problem list)</div>
              <div className="text-sm text-muted mt-1">
                Build the list using filters, then curate it manually. Students will solve these in CodeForge.
              </div>
            </div>
            <div className="text-xs text-muted">
              Curated: <span className="text-text font-medium">{curated.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <div>
              <div className="text-sm font-semibold mb-2">Filters (generate)</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="sm:col-span-2">
                  <span className="block text-xs text-muted mb-1">Tags (comma- or space-separated; all are applied)</span>
                  <input
                    type="text"
                    value={tagsCsv}
                    onChange={(e) => setTagsCsv(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
                    placeholder="e.g. arrays, strings, two-pointers"
                    list="tag-suggestions"
                  />
                  <datalist id="tag-suggestions">
                    {allTags.slice(0, 200).map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                </label>

                <label>
                  <span className="block text-xs text-muted mb-1">Count</span>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
                  />
                </label>

                <label>
                  <span className="block text-xs text-muted mb-1">Completion score threshold</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
                  />
                </label>

                <fieldset className="sm:col-span-2">
                  <legend className="text-xs text-muted mb-1">Difficulty</legend>
                  <div className="flex flex-wrap gap-2">
                    {(["Easy", "Medium", "Hard"] as const).map((d) => (
                      <label key={d} className="text-sm flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={diffs.includes(d)}
                          onChange={(e) =>
                            setDiffs((prev) =>
                              e.target.checked ? uniq([...prev, d]) : prev.filter((x) => x !== d)
                            )
                          }
                        />
                        {d}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="sm:col-span-2">
                  <legend className="text-xs text-muted mb-1">Languages</legend>
                  <div className="flex flex-wrap gap-2">
                    {(["javascript", "python", "java", "cpp"] as const).map((l) => (
                      <label key={l} className="text-sm flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={langs.includes(l)}
                          onChange={(e) =>
                            setLangs((prev) =>
                              e.target.checked ? uniq([...prev, l]) : prev.filter((x) => x !== l)
                            )
                          }
                        />
                        {l}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button type="button" onClick={regenerate}>
                  Regenerate list
                </Button>
                <span className="text-xs text-muted">
                  Preview from filters: {filteredCandidates.length} problems
                </span>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold mb-2">Manual curation</div>
              <label className="block">
                <span className="block text-xs text-muted mb-1">Search problems</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
                  placeholder="Search by title or slug"
                />
              </label>

              <div className="mt-3 grid gap-2 max-h-[320px] overflow-auto border border-border rounded-lg p-2 bg-bg/40">
                {filteredCandidates.slice(0, 50).map((p) => {
                  const inList = curated.includes(p.slug);
                  return (
                    <div key={p.slug} className="flex items-center justify-between gap-3 p-2 rounded hover:bg-white/5">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{p.title}</div>
                        <div className="text-xs text-muted truncate">{p.slug} · {p.difficulty}</div>
                      </div>
                      <button
                        type="button"
                        className="text-xs rounded-lg border border-border px-2 py-1 hover:bg-white/5"
                        onClick={() => (inList ? removeProblem(p.slug) : addProblem(p.slug))}
                      >
                        {inList ? "Remove" : "Add"}
                      </button>
                    </div>
                  );
                })}
                {filteredCandidates.length === 0 && (
                  <div className="text-sm text-muted p-2">No matches. Adjust filters or search.</div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm font-semibold mb-2">Final curated list</div>
            {curated.length === 0 ? (
              <p className="text-sm text-muted">No problems selected yet. Use “Regenerate list” or manually add.</p>
            ) : (
              <div className="grid gap-2">
                {curated.map((slug) => (
                  <div key={slug} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 bg-card/60">
                    <div className="text-sm font-medium">{slug}</div>
                    <div className="flex items-center gap-3">
                      <Link href={`/practice/${slug}`} className="text-xs text-muted hover:text-text underline" target="_blank">
                        Preview
                      </Link>
                      <button
                        type="button"
                        className="text-xs text-brand hover:underline"
                        onClick={() => removeProblem(slug)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <Button onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save coding set"}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

