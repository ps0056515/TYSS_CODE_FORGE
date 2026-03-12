"use client";

import * as React from "react";
import Link from "next/link";
import { Card, Button } from "@/components/ui";

type Assignment = { id: string; title: string; slug: string; dueAt: string };
type Material = { id: string; title: string; type: string; contentOrUrl: string; day?: number; order: number };

export function AdminBatchDetailClient({ batchId, batchName }: { batchId: string; batchName: string }) {
  const [assignments, setAssignments] = React.useState<Assignment[]>([]);
  const [materials, setMaterials] = React.useState<Material[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [assignTitle, setAssignTitle] = React.useState("");
  const [assignDesc, setAssignDesc] = React.useState("");
  const [assignDue, setAssignDue] = React.useState("");
  const [assignType, setAssignType] = React.useState<"general" | "coding_set" | "project_usecase">("coding_set");
  const [projectProblemSlug, setProjectProblemSlug] = React.useState("");
  const [assignSubmitting, setAssignSubmitting] = React.useState(false);
  const [matTitle, setMatTitle] = React.useState("");
  const [matType, setMatType] = React.useState<"handout" | "ref" | "link">("handout");
  const [matContent, setMatContent] = React.useState("");
  const [matDay, setMatDay] = React.useState("");
  const [matSubmitting, setMatSubmitting] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/assignments?batchId=${encodeURIComponent(batchId)}`).then((r) => r.json()),
      fetch(`/api/materials?batchId=${encodeURIComponent(batchId)}`).then((r) => r.json()),
    ]).then(([a, m]) => {
      if (a.ok) setAssignments(a.items);
      if (m.ok) setMaterials(m.items);
    }).finally(() => setLoading(false));
  }, [batchId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const onCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle.trim() || !assignDue) return;
    setAssignSubmitting(true);
    fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        batchId,
        title: assignTitle.trim(),
        description: assignDesc.trim(),
        dueAt: new Date(assignDue).toISOString(),
        type: assignType,
        codeforgeProblemId: assignType === "project_usecase" ? projectProblemSlug.trim() : "",
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setAssignTitle("");
          setAssignDesc("");
          setAssignDue("");
          setProjectProblemSlug("");
          load();
        } else alert(d.error || "Failed");
      })
      .finally(() => setAssignSubmitting(false));
  };

  const onCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle.trim() || !matContent.trim()) return;
    setMatSubmitting(true);
    fetch("/api/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        batchId,
        title: matTitle.trim(),
        type: matType,
        contentOrUrl: matContent.trim(),
        day: matDay ? parseInt(matDay, 10) : undefined,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setMatTitle("");
          setMatContent("");
          setMatDay("");
          load();
        } else alert(d.error || "Failed");
      })
      .finally(() => setMatSubmitting(false));
  };

  return (
    <>
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Assignments</h2>
        <Card className="p-4 max-w-2xl mb-4">
          <form onSubmit={onCreateAssignment} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs text-muted mb-1">Assignment type</span>
                <select
                  value={assignType}
                  onChange={(e) => setAssignType(e.target.value as typeof assignType)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
                >
                  <option value="coding_set">Coding set (in-browser)</option>
                  <option value="project_usecase">Project / use-case (ZIP)</option>
                  <option value="general">General (no grading)</option>
                </select>
              </label>
              {assignType === "project_usecase" ? (
                <label className="block">
                  <span className="block text-xs text-muted mb-1">Project problem slug</span>
                  <input
                    type="text"
                    value={projectProblemSlug}
                    onChange={(e) => setProjectProblemSlug(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
                    placeholder="e.g. cart-module"
                  />
                </label>
              ) : (
                <div className="hidden sm:block" />
              )}
            </div>
            <label className="block">
              <span className="block text-xs text-muted mb-1">Title</span>
              <input
                type="text"
                value={assignTitle}
                onChange={(e) => setAssignTitle(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
                placeholder="Assignment title"
              />
            </label>
            <label className="block">
              <span className="block text-xs text-muted mb-1">Description (optional)</span>
              <textarea
                value={assignDesc}
                onChange={(e) => setAssignDesc(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm min-h-[80px]"
                placeholder="Instructions..."
              />
            </label>
            <label className="block">
              <span className="block text-xs text-muted mb-1">Due date</span>
              <input
                type="datetime-local"
                value={assignDue}
                onChange={(e) => setAssignDue(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
              />
            </label>
            <Button type="submit" disabled={assignSubmitting}>
              {assignSubmitting ? "Adding…" : "Add assignment"}
            </Button>
          </form>
        </Card>
        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : assignments.length === 0 ? (
          <p className="text-sm text-muted">No assignments yet.</p>
        ) : (
          <ul className="space-y-2">
            {assignments.map((a) => (
              <li key={a.id}>
                <div className="rounded-lg border border-border bg-card/80 p-4 hover:border-brand/30 transition">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{a.title}</div>
                      <div className="text-xs text-muted mt-1">Due {new Date(a.dueAt).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Link href={`/admin/assignments/${a.id}/edit`} className="text-xs text-muted hover:text-text underline">
                        Configure
                      </Link>
                      <Link href={`/admin/assignments/${a.id}/dashboard`} className="text-xs text-brand hover:underline">
                        Dashboard →
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold mb-3">Handouts & materials</h2>
        <Card className="p-4 max-w-2xl mb-4">
          <form onSubmit={onCreateMaterial} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label>
                <span className="block text-xs text-muted mb-1">Title</span>
                <input
                  type="text"
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
                  placeholder="Day 1 handout"
                />
              </label>
              <label>
                <span className="block text-xs text-muted mb-1">Type</span>
                <select
                  value={matType}
                  onChange={(e) => setMatType(e.target.value as Material["type"])}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
                >
                  <option value="handout">Handout</option>
                  <option value="ref">Reference</option>
                  <option value="link">Link</option>
                </select>
              </label>
            </div>
            <label className="block">
              <span className="block text-xs text-muted mb-1">{matType === "link" ? "URL" : "Content or URL"}</span>
              <input
                type="text"
                value={matContent}
                onChange={(e) => setMatContent(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
                placeholder={matType === "link" ? "https://..." : "URL or short description"}
              />
            </label>
            <label className="block">
              <span className="block text-xs text-muted mb-1">Day (optional)</span>
              <input
                type="number"
                min={1}
                value={matDay}
                onChange={(e) => setMatDay(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm w-24"
                placeholder="1"
              />
            </label>
            <Button type="submit" disabled={matSubmitting}>
              {matSubmitting ? "Adding…" : "Add material"}
            </Button>
          </form>
        </Card>
        {!loading && materials.length > 0 && (
          <ul className="space-y-2">
            {materials.map((m) => (
              <li key={m.id} className="rounded-lg border border-border bg-card/80 p-3 text-sm">
                <span className="font-medium">{m.title}</span>
                <span className="text-muted ml-2">({m.type})</span>
                {m.day != null && <span className="text-muted ml-2">Day {m.day}</span>}
                {m.type === "link" && (
                  <a href={m.contentOrUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-brand hover:underline">
                    Open
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
