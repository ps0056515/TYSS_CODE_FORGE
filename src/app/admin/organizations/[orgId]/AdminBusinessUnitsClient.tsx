"use client";

import * as React from "react";
import Link from "next/link";
import { Card, Button } from "@/components/ui";

type BU = { id: string; name: string; slug: string };

export function AdminBusinessUnitsClient({
  organizationId,
  organizationName,
}: {
  organizationId: string;
  organizationName: string;
}) {
  const [bus, setBus] = React.useState<BU[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [name, setName] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    fetch(`/api/business-units?organizationId=${encodeURIComponent(organizationId)}`)
      .then((r) => r.json())
      .then((d) => (d.ok ? setBus(d.items) : []))
      .finally(() => setLoading(false));
  }, [organizationId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const onCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    fetch("/api/business-units", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId, name: name.trim() }),
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
        <div className="text-sm font-semibold">Create a business unit (BU)</div>
        <div className="text-sm text-muted mt-1">
          This helps you group batches (e.g. “BU India”, “CSE Dept”, “2026 Training”). Organization:{" "}
          <span className="text-text">{organizationName}</span>
        </div>
        <form onSubmit={onCreate} className="flex flex-wrap gap-2 items-end mt-4">
          <label className="flex-1 min-w-[200px]">
            <span className="block text-xs text-muted mb-1">Business unit name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
              placeholder="e.g. BU India"
            />
          </label>
          <Button type="submit" disabled={submitting}>{submitting ? "Adding…" : "Add business unit"}</Button>
        </form>
      </Card>
      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : bus.length === 0 ? (
          <Card className="p-5 max-w-2xl">
            <div className="font-semibold">No business units yet</div>
            <div className="text-sm text-muted mt-1">
              Create a BU above. Next step: open the BU and create batches under it.
            </div>
          </Card>
        ) : (
          <ul className="space-y-2">
            {bus.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/admin/business-units/${b.id}`}
                  className="block rounded-lg border border-border bg-card/80 p-4 hover:border-brand/30 transition"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{b.name}</div>
                      <div className="text-xs text-muted mt-0.5 truncate">Slug: /{b.slug}</div>
                    </div>
                    <div className="text-sm text-brand shrink-0">Add batches →</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
