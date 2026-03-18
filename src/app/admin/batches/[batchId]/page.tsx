import { Container, Card } from "@/components/ui";
import { getUserAsync, isAdminUser } from "@/lib/auth";
import {
  getBatch,
  listBatchMembers,
  listAssignments,
} from "@/lib/assignment-platform-store";
import { loadAllSubmissionsCached } from "@/lib/dashboard-metrics";
import { computeCodingProgressForUser, isAtRiskRuleBased } from "@/lib/dashboard-metrics";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminBatchDetailClient } from "./AdminBatchDetailClient";
import { ChevronRight, BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminBatchDetailPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const user = await getUserAsync();
  const isAdmin = isAdminUser(user);
  if (!user || !isAdmin) {
    return (
      <Container className="py-10">
        <p className="text-muted">Access restricted.</p>
      </Container>
    );
  }
  const { batchId } = await params;
  const batch = await getBatch(batchId);
  if (!batch) notFound();

  const [members, assignments, subs] = await Promise.all([
    listBatchMembers(batchId),
    listAssignments(batchId),
    loadAllSubmissionsCached(),
  ]);

  const codingAssignments = assignments.filter(
    (a) => a.type === "coding_set" && (a.codingSet?.problemSlugs?.length ?? 0) > 0
  );
  const nowIso = new Date().toISOString();

  const reportRows = members.map((m) => {
    let completed = 0;
    let total = 0;
    let atRiskCount = 0;
    for (const a of codingAssignments) {
      const prog = computeCodingProgressForUser(m.userId, a, subs);
      const assignmentTotal = prog?.total ?? 0;
      const assignmentSolved = prog?.solved ?? 0;
      total += assignmentTotal;
      completed += assignmentSolved;
      const pct = assignmentTotal > 0 ? assignmentSolved / assignmentTotal : 0;
      const risk = isAtRiskRuleBased({
        nowIso,
        dueAtIso: a.dueAt,
        completionPct: pct,
        lastActivityIso: prog?.lastAt,
      });
      if (risk.atRisk) atRiskCount++;
    }
    return {
      userId: m.userId,
      joinedAt: m.joinedAt,
      completed,
      total,
      atRiskCount,
    };
  });

  const batchCompleted = reportRows.reduce((s, r) => s + r.completed, 0);
  const batchTotal = reportRows.reduce((s, r) => s + r.total, 0);
  const batchProgressPct =
    batchTotal > 0 ? Math.round((batchCompleted / batchTotal) * 100) : 0;

  return (
    <Container className="py-10">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/business-units/${batch.businessUnitId}`} className="text-sm text-muted hover:text-text">← Business unit</Link>
        <Link href={`/admin/batches/${batchId}/command`} className="text-sm text-muted hover:text-text">Command Center</Link>
      </div>
      <div className="text-xs tracking-[0.35em] text-muted">BATCH</div>
      <h1 className="text-2xl font-extrabold mt-2">{batch.name}</h1>
      <p className="text-sm text-muted mt-1">{batch.skill} · {batch.startDate} – {batch.endDate}</p>
      <p className="text-sm text-muted mt-2">
        Add students below, then create <span className="text-text">assignments</span> and handouts. Students in the batch are auto-enrolled in all batch assignments.
      </p>

      {reportRows.length > 0 && (
        <Card className="p-5 mt-6 mb-2">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-5 w-5 text-brand" />
            <h2 className="text-lg font-semibold text-text">Batch report</h2>
          </div>
          <p className="text-sm text-muted mb-4">
            Overall progress across all assignments in this batch. Click a student to see their detailed report by skill.
          </p>
          <div className="mb-4 p-3 rounded-lg bg-bg/80 border border-border">
            <span className="text-sm text-muted">Batch total: </span>
            <span className="font-medium text-text">{batchCompleted} / {batchTotal}</span>
            <span className="text-sm text-muted"> tasks completed ({batchProgressPct}%)</span>
          </div>
          <ul className="space-y-2">
            {reportRows.map((r) => (
              <li key={r.userId}>
                <Link
                  href={`/admin/students/${encodeURIComponent(r.userId)}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card/80 p-3 hover:border-brand/30 transition group"
                >
                  <span className="font-medium text-text truncate">{r.userId}</span>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-sm text-muted">
                      {r.completed}/{r.total} completed
                    </span>
                    {r.atRiskCount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400">
                        {r.atRiskCount} at-risk
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted group-hover:text-brand transition" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <AdminBatchDetailClient batchId={batchId} batchName={batch.name} />
    </Container>
  );
}
