"use client";

import * as React from "react";
import Link from "next/link";
import { Card, Button } from "@/components/ui";

export function JoinBatchClient({ code, signedIn }: { code: string; signedIn: boolean }) {
  const [joining, setJoining] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const onJoin = () => {
    setErr(null);
    if (!signedIn) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(`/join/batch/${code}`)}`;
      return;
    }
    setJoining(true);
    fetch("/api/join/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
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
          <p className="font-medium text-brand">You’re enrolled in this batch.</p>
          <Link href="/assignments" className="inline-block mt-3 text-sm text-muted hover:text-text underline">
            View my assignments →
          </Link>
        </div>
      ) : (
        <div>
          <p className="text-sm text-muted mb-4">
            {signedIn ? "Click below to join this batch." : "Sign in first, then you can join this batch."}
          </p>
          {err && (
            <p className="text-sm text-rose-300 mb-3" role="alert">
              {err}
            </p>
          )}
          <Button onClick={onJoin} disabled={joining}>
            {signedIn ? (joining ? "Joining…" : "Join batch") : "Sign in to join"}
          </Button>
        </div>
      )}
    </Card>
  );
}

