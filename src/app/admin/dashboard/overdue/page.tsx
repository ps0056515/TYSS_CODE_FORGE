import { Container, Card } from "@/components/ui";
import { getUser, isAdminUser } from "@/lib/auth";
import Link from "next/link";
import { listAllAssignments } from "@/lib/assignment-platform-store";
import { loadAllSubmissionsCached } from "@/lib/dashboard-metrics";
import { getOverdueStudentsList } from "@/lib/dashboard-lists";
import { DashboardCard } from "@/components/dashboard";
import { ArrowLeft, Clock, ChevronRight } from "lucide-react";

export default async function OverdueStudentsPage() {
  const user = getUser();
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

  const [assignments, subs] = await Promise.all([
    listAllAssignments(),
    loadAllSubmissionsCached(),
  ]);
  const list = await getOverdueStudentsList(assignments, subs);

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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted">Overdue</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-text">Overdue students</h1>
            <p className="mt-1 text-sm text-muted">
              Past due date with assignment not yet completed
            </p>
          </div>
        </div>
      </header>

      {list.length === 0 ? (
        <DashboardCard className="p-8 text-center">
          <p className="text-muted">No overdue students.</p>
        </DashboardCard>
      ) : (
        <DashboardCard className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-black/5 dark:bg-white/5">
                  <th className="text-left p-4 font-medium text-text">Student</th>
                  <th className="text-left p-4 font-medium text-text">Assignment</th>
                  <th className="text-left p-4 font-medium text-text">Due date</th>
                  <th className="text-right p-4 font-medium text-text">Progress</th>
                  <th className="w-32 p-4" />
                </tr>
              </thead>
              <tbody>
                {list.map((row) => (
                  <tr
                    key={`${row.userId}-${row.assignmentId}`}
                    className="border-b border-border last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition"
                  >
                    <td className="p-4 font-medium text-text">{row.userId}</td>
                    <td className="p-4 text-muted">{row.assignmentTitle}</td>
                    <td className="p-4 text-muted">{new Date(row.dueAt).toLocaleString()}</td>
                    <td className="p-4 text-right tabular-nums">
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        {row.solved}/{row.total}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          href={`/admin/students/${encodeURIComponent(row.userId)}`}
                          className="text-sm text-brand hover:underline"
                        >
                          Profile
                        </Link>
                        <Link
                          href={`/admin/assignments/${row.assignmentId}/dashboard`}
                          className="inline-flex items-center gap-1 text-sm text-brand hover:underline"
                        >
                          Assignment
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
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
