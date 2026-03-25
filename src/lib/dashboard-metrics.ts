import type { Assignment } from "@/lib/assignment-platform-types";
import type { Submission } from "@/lib/submissions";
import { listAllSubmissions } from "@/lib/submissions";

export type StudentCodingProgress = {
  solved: number;
  total: number;
  lastAt?: string;
  bestBySlug: Record<string, number>;
};

export function computeCodingProgressForUser(
  userId: string,
  assignment: Assignment,
  submissions: Submission[]
): StudentCodingProgress | null {
  if (assignment.type !== "coding_set") return null;
  const slugs = assignment.codingSet?.problemSlugs ?? [];
  const slugSet = new Set(slugs);
  const total = slugs.length;
  if (!total) return { solved: 0, total: 0, bestBySlug: {} };
  const threshold = assignment.codingSet?.completionScoreThreshold ?? 100;

  const bestBySlug = new Map<string, number>();
  let lastAt: string | undefined;

  for (const s of submissions) {
    if (s.user !== userId) continue;
    if (!slugSet.has(s.problemSlug)) continue;
    const prev = bestBySlug.get(s.problemSlug) ?? -1;
    if (s.score > prev) bestBySlug.set(s.problemSlug, s.score);
    if (!lastAt || s.createdAt > lastAt) lastAt = s.createdAt;
  }

  let solved = 0;
  for (const slug of slugs) {
    const sc = bestBySlug.get(slug) ?? -1;
    if (sc >= threshold) solved++;
  }

  return {
    solved,
    total,
    lastAt,
    bestBySlug: Object.fromEntries(bestBySlug.entries()),
  };
}

export function isLate(nowIso: string, dueAtIso: string, completionPct: number) {
  return nowIso > dueAtIso && completionPct < 1;
}

export function isAtRiskRuleBased(args: {
  nowIso: string;
  dueAtIso: string;
  completionPct: number;
  lastActivityIso?: string;
}): { atRisk: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const { nowIso, dueAtIso, completionPct, lastActivityIso } = args;

  const ms = (iso: string) => new Date(iso).getTime();
  const now = ms(nowIso);
  const due = ms(dueAtIso);

  if (!lastActivityIso) reasons.push("Not started");
  else {
    const last = ms(lastActivityIso);
    const days = (now - last) / (24 * 3600 * 1000);
    if (days >= 3) reasons.push("No activity 3d");
  }

  const hoursToDue = (due - now) / (3600 * 1000);
  if (completionPct === 0 && hoursToDue <= 48 && hoursToDue > 0) reasons.push("Due soon (48h)");
  if (nowIso > dueAtIso && completionPct < 1) reasons.push("Late");

  return { atRisk: reasons.length > 0, reasons };
}

export async function loadAllSubmissionsCached() {
  // In file-based MVP this is fine; later we can add caching.
  return await listAllSubmissions();
}

