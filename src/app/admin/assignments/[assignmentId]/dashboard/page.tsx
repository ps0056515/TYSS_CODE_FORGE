import { Container, Card } from "@/components/ui";
import { getUserAsync, isAdminUser } from "@/lib/auth";
import { getAssignment, getBatch, listEnrolments } from "@/lib/assignment-platform-store";
import { listAllSubmissions } from "@/lib/submissions";
import { isAtRiskRuleBased } from "@/lib/dashboard-metrics";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyInviteLink } from "./CopyInviteLink";
import { UnenrollButton } from "./UnenrollButton";
import {
  DashboardKpiCard,
  DashboardSection,
  DashboardCard,
  ProgressBar,
} from "@/components/dashboard";
import {
  Users,
  CheckCircle2,
  Loader2,
  Circle,
  Clock,
  AlertTriangle,
  Link2,
  ChevronRight,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/cn";

export default async function AssignmentDashboardPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
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
  const { assignmentId } = await params;
  const [assignment, enrolments] = await Promise.all([
    getAssignment(assignmentId),
    listEnrolments(assignmentId),
  ]);
  if (!assignment) notFound();
  const batch = await getBatch(assignment.batchId);

  const baseUrl = process.env.NEXTAUTH_URL || "";
  const inviteLink = baseUrl ? `${baseUrl.replace(/\/$/, "")}/join/${assignment.id}` : `/join/${assignment.id}`;

  const codingSlugs = assignment.type === "coding_set" ? (assignment.codingSet?.problemSlugs ?? []) : [];
  const threshold = assignment.codingSet?.completionScoreThreshold ?? 100;
  const allSubs = codingSlugs.length ? await listAllSubmissions() : [];

  const progressByUser = (() => {
    if (!codingSlugs.length) return new Map<string, { solved: number; lastAt?: string }>();
    const set = new Set(codingSlugs);
    const map = new Map<string, { best: Map<string, number>; lastAt?: string }>();
    for (const s of allSubs) {
      if (!set.has(s.problemSlug)) continue;
      const u = s.user;
      const curr = map.get(u) ?? { best: new Map<string, number>(), lastAt: undefined };
      const prev = curr.best.get(s.problemSlug) ?? -1;
      if (s.score > prev) curr.best.set(s.problemSlug, s.score);
      if (!curr.lastAt || s.createdAt > curr.lastAt) curr.lastAt = s.createdAt;
      map.set(u, curr);
    }
    const out = new Map<string, { solved: number; lastAt?: string }>();
    for (const [u, v] of map.entries()) {
      let solved = 0;
      for (const slug of codingSlugs) {
        const sc = v.best.get(slug) ?? -1;
        if (sc >= threshold) solved++;
      }
      out.set(u, { solved, lastAt: v.lastAt });
    }
    return out;
  })();

  const snapshot = (() => {
    const nowIso = new Date().toISOString();
    const total = enrolments.length;
    if (!total) return { total: 0, completed: 0, inProgress: 0, notStarted: 0, atRisk: 0, late: 0, completionPct: 0 };
    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;
    let atRisk = 0;
    let late = 0;
    for (const e of enrolments) {
      const p = progressByUser.get(e.userId);
      const solved = p?.solved ?? 0;
      const totalProblems = codingSlugs.length || 0;
      const completionPct = totalProblems ? solved / totalProblems : 0;
      if (solved <= 0) notStarted++;
      else if (totalProblems && solved >= totalProblems) completed++;
      else inProgress++;
      const risk = isAtRiskRuleBased({
        nowIso,
        dueAtIso: assignment.dueAt,
        completionPct,
        lastActivityIso: p?.lastAt,
      });
      if (risk.atRisk) atRisk++;
      if (nowIso > assignment.dueAt && completionPct < 1) late++;
    }
    const completionPct = codingSlugs.length ? completed / total : 0;
    return { total, completed, inProgress, notStarted, atRisk, late, completionPct };
  })();

  const completionPct = snapshot.total ? Math.round((snapshot.completed / snapshot.total) * 100) : 0;

  return (
    <Container className="py-8 md:py-10">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Link
          href={`/admin/batches/${assignment.batchId}`}
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-text transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Batch
        </Link>
        <span className="text-muted">·</span>
        <Link href={`/admin/assignments/${assignmentId}/edit`} className="text-sm text-muted hover:text-text transition">
          Configure
        </Link>
      </div>

      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-muted">Assignment dashboard</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-text md:text-3xl">{assignment.title}</h1>
        {batch && (
          <p className="mt-1 text-sm text-muted">
            {batch.name} · Due {new Date(assignment.dueAt).toLocaleString()}
          </p>
        )}
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <DashboardKpiCard label="Enrolled" value={snapshot.total} icon={Users} accent="brand" />
        <DashboardKpiCard label="Completed" value={snapshot.completed} icon={CheckCircle2} accent="success" />
        <DashboardKpiCard label="In progress" value={snapshot.inProgress} icon={Loader2} accent="neutral" />
        <DashboardKpiCard label="Not started" value={snapshot.notStarted} icon={Circle} accent="neutral" />
        <DashboardKpiCard label="Late" value={snapshot.late} icon={Clock} accent="warning" />
        <DashboardKpiCard label="At-risk" value={snapshot.atRisk} icon={AlertTriangle} accent="danger" />
      </div>

      {snapshot.total > 0 && (
        <div className="mb-8">
          <p className="text-xs font-medium text-muted mb-2">Class completion</p>
          <ProgressBar value={snapshot.completed} max={snapshot.total} tone="success" height="md" showLabel />
        </div>
      )}

      <DashboardSection title="Invitation link" description="Share with students to join this assignment" icon={Link2}>
        <DashboardCard accent="brand" className="p-5">
          <p className="text-sm text-muted mb-3">When students open this link and click Join, they are enrolled.</p>
          <div className="flex flex-wrap gap-2 items-center">
            <code className="flex-1 min-w-0 truncate rounded-lg bg-black/10 dark:bg-white/10 px-3 py-2 text-xs break-all font-mono">
              {inviteLink}
            </code>
            <CopyInviteLink inviteLink={inviteLink} />
          </div>
        </DashboardCard>
      </DashboardSection>

      <DashboardSection
        title="Enrolled students"
        description={enrolments.length ? `${enrolments.length} enrolled` : "Share the invite link to get enrollments"}
        icon={Users}
        className="mt-10"
      >
        {enrolments.length === 0 ? (
          <DashboardCard className="p-8 text-center">
            <p className="text-muted">No one has joined yet. Share the invitation link above.</p>
          </DashboardCard>
        ) : (
          <DashboardCard className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-black/5 dark:bg-white/5">
                    <th className="text-left p-4 font-medium text-text">Student</th>
                    {codingSlugs.length > 0 && (
                      <>
                        <th className="text-left p-4 font-medium text-text">Progress</th>
                        <th className="text-left p-4 font-medium text-text">Last activity</th>
                      </>
                    )}
                    <th className="text-left p-4 font-medium text-text">Joined</th>
                    <th className="text-left p-4 font-medium text-text">Repo</th>
                    <th className="text-left p-4 font-medium text-text">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolments.map((e) => {
                    const p = progressByUser.get(e.userId);
                    const solved = p?.solved ?? 0;
                    const total = codingSlugs.length || 0;
                    const isComplete = total > 0 && solved >= total;
                    const isStarted = solved > 0;
                    const status =
                      isComplete ? "completed" : isStarted ? "in_progress" : "not_started";
                    return (
                      <tr
                        key={e.id}
                        className="border-b border-border last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition"
                      >
                        <td className="p-4 font-medium text-text">{e.userId}</td>
                        {codingSlugs.length > 0 && (
                          <>
                            <td className="p-4">
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                  status === "completed" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                                  status === "in_progress" && "bg-amber-500/15 text-amber-700 dark:text-amber-300",
                                  status === "not_started" && "bg-black/10 dark:bg-white/10 text-muted"
                                )}
                              >
                                {solved}/{total}
                              </span>
                            </td>
                            <td className="p-4 text-muted">{p?.lastAt ? new Date(p.lastAt).toLocaleString() : "—"}</td>
                          </>
                        )}
                        <td className="p-4 text-muted">{new Date(e.joinedAt).toLocaleString()}</td>
                        <td className="p-4">
                          {e.repoUrl ? (
                            <a
                              href={e.repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-brand hover:underline"
                            >
                              Open
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              href={`/admin/students/${encodeURIComponent(e.userId)}`}
                              className="inline-flex items-center gap-1 text-sm text-muted hover:text-brand transition"
                            >
                              View
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                            <UnenrollButton assignmentId={assignmentId} userId={e.userId} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        )}
      </DashboardSection>
    </Container>
  );
}
