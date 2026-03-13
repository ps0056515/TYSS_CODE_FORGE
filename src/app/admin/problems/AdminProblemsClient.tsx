"use client";

import * as React from "react";
import Link from "next/link";
import { Container, Card, Button } from "@/components/ui";
import type { Problem } from "@/lib/data";

export function AdminProblemsClient() {
  const [items, setItems] = React.useState<Problem[]>([]);
  const [customSlugs, setCustomSlugs] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(true);
  const [deleting, setDeleting] = React.useState<string | null>(null);

  const fetchProblems = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/problems", { cache: "no-store" });
      const data = (await res.json()) as { ok: boolean; items?: Problem[]; customSlugs?: string[] };
      if (data.ok && data.items) {
        setItems(data.items);
        setCustomSlugs(new Set(data.customSlugs ?? []));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  async function handleDelete(slug: string) {
    if (!confirm(`Delete problem "${slug}"? This cannot be undone.`)) return;
    setDeleting(slug);
    try {
      const res = await fetch(`/api/problems/${encodeURIComponent(slug)}`, { method: "DELETE" });
      const data = (await res.json()) as { ok: boolean; stderr?: string };
      if (data.ok) await fetchProblems();
      else alert(data.stderr ?? "Delete failed");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <Container className="py-10">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin"
          className="text-sm text-muted hover:text-text transition shrink-0 flex items-center gap-1"
          title="Back to Admin"
        >
          ← Back to Admin
        </Link>
      </div>
      <div>
        <div className="text-xs tracking-[0.35em] text-muted">ADMIN</div>
        <h2 className="text-2xl font-extrabold mt-2">Problems</h2>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          Add new practice problems (difficulty + allowed languages). They appear in Practice. Custom problems can be edited or removed.
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          <Link href="/admin/problems/new" className="underline text-sm hover:text-brand transition">
            + Add single problem
          </Link>
          <Link href="/admin/problems/bulk" className="underline text-sm hover:text-brand transition">
            + Bulk add problems (by topic)
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-muted">Loading…</p>
      ) : (
        <div className="mt-8 grid gap-3">
          {items.map((p) => {
            const isCustom = customSlugs.has(p.slug);
            return (
              <Card key={p.slug} className="p-5">
                <div className="flex items-start justify-between gap-6 flex-wrap">
                  <div className="min-w-0">
                    <div className="font-semibold">{p.title}</div>
                    <div className="text-sm text-muted mt-1">
                      {p.slug} · {(p.tags ?? []).join(" · ") || "—"} · {p.difficulty}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/practice/${p.slug}`}
                      className="text-xs text-muted hover:text-brand transition"
                    >
                      View
                    </Link>
                    {isCustom && (
                      <>
                        <Link
                          href={`/admin/problems/${encodeURIComponent(p.slug)}/edit`}
                          className="text-xs text-brand hover:underline"
                        >
                          Edit
                        </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-xs text-rose-400 hover:text-rose-300"
                          disabled={deleting === p.slug}
                          onClick={() => handleDelete(p.slug)}
                        >
                          {deleting === p.slug ? "…" : "Remove"}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Container>
  );
}
