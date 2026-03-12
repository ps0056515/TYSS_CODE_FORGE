"use client";

import * as React from "react";
import Link from "next/link";
import { Card, Button } from "@/components/ui";

export function JoinAssignmentClient({
  assignmentId,
  alreadyEnrolled,
  signedIn,
}: {
  assignmentId: string;
  alreadyEnrolled: boolean;
  signedIn: boolean;
}) {
  const [joining, setJoining] = React.useState(false);
  const [done, setDone] = React.useState(alreadyEnrolled);

  const onJoin = () => {
    if (!signedIn) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(`/join/${assignmentId}`)}`;
      return;
    }
    setJoining(true);
    fetch("/api/enrolments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setDone(true);
        else alert(d.error || "Failed to join");
      })
      .finally(() => setJoining(false));
  };

  return (
    <Card className="p-6 mt-8">
      {done ? (
        <div>
          <p className="font-medium text-brand">You’re enrolled in this assignment.</p>
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
          <Button onClick={onJoin} disabled={joining}>
            {signedIn ? (joining ? "Joining…" : "Join assignment") : "Sign in to join"}
          </Button>
        </div>
      )}
    </Card>
  );
}
