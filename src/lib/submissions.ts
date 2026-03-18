import { prisma } from "./prisma";

export type UseCaseResult = {
  id: string;
  title: string;
  passed: boolean;
  message?: string;
};

export type Submission = {
  id: string;
  createdAt: string;
  problemSlug: string;
  user: string;
  language: string;
  verdict: "AC" | "PARTIAL" | "WA" | "RE" | "TLE";
  score: number;
  code: string;
  samplesPass?: boolean;
  submissionType?: "algorithm" | "project";
  projectResult?: {
    useCaseResults: UseCaseResult[];
    codeQuality?: { score: number; summary?: string };
  };
};

function mapSub(s: any): Submission {
  return {
    ...s,
    createdAt: s.createdAt.toISOString(),
    samplesPass: s.samplesPass ?? undefined,
    submissionType: s.submissionType as "algorithm" | "project" | undefined,
    projectResult: s.projectResult as object | undefined,
  };
}

export async function appendSubmission(s: Submission) {
  const data: any = {
    problemSlug: s.problemSlug,
    user: s.user,
    language: s.language,
    verdict: s.verdict,
    score: s.score,
    code: s.code,
  };
  if (s.samplesPass !== undefined) data.samplesPass = s.samplesPass;
  if (s.submissionType !== undefined) data.submissionType = s.submissionType;
  if (s.projectResult !== undefined) data.projectResult = s.projectResult as any;

  await prisma.submission.create({ data });
}

export async function getLastSubmissionForUserProblem(
  userId: string,
  problemSlug: string
): Promise<Submission | null> {
  const s = await prisma.submission.findFirst({
    where: { user: userId, problemSlug },
    orderBy: { createdAt: 'desc' }
  });
  return s ? mapSub(s) : null;
}

export function dedupeSubmissions(items: Submission[], windowMs = 60_000): Submission[] {
  const seen = new Map<string, number>();
  return items.filter((s) => {
    const key = `${s.user}:${s.problemSlug}:${(s.code ?? "").trim().slice(0, 200)}`;
    const t = new Date(s.createdAt).getTime();
    const last = seen.get(key);
    if (last != null && t - last < windowMs) return false;
    seen.set(key, t);
    return true;
  });
}

export async function listSubmissions(problemSlug: string, limit = 25, user?: string | null): Promise<Submission[]> {
  const where: any = { problemSlug };
  if (user) where.user = user;
  
  const raw = await prisma.submission.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit * 2 // fetch extra in case dedupe removes some
  });
  
  const items = raw.map(mapSub);
  const deduplicated = dedupeSubmissions(items);
  return deduplicated.slice(0, limit);
}

export async function listAllSubmissions(): Promise<Submission[]> {
  const raw = await prisma.submission.findMany({ orderBy: { createdAt: 'desc' } });
  return dedupeSubmissions(raw.map(mapSub));
}

export async function getProgressForUser(userId: string): Promise<{
  solved: string[];
  counts: { ac: number; total: number };
}> {
  const all = await prisma.submission.findMany({ where: { user: userId } });
  const solved = new Set<string>();
  let total = 0;
  let ac = 0;
  for (const s of all) {
    total += 1;
    const passed = s.verdict === "AC" || s.score === 100;
    if (passed) {
      ac += 1;
      solved.add(s.problemSlug);
    }
  }
  return { solved: Array.from(solved), counts: { ac, total } };
}
