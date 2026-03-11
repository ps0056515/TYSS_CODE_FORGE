import { Container, Card } from "@/components/ui";
import { headers } from "next/headers";
import { getProblemBySlug } from "@/lib/problems_store";
import { notFound } from "next/navigation";

async function getRows(problemSlug: string) {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const base = host ? `${proto}://${host}` : "http://localhost:3002";
  const res = await fetch(`${base}/api/leaderboard?problemSlug=${encodeURIComponent(problemSlug)}`, { cache: "no-store" });
  const data = (await res.json()) as {
    ok: boolean;
    rows?: { user: string; bestScore: number; ac: number; attempts: number }[];
  };
  return data.rows ?? [];
}

export default async function ProblemLeaderboardPage({ params }: { params: { slug: string } }) {
  const problem = await getProblemBySlug(params.slug);
  if (!problem) return notFound();

  const rows = await getRows(problem.slug);
  return (
    <Container className="py-10">
      <div>
        <div className="text-xs tracking-[0.35em] text-muted">LEADERBOARD</div>
        <h2 className="text-2xl font-extrabold mt-2">{problem.title}</h2>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          Per-problem leaderboard (MVP). Ranked by accepted submissions count.
        </p>
      </div>

      <Card className="p-5 mt-8">
        <div className="overflow-x-auto">
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
    </Container>
  );
}

