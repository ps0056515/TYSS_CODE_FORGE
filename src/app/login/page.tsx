"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signIn, getProviders } from "next-auth/react";
import { Container, Card, Button } from "@/components/ui";

const OAUTH_PROVIDERS = [
  { id: "google", label: "Google", icon: "G" },
  { id: "github", label: "GitHub", icon: "⌘" },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [oauthLoading, setOauthLoading] = React.useState<string | null>(null);
  const [providers, setProviders] = React.useState<Record<string, { id: string; name: string }> | null>(null);

  React.useEffect(() => {
    getProviders().then(setProviders);
  }, []);

  const enabledOAuth = OAUTH_PROVIDERS.filter((p) => providers?.[p.id]);

  return (
    <Container className="py-12 md:py-16">
      <div className="max-w-md mx-auto">
        <div className="text-xs font-medium tracking-widest text-muted uppercase">Sign in</div>
        <h1 className="text-2xl md:text-3xl font-extrabold mt-2 text-text">Welcome back</h1>
        <p className="text-sm text-muted mt-2">
          Use single sign-on (Google/GitHub) or a username to track progress and appear on the leaderboard.
        </p>

        <Card className="p-6 mt-8">
          <div className="text-sm font-semibold text-text mb-3">Single sign-on (OAuth)</div>
          {enabledOAuth.length === 0 && (
            <p className="text-xs text-amber-200/90 mb-3">
              Set NEXTAUTH_URL and NEXTAUTH_SECRET in .env.local, then add Google or GitHub credentials below. Restart the dev server after changing .env.local.
            </p>
          )}
          <div className="flex flex-col gap-2">
            {OAUTH_PROVIDERS.map((p) => {
              const enabled = enabledOAuth.some((e) => e.id === p.id);
              return (
                <div key={p.id}>
                  <button
                    type="button"
                    disabled={!enabled || !!oauthLoading}
                    onClick={() => {
                      if (!enabled) return;
                      setOauthLoading(p.id);
                      signIn(p.id, { callbackUrl: "/practice" });
                    }}
                    className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-border bg-white/5 hover:bg-white/10 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {oauthLoading === p.id ? "Redirecting…" : `Sign in with ${p.label}`}
                  </button>
                  {!enabled && (
                    <p className="mt-1 text-xs text-muted">
                      Add {p.id === "google" ? "GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET" : "GITHUB_ID & GITHUB_SECRET"} to .env.local and restart the server.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6 mt-6">
          <div className="text-sm font-semibold text-text mb-3">
            Or sign in with username
          </div>
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
                    body: JSON.stringify({ username: username.trim() }),
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
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </div>
        </Card>
      </div>
    </Container>
  );
}

