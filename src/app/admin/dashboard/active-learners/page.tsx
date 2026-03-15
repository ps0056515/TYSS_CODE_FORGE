import { Container, Card } from "@/components/ui";
import { getUserAsync, isAdminUser } from "@/lib/auth";
import Link from "next/link";
import { loadAllSubmissionsCached } from "@/lib/dashboard-metrics";
import { getActiveLearnersList } from "@/lib/dashboard-lists";
import { DashboardCard } from "@/components/dashboard";
import { ArrowLeft, Users, ChevronRight } from "lucide-react";

export default async function ActiveLearnersPage() {
  const user = await getUserAsync();
  const isAdmin = isAdminUser(user);
  if (!user || !isAdmin) {
    return (
      <Container className="py-10">
        <Card className="p-6">
          <div className="text-xs tracking-[0.35em] text-muted">ADMIN</div>
          <h2 className="text-2xl font-extrabold mt-2">Access restricted</h2>
        </Card>
      </Container>
    );
  }

  const subs = await loadAllSubmissionsCached();
  const since = Date.now() - 7 * 24 * 3600 * 1000;
  const list = getActiveLearnersList(subs, since);

  return (
    <Container className="py-8 md:py-10">
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-text transition mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <header className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted">Active learners</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-text">Last 7 days</h1>
            <p className="mt-1 text-sm text-muted">
              Students with at least one submission in the past 7 days
            </p>
          </div>
        </div>
      </header>

      {list.length === 0 ? (
        <DashboardCard className="p-8 text-center">
          <p className="text-muted">No active learners in the last 7 days.</p>
        </DashboardCard>
      ) : (
        <DashboardCard className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-black/5 dark:bg-white/5">
                  <th className="text-left p-4 font-medium text-text">Student</th>
                  <th className="text-left p-4 font-medium text-text">Last activity</th>
                  <th className="text-right p-4 font-medium text-text">Submissions (7d)</th>
                  <th className="w-16 p-4" />
                </tr>
              </thead>
              <tbody>
                {list.map((row) => (
                  <tr
                    key={row.userId}
                    className="border-b border-border last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition"
                  >
                    <td className="p-4 font-medium text-text">{row.userId}</td>
                    <td className="p-4 text-muted">{new Date(row.lastActivity).toLocaleString()}</td>
                    <td className="p-4 text-right tabular-nums">{row.submissionCount}</td>
                    <td className="p-4">
                      <Link
                        href={`/admin/students/${encodeURIComponent(row.userId)}`}
                        className="inline-flex items-center gap-1 text-sm text-brand hover:underline"
                      >
                        Profile
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      )}
    </Container>
  );
}
