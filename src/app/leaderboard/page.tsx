import { Container, Card } from "@/components/ui";
import { problems } from "@/lib/data";
import { headers } from "next/headers";

async function getRows(problemSlug?: string) {
  const qs = problemSlug ? `?problemSlug=${encodeURIComponent(problemSlug)}` : "";
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (!host) return [];
  const url = `${proto}://${host}/api/leaderboard${qs}`;
  const res = await fetch(url, { cache: "no-store" });
  const data = (await res.json()) as {
    ok: boolean;
    rows?: { user: string; bestScore: number; ac: number; attempts: number }[];
  };
  return data.rows ?? [];
}

export default async function LeaderboardPage() {
  const rows = await getRows();
  return (
    <Container className="py-10">
      <div>
        <div className="text-xs tracking-[0.35em] text-muted">LEADERBOARD</div>
        <h2 className="text-2xl font-extrabold mt-2">Top coders (MVP)</h2>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          Based on accepted submissions stored locally. Next: per-problem boards, contest boards, ratings.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-8">
        <Card className="p-5 lg:col-span-2">
          <div className="text-sm font-semibold">Global</div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-muted">
                <tr>
                  <th className="text-left py-2">#</th>
                  <th className="text-left py-2">User</th>
                  <th className="text-right py-2">Best</th>
                  <th className="text-right py-2">AC</th>
                  <th className="text-right py-2">Attempts</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td className="py-3 text-muted" colSpan={5}>
                      No submissions yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr key={r.user} className="border-t border-border">
                      <td className="py-2">{i + 1}</td>
                      <td className="py-2 font-semibold">{r.user}</td>
                      <td className="py-2 text-right">{r.bestScore}</td>
                      <td className="py-2 text-right">{r.ac}</td>
                      <td className="py-2 text-right text-muted">{r.attempts}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-sm font-semibold">Problems</div>
          <div className="mt-3 grid gap-2">
            {problems.map((p) => (
              <a
                key={p.slug}
                href={`/practice/${p.slug}`}
                className="rounded-xl border border-border bg-white/5 p-3 hover:bg-white/10 transition"
              >
                <div className="font-semibold">{p.title}</div>
                <div className="text-xs text-muted mt-1">{p.difficulty} · {p.tags.join(" · ")}</div>
              </a>
            ))}
          </div>
        </Card>
      </div>
    </Container>
  );
}

