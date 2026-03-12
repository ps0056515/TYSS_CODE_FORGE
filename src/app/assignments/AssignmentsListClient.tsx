"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui";

type Item = {
  assignment: { id: string; title: string; dueAt: string; description: string };
  batch: { name: string; skill: string } | null;
  enrolment: { joinedAt: string; repoUrl?: string };
};

export function AssignmentsListClient({ signedIn }: { signedIn: boolean }) {
  const [items, setItems] = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!signedIn) {
      setLoading(false);
      setError(null);
      return;
    }
    setError(null);
    fetch("/api/assignments/my")
      .then((r) => {
        if (r.status === 401) {
          setItems([]);
          setError("session");
          return { ok: false };
        }
        return r.json();
      })
      .then((d) => {
        if (d && d.ok && Array.isArray(d.items)) {
          setItems(d.items);
        } else {
          setItems([]);
        }
      })
      .catch(() => {
        setItems([]);
        setError("network");
      })
      .finally(() => setLoading(false));
  }, [signedIn]);

  if (!signedIn) {
    return (
      <Card className="p-6 mt-6 max-w-md">
        <p className="text-sm text-muted mb-4">Sign in to see your assignments.</p>
        <Link href="/login" className="text-sm font-medium text-brand hover:underline">Sign in →</Link>
      </Card>
    );
  }

  if (loading) return <p className="text-sm text-muted mt-6">Loading…</p>;

  if (error === "session") {
    return (
      <Card className="p-6 mt-6 max-w-md">
        <p className="text-sm text-muted mb-4">Your session may have expired. Please sign in again to see your assignments.</p>
        <Link href="/login" className="text-sm font-medium text-brand hover:underline">Sign in again →</Link>
      </Card>
    );
  }

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
