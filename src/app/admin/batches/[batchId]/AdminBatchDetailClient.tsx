"use client";

import * as React from "react";
import Link from "next/link";
import { Card, Button } from "@/components/ui";

type Assignment = { id: string; title: string; slug: string; dueAt: string };
type Material = { id: string; title: string; type: string; contentOrUrl: string; day?: number; order: number };
type BatchMember = { id: string; batchId: string; userId: string; joinedAt: string };

export function AdminBatchDetailClient({ batchId, batchName }: { batchId: string; batchName: string }) {
  const [members, setMembers] = React.useState<BatchMember[]>([]);
  const [membersLoading, setMembersLoading] = React.useState(true);
  const [newUserId, setNewUserId] = React.useState("");
  const [addMemberSubmitting, setAddMemberSubmitting] = React.useState(false);
  const [assignments, setAssignments] = React.useState<Assignment[]>([]);
  const [materials, setMaterials] = React.useState<Material[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [assignTitle, setAssignTitle] = React.useState("");
  const [assignDesc, setAssignDesc] = React.useState("");
  const [assignKind, setAssignKind] = React.useState<"assignment" | "assessment">("assignment");
  const [assignDue, setAssignDue] = React.useState("");
  const [assignType, setAssignType] = React.useState<"general" | "coding_set" | "project_usecase">("coding_set");
  const [projectProblemSlug, setProjectProblemSlug] = React.useState("");
  const [assignSubmitting, setAssignSubmitting] = React.useState(false);
  const [deletingAssignmentId, setDeletingAssignmentId] = React.useState<string | null>(null);
  const [matTitle, setMatTitle] = React.useState("");
  const [matType, setMatType] = React.useState<"handout" | "ref" | "link">("handout");
  const [matContent, setMatContent] = React.useState("");
  const [matDay, setMatDay] = React.useState("");
  const [matSubmitting, setMatSubmitting] = React.useState(false);

  const loadMembers = React.useCallback(() => {
    setMembersLoading(true);
    fetch(`/api/batches/${encodeURIComponent(batchId)}/members`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok && Array.isArray(d.items)) setMembers(d.items);
      })
      .finally(() => setMembersLoading(false));
  }, [batchId]);

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
  React.useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const onAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const uid = newUserId.trim();
    if (!uid) return;
    setAddMemberSubmitting(true);
    fetch(`/api/batches/${encodeURIComponent(batchId)}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: uid }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setNewUserId("");
          loadMembers();
        } else alert(d.error || "Failed to add");
      })
      .finally(() => setAddMemberSubmitting(false));
  };

  const onRemoveMember = (userId: string) => {
    if (!confirm(`Remove ${userId} from this batch? They will lose access to all batch assignments.`)) return;
    fetch(`/api/batches/${encodeURIComponent(batchId)}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) loadMembers();
        else alert(d.error || "Failed to remove");
      });
  };

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
        kind: assignKind,
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
          setAssignKind("assignment");
          setAssignDue("");
          setProjectProblemSlug("");
          load();
        } else alert(d.error || "Failed");
      })
      .finally(() => setAssignSubmitting(false));
  };

  const onDeleteAssignment = (assignmentId: string, title: string) => {
    if (!confirm(`Delete \"${title}\"? This is only allowed if it has no enrolled students.`)) return;
    setDeletingAssignmentId(assignmentId);
    fetch(`/api/assignments/${encodeURIComponent(assignmentId)}`, { method: "DELETE" })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (ok && d.ok) load();
        else alert(d.error || "Delete blocked");
      })
      .finally(() => setDeletingAssignmentId(null));
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
        <h2 className="text-lg font-semibold mb-3">Batch students</h2>
        <p className="text-sm text-muted mb-3">
          Students added here are automatically enrolled in all assignments in this batch. They will see the batch assignments under Assignments / Assessments.
        </p>
        <Card className="p-4 max-w-2xl mb-4">
          <form onSubmit={onAddMember} className="flex flex-wrap items-end gap-3">
            <label className="flex-1 min-w-[200px]">
              <span className="block text-xs text-muted mb-1">Email or username</span>
              <input
                type="text"
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
                placeholder="student@example.com or username"
              />
            </label>
            <Button type="submit" disabled={addMemberSubmitting || !newUserId.trim()}>
              {addMemberSubmitting ? "Adding…" : "Add student"}
            </Button>
          </form>
        </Card>
        {membersLoading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : members.length === 0 ? (
          <p className="text-sm text-muted">No students in this batch yet. Add one above.</p>
        ) : (
          <ul className="space-y-2">
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card/80 p-3">
                <Link
                  href={`/admin/students/${encodeURIComponent(m.userId)}`}
                  className="text-sm font-medium text-brand hover:underline truncate"
                >
                  {m.userId}
                </Link>
                <span className="text-xs text-muted shrink-0">
                  Joined {new Date(m.joinedAt).toLocaleDateString()}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveMember(m.userId)}
                  className="text-xs text-red-600 dark:text-red-400 hover:underline shrink-0"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold mb-3">Assignments</h2>
        <Card className="p-4 max-w-2xl mb-4">
          <form onSubmit={onCreateAssignment} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs text-muted mb-1">Kind</span>
                <select
                  value={assignKind}
                  onChange={(e) => setAssignKind(e.target.value as typeof assignKind)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
                >
                  <option value="assignment">Assignment</option>
                  <option value="assessment">Assessment</option>
                </select>
              </label>
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
                      <button
                        type="button"
                        onClick={() => onDeleteAssignment(a.id, a.title)}
                        disabled={deletingAssignmentId === a.id}
                        className="text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-60"
                        title="Delete (only if empty)"
                      >
                        {deletingAssignmentId === a.id ? "Deleting…" : "Delete"}
                      </button>
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
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "link" || v === "handout" || v === "ref") setMatType(v);
                  }}
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
