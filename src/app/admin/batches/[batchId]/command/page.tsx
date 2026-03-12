import { Container, Card } from "@/components/ui";
import { getUser, isAdminUser } from "@/lib/auth";
import {
  getBatch,
  listAssignments,
  listMaterials,
  listEnrolments,
} from "@/lib/assignment-platform-store";
import { loadAllSubmissionsCached, computeCodingProgressForUser, isAtRiskRuleBased } from "@/lib/dashboard-metrics";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DashboardKpiCard,
  DashboardSection,
  DashboardCard,
  ProgressBar,
} from "@/components/dashboard";
import {
  ClipboardList,
  Calendar,
  AlertTriangle,
  Users,
  TrendingUp,
  Activity,
  ChevronRight,
  ArrowLeft,
  Grid3X3,
} from "lucide-react";
import { cn } from "@/lib/cn";

export default async function BatchCommandCenterPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
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

  const { batchId } = await params;
  const batch = await getBatch(batchId);
  if (!batch) notFound();

  const nowIso = new Date().toISOString();
  const [assignments, materials, allSubs] = await Promise.all([
    listAssignments(batchId),
    listMaterials(batchId),
    loadAllSubmissionsCached(),
  ]);

  const current = (() => {
    const future = assignments.filter((a) => a.dueAt > nowIso).sort((a, b) => a.dueAt.localeCompare(b.dueAt))[0];
    if (future) return future;
    return assignments.slice().sort((a, b) => b.dueAt.localeCompare(a.dueAt))[0] ?? null;
  })();

  const enrolments = current ? await listEnrolments(current.id) : [];
  const studentIds = enrolments.map((e) => e.userId);

  const codingSlugs = current?.type === "coding_set" ? (current.codingSet?.problemSlugs ?? []) : [];
  const threshold = current?.codingSet?.completionScoreThreshold ?? 100;

  const perStudent = studentIds.map((sid) => {
    const prog = current ? computeCodingProgressForUser(sid, current, allSubs) : null;
    const completionPct = prog && prog.total > 0 ? prog.solved / prog.total : 0;
    const risk = current
      ? isAtRiskRuleBased({
          nowIso,
          dueAtIso: current.dueAt,
          completionPct,
          lastActivityIso: prog?.lastAt,
        })
      : { atRisk: false, reasons: [] };
    return { sid, prog, completionPct, risk };
  });

  const funnel = (() => {
    if (!current) return null;
    const totalEnrolled = enrolments.length;
    let notStarted = 0;
    let inProgress = 0;
    let completed = 0;
    for (const s of perStudent) {
      const p = s.prog;
      const solved = p?.solved ?? 0;
      const total = p?.total ?? (codingSlugs.length || 0);
      if (!total) {
        notStarted++;
        continue;
      }
      if (solved <= 0) notStarted++;
      else if (solved >= total) completed++;
      else inProgress++;
    }
    return { totalEnrolled, notStarted, inProgress, completed };
  })();

  const atRiskList = perStudent
    .filter((s) => s.risk.atRisk)
    .map((s) => ({ student: s.sid, reasons: s.risk.reasons, progress: s.prog, completionPct: s.completionPct }))
    .sort((a, b) => (a.completionPct ?? 0) - (b.completionPct ?? 0));

  const todayHandouts = (() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayPrefix = `${yyyy}-${mm}-${dd}`;
    return materials.filter((m) => m.createdAt.startsWith(todayPrefix) || m.day === 1);
  })();

  const activityLast24h = (() => {
    const since = Date.now() - 24 * 3600 * 1000;
    const relevantUsers = new Set(studentIds);
    const relevantProblemSlugs = new Set(codingSlugs);
    return allSubs
      .filter((s) => relevantUsers.has(s.user))
      .filter((s) => (codingSlugs.length ? relevantProblemSlugs.has(s.problemSlug) : true))
      .filter((s) => new Date(s.createdAt).getTime() >= since)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 12);
  })();

  const heatCols = codingSlugs.slice(0, 8);

  return (
    <Container className="py-8 md:py-10">
      <Link
        href={`/admin/batches/${batchId}`}
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-text transition mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Batch
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted">Command center</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-text md:text-3xl">{batch.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {batch.skill} · {batch.startDate} – {batch.endDate}
          </p>
        </div>
        {current && (
          <Link
            href={`/admin/assignments/${current.id}/dashboard`}
            className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline shrink-0"
          >
            Open current assignment
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <DashboardCard className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted">Handout</p>
              <p className="font-semibold text-text">{todayHandouts.length ? "Published" : "Not added"}</p>
            </div>
          </div>
          <p className="text-sm text-muted">
            {todayHandouts.length ? todayHandouts[0].title : "Add a handout for today"}
          </p>
        </DashboardCard>

        <DashboardCard className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted">Next due</p>
              <p className="font-semibold text-text truncate">{current ? current.title : "—"}</p>
            </div>
          </div>
          <p className="text-sm text-muted">
            {current ? new Date(current.dueAt).toLocaleString() : "Create an assignment"}
          </p>
        </DashboardCard>

        <DashboardKpiCard
          label="At-risk students"
          value={atRiskList.length}
          icon={AlertTriangle}
          accent={atRiskList.length > 0 ? "danger" : "neutral"}
          subtitle="Need attention"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-10">
        <DashboardSection
          title="Batch health"
          description="Current assignment stats"
          icon={Users}
          className="lg:col-span-1"
        >
          <DashboardCard className="p-5">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Enrolled (current)</dt>
                <dd className="font-medium tabular-nums">{enrolments.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Coding set size</dt>
                <dd className="font-medium tabular-nums">{codingSlugs.length || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Pass threshold</dt>
                <dd className="font-medium tabular-nums">{codingSlugs.length ? `≥ ${threshold}` : "—"}</dd>
              </div>
            </dl>
          </DashboardCard>
        </DashboardSection>

        <DashboardSection
          title="Progress funnel"
          description={current ? current.title : "No assignment selected"}
          icon={TrendingUp}
          className="lg:col-span-2"
        >
          {!current ? (
            <DashboardCard className="p-8 text-center">
              <p className="text-muted">No assignments yet. Add one in the batch.</p>
            </DashboardCard>
          ) : (
            <DashboardCard className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-xl border border-border bg-black/5 dark:bg-white/5 p-4 text-center">
                  <p className="text-2xl font-bold tabular-nums text-text">{funnel?.totalEnrolled ?? 0}</p>
                  <p className="text-xs text-muted mt-1">Enrolled</p>
                </div>
                <div className="rounded-xl border border-border bg-black/5 dark:bg-white/5 p-4 text-center">
                  <p className="text-2xl font-bold tabular-nums text-muted">{funnel?.notStarted ?? 0}</p>
                  <p className="text-xs text-muted mt-1">Not started</p>
                </div>
                <div className="rounded-xl border border-border bg-amber-500/10 p-4 text-center">
                  <p className="text-2xl font-bold tabular-nums text-amber-700 dark:text-amber-300">{funnel?.inProgress ?? 0}</p>
                  <p className="text-xs text-muted mt-1">In progress</p>
                </div>
                <div className="rounded-xl border border-border bg-emerald-500/10 p-4 text-center">
                  <p className="text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300">{funnel?.completed ?? 0}</p>
                  <p className="text-xs text-muted mt-1">Completed</p>
                </div>
              </div>
              {funnel && funnel.totalEnrolled > 0 && (
                <div className="mt-4">
                  <ProgressBar
                    value={funnel.completed}
                    max={funnel.totalEnrolled}
                    tone="success"
                    height="sm"
                    showLabel
                  />
                </div>
              )}
            </DashboardCard>
          )}
        </DashboardSection>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-10">
        <DashboardSection
          title="Recent activity (24h)"
          description="Latest submissions for current assignment"
          icon={Activity}
          className="lg:col-span-2"
        >
          <DashboardCard className="p-5">
            {activityLast24h.length === 0 ? (
              <p className="text-sm text-muted">No recent submissions.</p>
            ) : (
              <ul className="space-y-2">
                {activityLast24h.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0 text-sm"
                  >
                    <span className="font-medium text-text truncate">{e.user}</span>
                    <span className="text-xs text-muted shrink-0">
                      {e.problemSlug} · {new Date(e.createdAt).toLocaleTimeString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </DashboardCard>
        </DashboardSection>

        <DashboardSection title="At-risk students" description="Rule-based flags" icon={AlertTriangle} className="lg:col-span-1">
          {atRiskList.length === 0 ? (
            <DashboardCard className="p-5">
              <p className="text-sm text-muted">No at-risk students flagged.</p>
            </DashboardCard>
          ) : (
            <DashboardCard accent="danger" className="p-0 overflow-hidden">
              <ul className="divide-y divide-border">
                {atRiskList.slice(0, 6).map((r) => (
                  <li key={r.student} className="p-4 hover:bg-black/5 dark:hover:bg-white/5 transition">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/admin/students/${encodeURIComponent(r.student)}`}
                          className="font-medium text-text hover:text-brand truncate block"
                        >
                          {r.student}
                        </Link>
                        <p className="text-xs text-muted mt-0.5">{r.reasons.join(", ")}</p>
                        <p className="text-xs text-muted mt-0.5">
                          {r.progress ? `${r.progress.solved}/${r.progress.total}` : "—"} ·{" "}
                          {r.progress?.lastAt ? new Date(r.progress.lastAt).toLocaleDateString() : "—"}
                        </p>
                      </div>
                      <Link
                        href={`/admin/students/${encodeURIComponent(r.student)}`}
                        className="shrink-0 text-sm text-brand hover:underline inline-flex items-center"
                      >
                        Report
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
              {atRiskList.length > 6 && (
                <p className="p-3 text-xs text-muted border-t border-border">Showing 6 of {atRiskList.length}</p>
              )}
            </DashboardCard>
          )}
        </DashboardSection>
      </div>

      <DashboardSection
        title="Mastery heatmap"
        description="Per-student, per-problem scores (green = passed, amber = partial, red = low)"
        icon={Grid3X3}
      >
        {!current || heatCols.length === 0 ? (
          <DashboardCard className="p-8 text-center">
            <p className="text-muted">No coding set selected or no problems.</p>
          </DashboardCard>
        ) : (
          <DashboardCard className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[520px] w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-black/5 dark:bg-white/5">
                    <th className="text-left p-3 font-medium text-text">Student</th>
                    {heatCols.map((c) => (
                      <th key={c} className="p-3 text-muted text-center font-medium truncate max-w-[80px]" title={c}>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {perStudent.slice(0, 14).map((s) => {
                    const best = s.prog?.bestBySlug ?? {};
                    return (
                      <tr key={s.sid} className="border-b border-border last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition">
                        <td className="p-3 text-muted truncate max-w-[140px]" title={s.sid}>
                          {s.sid}
                        </td>
                        {heatCols.map((c) => {
                          const sc = best[c] ?? null;
                          const tone =
                            sc == null
                              ? "muted"
                              : sc >= threshold
                                ? "success"
                                : sc >= 80
                                  ? "warning"
                                  : "danger";
                          return (
                            <td key={c} className="p-2 text-center">
                              <span
                                className={cn(
                                  "inline-flex items-center justify-center min-w-[36px] rounded-md px-2 py-1 font-medium tabular-nums",
                                  tone === "muted" && "bg-black/5 dark:bg-white/5 text-muted",
                                  tone === "success" && "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
                                  tone === "warning" && "bg-amber-500/20 text-amber-700 dark:text-amber-300",
                                  tone === "danger" && "bg-rose-500/20 text-rose-700 dark:text-rose-300"
                                )}
                              >
                                {sc == null ? "—" : sc}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {perStudent.length > 14 && (
              <p className="p-3 text-xs text-muted border-t border-border">Showing first 14 students.</p>
            )}
          </DashboardCard>
        )}
      </DashboardSection>
    </Container>
  );
}
