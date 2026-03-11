"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Container, Card, Button } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  return (
    <Container className="py-10">
      <div className="max-w-lg">
        <div className="text-xs tracking-[0.35em] text-muted">AUTH</div>
        <h2 className="text-2xl font-extrabold mt-2">Sign in</h2>
        <p className="text-sm text-muted mt-2">
          MVP username sign-in (cookie). Use letters/numbers/underscore.
        </p>

        <Card className="p-6 mt-6">
          <div className="grid gap-3">
            <label className="grid gap-2">
              <div className="text-xs text-muted">Username</div>
              <input
                className="h-10 rounded-xl bg-black/40 border border-border px-3 text-sm outline-none focus:ring-2 focus:ring-brand/50"
                placeholder="coder_01"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
            {error ? <div className="text-sm text-rose-300">{error}</div> : null}
            <Button
              className="mt-2"
              disabled={loading || username.trim().length < 2}
              onClick={async () => {
                setLoading(true);
                setError(null);
                try {
                  const res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: username.trim() })
                  });
                  const data = (await res.json()) as { ok: boolean; stderr?: string };
                  if (!data.ok) {
                    setError(data.stderr ?? "Login failed.");
                    return;
                  }
                  router.push("/practice");
                  router.refresh();
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Login failed.");
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </Card>
      </div>
    </Container>
  );
}

