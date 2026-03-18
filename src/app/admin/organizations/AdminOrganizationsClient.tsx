"use client";

import * as React from "react";
import Link from "next/link";
import { Card, Button } from "@/components/ui";
import { Pencil } from "lucide-react";

type Org = { id: string; name: string; slug: string };

export function AdminOrganizationsClient() {
  const [orgs, setOrgs] = React.useState<Org[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [name, setName] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    fetch("/api/organizations")
      .then((r) => r.json())
      .then((d) => (d.ok ? setOrgs(d.items) : []))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const onCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    fetch("/api/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setName("");
          load();
        } else alert(d.error || "Failed");
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <>
      <Card className="p-4 mt-6 max-w-2xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold">Create an organization</div>
            <div className="text-sm text-muted mt-1">
              Example: <span className="text-text">JCRC College</span>, <span className="text-text">SOGETI</span>, <span className="text-text">CG</span>
            </div>
          </div>
        </div>
        <form onSubmit={onCreate} className="flex flex-wrap gap-2 items-end mt-4">
          <label className="flex-1 min-w-[200px]">
            <span className="block text-xs text-muted mb-1">Organization name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
              placeholder="e.g. JCRC College"
            />
          </label>
          <Button type="submit" disabled={submitting}>{submitting ? "Adding…" : "Add organization"}</Button>
        </form>
      </Card>
      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : orgs.length === 0 ? (
          <Card className="p-5 max-w-2xl">
            <div className="font-semibold">No organizations yet</div>
            <div className="text-sm text-muted mt-1">
              Create an organization above. Next you’ll add business units (BU) under it.
            </div>
          </Card>
        ) : (
          <ul className="space-y-2">
            {orgs.map((o) => (
              <li key={o.id} className="rounded-lg border border-border bg-card/80 p-4">
                {editingId === o.id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 min-w-[180px] rounded-lg border border-border bg-bg px-3 py-2 text-sm"
                      placeholder="Organization name"
                    />
                    <Button type="button" onClick={() => {
                      fetch(`/api/organizations/${encodeURIComponent(o.id)}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: editName.trim() }),
                      })
                        .then((r) => r.json())
                        .then((d) => { if (d.ok) { load(); setEditingId(null); } else alert(d.error || "Failed"); });
                    }} disabled={!editName.trim()}>
                      Save
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setEditName(""); }}>Cancel</Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <Link href={`/admin/organizations/${o.id}`} className="min-w-0 flex-1">
                      <div className="font-medium truncate">{o.name}</div>
                      <div className="text-xs text-muted mt-0.5 truncate">Slug: /{o.slug}</div>
                    </Link>
                    <div className="flex items-center gap-2 shrink-0">
                      <button type="button" onClick={() => { setEditingId(o.id); setEditName(o.name); }} className="p-2 rounded-lg border border-border text-muted hover:text-text hover:bg-white/5" title="Edit name"><Pencil className="h-4 w-4" /></button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!confirm(`Delete organization \"${o.name}\"? This is only allowed if it has no business units.`)) return;
                          setDeletingId(o.id);
                          fetch(`/api/organizations/${encodeURIComponent(o.id)}`, { method: "DELETE" })
                            .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
                            .then(({ ok, d }) => {
                              if (ok && d.ok) load();
                              else alert(d.error || "Delete blocked");
                            })
                            .finally(() => setDeletingId(null));
                        }}
                        disabled={deletingId === o.id}
                        className="px-3 py-2 rounded-lg border border-border text-xs text-red-600 dark:text-red-400 hover:bg-white/5"
                        title="Delete (only if empty)"
                      >
                        {deletingId === o.id ? "Deleting…" : "Delete"}
                      </button>
                      <Link href={`/admin/organizations/${o.id}`} className="text-sm text-brand">Add BUs →</Link>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
