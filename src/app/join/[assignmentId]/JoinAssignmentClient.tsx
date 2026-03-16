"use client";

import * as React from "react";
import Link from "next/link";
import { Card, Button } from "@/components/ui";

export function JoinAssignmentClient({
  assignmentId,
  alreadyEnrolled,
  signedIn,
  collectRepoUrl,
  existingRepoUrl,
}: {
  assignmentId: string;
  alreadyEnrolled: boolean;
  signedIn: boolean;
  collectRepoUrl?: boolean;
  existingRepoUrl?: string | null;
}) {
  const [joining, setJoining] = React.useState(false);
  const [done, setDone] = React.useState(alreadyEnrolled);
  const [repoUrl, setRepoUrl] = React.useState<string>(existingRepoUrl ?? "");
  const [err, setErr] = React.useState<string | null>(null);

  const onJoin = () => {
    setErr(null);
    if (!signedIn) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(`/join/${assignmentId}`)}`;
      return;
    }
    setJoining(true);
    fetch("/api/enrolments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentId, repoUrl: collectRepoUrl ? repoUrl.trim() : undefined }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setDone(true);
        else setErr(d.error || "Failed to join");
      })
      .finally(() => setJoining(false));
  };

  return (
    <Card className="p-6 mt-8">
      {done ? (
        <div>
          <p className="font-medium text-brand">You’re enrolled in this assignment.</p>
          {collectRepoUrl && (
            <p className="text-sm text-muted mt-2">
              Repo:{" "}
              {repoUrl ? (
                <a className="text-brand hover:underline" href={repoUrl} target="_blank" rel="noreferrer">
                  Open link
                </a>
              ) : (
                <span className="text-muted">not provided</span>
              )}
            </p>
          )}
          <Link href="/assignments" className="inline-block mt-3 text-sm text-muted hover:text-text underline">
            View my assignments →
          </Link>
        </div>
      ) : (
        <div>
          <p className="text-sm text-muted mb-4">
            {signedIn
              ? "Click below to join this assignment. You’ll see it under My Assignments."
              : "Sign in first, then you can join this assignment."}
          </p>
          {collectRepoUrl && (
            <label className="grid gap-2 mb-4">
              <span className="text-xs text-muted">Git repository URL (for auto-assessment)</span>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="e.g. https://github.com/yourname/your-repo"
                className="h-11 rounded-xl bg-bg border border-border px-4 text-sm text-text placeholder:text-muted outline-none focus:ring-2 focus:ring-brand/50"
              />
              <span className="text-xs text-muted">Optional for now — we’ll use this later to run automated grading.</span>
            </label>
          )}
          {err && <p className="text-sm text-rose-300 mb-3" role="alert">{err}</p>}
          <Button onClick={onJoin} disabled={joining}>
            {signedIn ? (joining ? "Joining…" : "Join assignment") : "Sign in to join"}
          </Button>
        </div>
      )}
    </Card>
  );
}
