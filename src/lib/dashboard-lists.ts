import type { Assignment } from "@/lib/assignment-platform-types";
import type { Submission } from "@/lib/submissions";
import { listEnrolments } from "@/lib/assignment-platform-store";
import { isAtRiskRuleBased } from "@/lib/dashboard-metrics";

export type ActiveLearnerRow = {
  userId: string;
  lastActivity: string;
  submissionCount: number;
};

export type OverdueStudentRow = {
  userId: string;
  assignmentId: string;
  assignmentTitle: string;
  dueAt: string;
  solved: number;
  total: number;
};

export type AtRiskStudentRow = {
  userId: string;
  assignmentId: string;
  assignmentTitle: string;
  reasons: string[];
  solved: number;
  total: number;
  lastAt: string | undefined;
};

/** Unique users with at least one submission since the given timestamp, with last activity and count. */
export function getActiveLearnersList(
  subs: Submission[],
  sinceMs: number
): ActiveLearnerRow[] {
  const byUser = new Map<string, { lastAt: string; count: number }>();
  for (const s of subs) {
    const t = new Date(s.createdAt).getTime();
    if (t < sinceMs) continue;
    const curr = byUser.get(s.user);
    const lastAt = !curr || s.createdAt > curr.lastAt ? s.createdAt : curr.lastAt;
    const count = (curr?.count ?? 0) + 1;
    byUser.set(s.user, { lastAt, count });
  }
  return Array.from(byUser.entries())
    .map(([userId, { lastAt, count }]) => ({ userId, lastActivity: lastAt, submissionCount: count }))
    .sort((a, b) => b.lastActivity.localeCompare(a.lastActivity));
}

/** Students who are past due on an assignment and have not completed it. */
export async function getOverdueStudentsList(
  assignments: Assignment[],
  subs: Submission[]
): Promise<OverdueStudentRow[]> {
  const nowIso = new Date().toISOString();
  const rows: OverdueStudentRow[] = [];
  for (const a of assignments) {
    if (a.type !== "coding_set" || !(a.codingSet?.problemSlugs?.length)) continue;
    if (nowIso <= a.dueAt) continue;
    const slugs = a.codingSet.problemSlugs;
    const threshold = a.codingSet.completionScoreThreshold ?? 100;
    const enrolments = await listEnrolments(a.id);
    for (const e of enrolments) {
      const best = new Map<string, number>();
      for (const s of subs) {
        if (s.user !== e.userId || !slugs.includes(s.problemSlug)) continue;
        const prev = best.get(s.problemSlug) ?? -1;
        if (s.score > prev) best.set(s.problemSlug, s.score);
      }
      let solved = 0;
      for (const slug of slugs) {
        if ((best.get(slug) ?? -1) >= threshold) solved++;
      }
      if (solved < slugs.length) {
        rows.push({
          userId: e.userId,
          assignmentId: a.id,
          assignmentTitle: a.title,
          dueAt: a.dueAt,
          solved,
          total: slugs.length,
        });
      }
    }
  }
  return rows.sort((a, b) => a.dueAt.localeCompare(b.dueAt));
}

/** Students flagged as at-risk (no activity 3d, due soon, late). */
export async function getAtRiskStudentsList(
  assignments: Assignment[],
  subs: Submission[]
): Promise<AtRiskStudentRow[]> {
  const nowIso = new Date().toISOString();
  const rows: AtRiskStudentRow[] = [];
  for (const a of assignments) {
    if (a.type !== "coding_set" || !(a.codingSet?.problemSlugs?.length)) continue;
    const slugs = a.codingSet.problemSlugs;
    const threshold = a.codingSet.completionScoreThreshold ?? 100;
    const enrolments = await listEnrolments(a.id);
    for (const e of enrolments) {
      const best = new Map<string, number>();
      let lastAt: string | undefined;
      for (const s of subs) {
        if (s.user !== e.userId || !slugs.includes(s.problemSlug)) continue;
        const prev = best.get(s.problemSlug) ?? -1;
        if (s.score > prev) best.set(s.problemSlug, s.score);
        if (!lastAt || s.createdAt > lastAt) lastAt = s.createdAt;
      }
      let solved = 0;
      for (const slug of slugs) {
        if ((best.get(slug) ?? -1) >= threshold) solved++;
      }
      const completionPct = slugs.length ? solved / slugs.length : 0;
      const risk = isAtRiskRuleBased({
        nowIso,
        dueAtIso: a.dueAt,
        completionPct,
        lastActivityIso: lastAt,
      });
      if (risk.atRisk) {
        rows.push({
          userId: e.userId,
          assignmentId: a.id,
          assignmentTitle: a.title,
          reasons: risk.reasons,
          solved,
          total: slugs.length,
          lastAt,
        });
      }
    }
  }
  return rows.sort((a, b) => (a.lastAt ?? "").localeCompare(b.lastAt ?? ""));
}
