import { Container, Card } from "@/components/ui";
import { problems } from "@/lib/data";
import { headers } from "next/headers";

type Row = {
  id: string;
  createdAt: string;
  user: string;
  problemSlug: string;
  language: string;
  verdict?: "AC" | "PARTIAL" | "WA" | "RE" | "TLE";
  score?: number;
  allPass?: boolean;
};

function verdictOf(r: Row) {
  if (r.verdict) return r.verdict;
  if (typeof r.allPass === "boolean") return r.allPass ? "AC" : "WA";
  return "WA";
}

export default async function SubmissionsPage() {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const base = host ? `${proto}://${host}` : "http://localhost:3002";
  const res = await fetch(`${base}/api/submissionsAll?limit=80`, { cache: "no-store" });
  const data = (await res.json()) as { ok: boolean; items?: Row[] };
  const items = data.items ?? [];
  const titleBySlug = new Map(problems.map((p) => [p.slug, p.title]));

  return (
    <Container className="py-10">
      <div>
        <div className="text-xs tracking-[0.35em] text-muted">SUBMISSIONS</div>
        <h2 className="text-2xl font-extrabold mt-2">Recent submissions</h2>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          Latest submissions across users (local MVP). Next: filters, pagination, per-submission code view.
        </p>
      </div>

      <Card className="p-5 mt-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted">
              <tr>
                <th className="text-left py-2">Time</th>
                <th className="text-left py-2">User</th>
                <th className="text-left py-2">Problem</th>
                <th className="text-left py-2">Lang</th>
                <th className="text-right py-2">Score</th>
                <th className="text-right py-2">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-3 text-muted">
                    No submissions yet.
                  </td>
                </tr>
              ) : (
                items.map((r) => {
                  const v = verdictOf(r);
                  const cls =
                    v === "AC"
                      ? "text-emerald-300"
                      : v === "PARTIAL"
                        ? "text-amber-300"
                      : v === "WA"
                        ? "text-rose-300"
                        : v === "TLE"
                          ? "text-amber-300"
                          : "text-rose-300";
                  return (
                    <tr key={r.id} className="border-t border-border">
                      <td className="py-2 text-muted">{new Date(r.createdAt).toLocaleString()}</td>
                      <td className="py-2 font-semibold">{r.user}</td>
                      <td className="py-2">
                        <a className="underline" href={`/practice/${r.problemSlug}`}>
                          {titleBySlug.get(r.problemSlug) ?? r.problemSlug}
                        </a>
                      </td>
                      <td className="py-2 text-muted">{r.language}</td>
                      <td className="py-2 text-right text-muted">{typeof r.score === "number" ? r.score : v === "AC" ? 100 : 0}</td>
                      <td className={`py-2 text-right font-semibold ${cls}`}>{v}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </Container>
  );
}

