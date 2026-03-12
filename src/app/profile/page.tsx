import { Container, Card } from "@/components/ui";
import { problems } from "@/lib/data";
import { verdictLabel, verdictColorClass } from "@/lib/verdicts";
import { getUserAsync } from "@/lib/auth";
import { getProgressForUser, listAllSubmissions } from "@/lib/submissions";

type SubRow = {
  id: string;
  createdAt: string;
  language: string;
  verdict?: "AC" | "WA" | "RE" | "TLE";
  allPass?: boolean;
  problemSlug: string;
};

function verdictOf(r: SubRow): string {
  if (r.verdict) return r.verdict;
  if (typeof r.allPass === "boolean") return r.allPass ? "AC" : "WA";
  return "WA";
}

export default async function ProfilePage() {
  const user = await getUserAsync();
  const progress = user ? await getProgressForUser(user) : { solved: [] as string[], counts: { ac: 0, total: 0 } };

  const solvedTitles = new Map(problems.map((p) => [p.slug, p.title]));

  const allSubs = user ? await listAllSubmissions() : [];
  const mine: SubRow[] = allSubs
    .filter((x) => x.user === user)
    .slice(0, 200)
    .map((s) => ({
      id: s.id,
      createdAt: s.createdAt,
      language: s.language,
      verdict: s.verdict,
      allPass: undefined,
      problemSlug: s.problemSlug,
    }));

  return (
    <Container className="py-10">
      <div>
        <div className="text-xs tracking-[0.35em] text-muted">PROFILE</div>
        <h2 className="text-2xl font-extrabold mt-2">Your progress</h2>
        <p className="text-sm text-muted mt-2 max-w-2xl">Local MVP profile. Next: avatars, streaks, ratings.</p>
      </div>

      {!user ? (
        <Card className="p-6 mt-8">
          <div className="text-sm text-muted">
            You’re not signed in. Go to <a className="underline" href="/login">/login</a>.
          </div>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4 mt-8">
          <Card className="p-6">
            <div className="text-xs tracking-[0.35em] text-muted">USER</div>
            <div className="mt-2 text-xl font-extrabold">{user}</div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-white/5 p-4">
                <div className="text-xs text-muted">Solved</div>
                <div className="text-2xl font-extrabold mt-1">{progress.solved.length}</div>
              </div>
              <div className="rounded-xl border border-border bg-white/5 p-4">
                <div className="text-xs text-muted">Submissions</div>
                <div className="text-2xl font-extrabold mt-1">{progress.counts.total}</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 lg:col-span-2">
            <div className="text-sm font-semibold">Solved problems</div>
            <div className="mt-3 grid md:grid-cols-2 gap-2">
              {progress.solved.length === 0 ? (
                <div className="text-sm text-muted">No solved problems yet.</div>
              ) : (
                progress.solved.map((slug: string) => (
                  <a
                    key={slug}
                    className="rounded-xl border border-border bg-white/5 p-3 hover:bg-white/10 transition"
                    href={`/practice/${slug}`}
                  >
                    <div className="font-semibold">{solvedTitles.get(slug) ?? slug}</div>
                    <div className="text-xs text-muted mt-1">{slug}</div>
                  </a>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6 lg:col-span-3">
            <div className="text-sm font-semibold">Recent submissions</div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-muted">
                  <tr>
                    <th className="text-left py-2">Time</th>
                    <th className="text-left py-2">Problem</th>
                    <th className="text-left py-2">Lang</th>
                    <th className="text-right py-2">Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {mine.length === 0 ? (
                    <tr>
                      <td className="py-3 text-muted" colSpan={4}>
                        No submissions yet.
                      </td>
                    </tr>
                  ) : (
                    mine.slice(0, 25).map((r) => {
                      const v = verdictOf(r);
                      return (
                        <tr key={r.id} className="border-t border-border">
                          <td className="py-2 text-muted">{new Date(r.createdAt).toLocaleString()}</td>
                          <td className="py-2">
                            <a className="underline" href={`/practice/${r.problemSlug}`}>
                              {solvedTitles.get(r.problemSlug) ?? r.problemSlug}
                            </a>
                          </td>
                          <td className="py-2 text-muted">{r.language}</td>
                          <td className={`py-2 text-right font-semibold ${verdictColorClass(v)}`}>
                            {verdictLabel(v)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </Container>
  );
}

