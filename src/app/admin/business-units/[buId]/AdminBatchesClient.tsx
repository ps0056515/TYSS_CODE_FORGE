"use client";

import * as React from "react";
import Link from "next/link";
import { Card, Button } from "@/components/ui";

type Batch = { id: string; name: string; slug: string; skill: string; startDate: string; endDate: string };

export function AdminBatchesClient({
  businessUnitId,
  businessUnitName,
}: {
  businessUnitId: string;
  businessUnitName: string;
}) {
  const [batches, setBatches] = React.useState<Batch[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [name, setName] = React.useState("");
  const [skill, setSkill] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    fetch(`/api/batches?businessUnitId=${encodeURIComponent(businessUnitId)}`)
      .then((r) => r.json())
      .then((d) => (d.ok ? setBatches(d.items) : []))
      .finally(() => setLoading(false));
  }, [businessUnitId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const onCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !skill.trim() || !startDate || !endDate) return;
    setSubmitting(true);
    fetch("/api/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessUnitId,
        name: name.trim(),
        skill: skill.trim(),
        startDate,
        endDate,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setName("");
          setSkill("");
          setStartDate("");
          setEndDate("");
          load();
        } else alert(d.error || "Failed");
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <>
      <Card className="p-4 mt-6 max-w-2xl">
        <div className="text-sm font-semibold">Create a batch</div>
        <div className="text-sm text-muted mt-1">
          A batch is a cohort (e.g. 40 students) like “.NET Batch 1”. Business unit:{" "}
          <span className="text-text">{businessUnitName}</span>
        </div>
        <form onSubmit={onCreate} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label>
              <span className="block text-xs text-muted mb-1">Batch name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
                placeholder="e.g. .NET Batch 1"
              />
            </label>
            <label>
              <span className="block text-xs text-muted mb-1">Skill / stack</span>
              <input
                type="text"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
                placeholder="e.g. .NET / Python Robot Framework / Java / Playwright"
              />
            </label>
            <label>
              <span className="block text-xs text-muted mb-1">Start date</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
              />
            </label>
            <label>
              <span className="block text-xs text-muted mb-1">End date</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
              />
            </label>
          </div>
          <Button type="submit" disabled={submitting}>{submitting ? "Adding…" : "Add batch"}</Button>
        </form>
      </Card>
      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : batches.length === 0 ? (
          <Card className="p-5 max-w-2xl">
            <div className="font-semibold">No batches yet</div>
            <div className="text-sm text-muted mt-1">
              Create a batch above. Next step: open the batch to add assignments and daily handouts.
            </div>
          </Card>
        ) : (
          <ul className="space-y-2">
            {batches.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/admin/batches/${b.id}`}
                  className="block rounded-lg border border-border bg-card/80 p-4 hover:border-brand/30 transition"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{b.name}</div>
                      <div className="text-xs text-muted mt-0.5 truncate">
                        {b.skill} · {b.startDate} – {b.endDate}
                      </div>
                    </div>
                    <div className="text-sm text-brand shrink-0">Add assignments →</div>
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
