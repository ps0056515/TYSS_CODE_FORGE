import { Container, Card } from "@/components/ui";
import { getUser, isAdminUser } from "@/lib/auth";
import { listAllAssignments, listEnrolmentsByUser, getBatch } from "@/lib/assignment-platform-store";
import { loadAllSubmissionsCached, computeCodingProgressForUser, isAtRiskRuleBased } from "@/lib/dashboard-metrics";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardKpiCard, DashboardSection, DashboardCard } from "@/components/dashboard";
import { verdictLabel, verdictColorClass } from "@/lib/verdicts";
import { User, ListTodo, Activity, ArrowLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export default async function AdminStudentProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
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

  const { userId } = await params;
  const decodedId = decodeURIComponent(userId);
  const nowIso = new Date().toISOString();

  const [enrolments, allAssignments, subs] = await Promise.all([
    listEnrolmentsByUser(decodedId),
    listAllAssignments(),
    loadAllSubmissionsCached(),
  ]);

  if (!enrolments) notFound();

  const byId = new Map(allAssignments.map((a) => [a.id, a]));
  const items = enrolments
    .map((e) => ({ enrolment: e, assignment: byId.get(e.assignmentId) ?? null }))
    .filter((x) => x.assignment != null) as Array<{
      enrolment: (typeof enrolments)[number];
      assignment: NonNullable<(typeof byId) extends Map<unknown, infer V> ? V : never>;
    }>;

  const rows = await Promise.all(
    items.map(async ({ enrolment, assignment }) => {
      const batch = await getBatch(assignment.batchId);
      const prog = computeCodingProgressForUser(decodedId, assignment, subs);
      const completionPct =
        assignment.type === "coding_set" && prog && prog.total > 0 ? prog.solved / prog.total : 0;
      const risk = isAtRiskRuleBased({
        nowIso,
        dueAtIso: assignment.dueAt,
        completionPct,
        lastActivityIso: prog?.lastAt,
      });
      return { enrolment, assignment, batch, prog, completionPct, risk };
    })
  );

  const lastActivity = (() => {
    const times = rows.map((r) => r.prog?.lastAt).filter(Boolean) as string[];
    return times.sort().slice(-1)[0] ?? null;
  })();

  const atRiskCount = rows.filter((r) => r.risk.atRisk).length;
  const studentSubs = subs.filter((s) => s.user === decodedId).slice(0, 12);

  return (
    <Container className="py-8 md:py-10">
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-text transition mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>

      <header className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <User className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted">Student report</p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-text break-all md:text-2xl">{decodedId}</h1>
            <p className="mt-1 text-sm text-muted">
              Last activity: {lastActivity ? new Date(lastActivity).toLocaleString() : "—"}
              {atRiskCount > 0 && (
                <>
                  {" "}
                  · <span className="text-rose-600 dark:text-rose-400">{atRiskCount} at-risk</span>
                </>
              )}
            </p>
          </div>
        </div>
      </header>

      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <DashboardKpiCard
          label="Assignments joined"
          value={rows.length}
          icon={ListTodo}
          accent="brand"
        />
        <DashboardKpiCard
          label="At-risk flags"
          value={atRiskCount}
          icon={Activity}
          accent={atRiskCount > 0 ? "danger" : "neutral"}
          subtitle="Across all assignments"
        />
      </div>

      <DashboardSection
        title="Assignments"
        description="Progress and risk per assignment"
        icon={ListTodo}
      >
        {rows.length === 0 ? (
          <DashboardCard className="p-8 text-center">
            <p className="text-muted">No assignments found for this student.</p>
          </DashboardCard>
        ) : (
          <DashboardCard className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-black/5 dark:bg-white/5">
                    <th className="text-left p-4 font-medium text-text">Assignment</th>
                    <th className="text-left p-4 font-medium text-text">Batch</th>
                    <th className="text-left p-4 font-medium text-text">Due</th>
                    <th className="text-left p-4 font-medium text-text">Progress</th>
                    <th className="text-left p-4 font-medium text-text">Risk</th>
                    <th className="text-right p-4 font-medium text-text">Open</th>
                  </tr>
                </thead>
                <tbody>
                  {rows
                    .sort((a, b) => a.assignment.dueAt.localeCompare(b.assignment.dueAt))
                    .map((r) => (
                      <tr
                        key={r.assignment.id}
                        className="border-b border-border last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition"
                      >
                        <td className="p-4">
                          <div className="font-medium text-text">{r.assignment.title}</div>
                          <div className="text-xs text-muted">{r.assignment.type ?? "general"}</div>
                        </td>
                        <td className="p-4 text-muted">{r.batch?.name ?? "—"}</td>
                        <td className="p-4 text-muted">{new Date(r.assignment.dueAt).toLocaleString()}</td>
                        <td className="p-4">
                          {r.assignment.type === "coding_set" && r.prog ? (
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                                r.prog.solved >= (r.prog.total || 0)
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                  : r.prog.solved > 0
                                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                                    : "bg-black/10 dark:bg-white/10 text-muted"
                              )}
                            >
                              {r.prog.solved}/{r.prog.total}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="p-4">
                          {r.risk.atRisk ? (
                            <span className="text-xs text-rose-600 dark:text-rose-400">{r.risk.reasons.join(", ")}</span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            href={`/admin/assignments/${r.assignment.id}/dashboard`}
                            className="inline-flex items-center gap-1 text-brand hover:underline text-sm"
                          >
                            Dashboard
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
      </DashboardSection>

      <DashboardSection
        title="Recent submissions"
        description="Latest activity across CodeForge"
        icon={Activity}
        className="mt-10"
      >
        <DashboardCard className="p-5">
          {studentSubs.length === 0 ? (
            <p className="text-sm text-muted">No submissions found.</p>
          ) : (
            <ul className="space-y-2">
              {studentSubs.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-2 border-b border-border last:border-0 text-sm"
                >
                  <span className="font-medium text-text">{s.problemSlug}</span>
                  <span className={cn("text-xs font-medium", verdictColorClass(s.verdict))}>
                    {verdictLabel(s.verdict)}
                  </span>
                  <span className="text-xs text-muted tabular-nums">{s.score}</span>
                  <span className="text-xs text-muted">{new Date(s.createdAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>
      </DashboardSection>
    </Container>
  );
}
