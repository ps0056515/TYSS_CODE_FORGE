"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui";

type Item = {
  assignment: { id: string; title: string; dueAt: string; description: string };
  batch: { name: string; skill: string } | null;
  enrolment: { joinedAt: string; repoUrl?: string };
};

const FETCH_TIMEOUT_MS = 12_000;
const HARD_STOP_MS = 10_000; // Always stop loading after this, no matter what

export function AssignmentsListClient({ signedIn: _signedIn }: { signedIn: boolean }) {
  const [items, setItems] = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [needsSignIn, setNeedsSignIn] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNeedsSignIn(false);

    const stopLoading = () => {
      if (!cancelled) {
        setLoading(false);
        cancelled = true;
      }
    };

    const hardStopId = setTimeout(() => {
      if (!cancelled) {
        setError("network");
        setItems([]);
        setLoading(false);
        cancelled = true;
      }
    }, HARD_STOP_MS);

    const controller = new AbortController();
    const abortId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    fetch("/api/assignments/my", { credentials: "include", signal: controller.signal })
      .then(async (r) => {
        if (cancelled) return { ok: false, items: [] };
        if (r.status === 401) {
          setNeedsSignIn(true);
          setItems([]);
          return { ok: false, items: [] };
        }
        if (!r.ok) {
          setError("network");
          return { ok: false, items: [] };
        }
        const text = await r.text();
        try {
          return JSON.parse(text) as { ok?: boolean; items?: unknown[] };
        } catch {
          setError("network");
          return { ok: false, items: [] };
        }
      })
      .then((d) => {
        if (cancelled) return;
        if (d && d.ok && Array.isArray(d.items)) {
          const valid = d.items.filter((x): x is Item => {
            if (x == null || typeof x !== "object") return false;
            const o = x as Record<string, unknown>;
            return o.assignment != null && typeof o.assignment === "object";
          });
          setItems(valid);
          setError(null);
        } else {
          setItems([]);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setError("network");
        }
      })
      .finally(() => {
        clearTimeout(abortId);
        clearTimeout(hardStopId);
        stopLoading();
      });

    return () => {
      cancelled = true;
      clearTimeout(abortId);
      clearTimeout(hardStopId);
      controller.abort();
    };
  }, []);

  if (needsSignIn) {
    return (
      <Card className="p-6 mt-6 max-w-md">
        <p className="text-sm text-muted mb-4">Sign in to see your assignments.</p>
        <Link href="/login" className="text-sm font-medium text-brand hover:underline">Sign in →</Link>
      </Card>
    );
  }

  if (loading) return <p className="text-sm text-muted mt-6">Loading…</p>;

  if (error === "network") {
    return (
      <Card className="p-6 mt-6 max-w-md">
        <p className="text-sm text-muted mb-4">Could not load assignments. Check your connection and try again.</p>
        <Link href="/assignments" className="text-sm font-medium text-brand hover:underline">Retry</Link>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="p-6 mt-6 max-w-md">
        <p className="text-sm font-medium text-text mb-1">No assignments yet</p>
        <p className="text-sm text-muted mb-4">Assignments you join (via an invitation link from your instructor) will appear here.</p>
        <p className="text-sm text-muted">Ask your instructor for a join link, open it, click <strong>Join</strong>, and the assignment will show up on this page.</p>
      </Card>
    );
  }

  return (
    <ul className="mt-6 space-y-3">
      {items.map(({ assignment, batch, enrolment }) => (
        <li key={assignment.id}>
          <Link
            href={`/assignments/${assignment.id}`}
            className="block rounded-lg border border-border bg-card/80 p-4 hover:border-brand/30 transition"
          >
            <span className="font-medium">{assignment.title}</span>
            {batch && <span className="text-xs text-muted ml-2">· {batch.name}</span>}
            <p className="text-xs text-muted mt-1">
              Due {new Date(assignment.dueAt).toLocaleString()}
              {enrolment.repoUrl && (
                <span className="ml-2">
                  · <a href={enrolment.repoUrl} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline" onClick={(e) => e.stopPropagation()}>Repo</a>
                </span>
              )}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
