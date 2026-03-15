import * as fs from "node:fs/promises";
import * as path from "node:path";

/** Per–use-case result for project submissions */
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
  score: number; // 0..100
  code: string;
  samplesPass?: boolean;
  /** "algorithm" = single-file; "project" = codebase (ZIP) assessed by use-case tests */
  submissionType?: "algorithm" | "project";
  /** For submissionType === "project": per–use-case pass/fail and optional code quality. */
  projectResult?: {
    useCaseResults: UseCaseResult[];
    codeQuality?: { score: number; summary?: string };
  };
};

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "submissions.jsonl");

/** In-memory cache for listAllSubmissions to avoid repeated file reads (slow pages). Invalidated on append. */
const ALL_SUBS_CACHE_TTL_MS = 10_000; // 10 seconds
let allSubsCache: { data: Submission[]; at: number } | null = null;

export async function appendSubmission(s: Submission) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.appendFile(FILE, JSON.stringify(s) + "\n", "utf8");
  allSubsCache = null; // so next listAllSubmissions sees the new submission
}

/** Returns the most recent submission for this user+problem (for dedupe/rate limit). */
export async function getLastSubmissionForUserProblem(
  userId: string,
  problemSlug: string
): Promise<Submission | null> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const lines = raw.split("\n").filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const parsed = JSON.parse(lines[i]) as Submission;
        if (parsed.problemSlug === problemSlug && parsed.user === userId) return parsed;
      } catch {
        // skip
      }
    }
  } catch {
    // no file
  }
  return null;
}

/** Dedupe: return submissions with consecutive duplicates (same user, problemSlug, code within 60s) collapsed to one. */
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
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const lines = raw.split("\n").filter(Boolean);
    const items: Submission[] = [];
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const parsed = JSON.parse(lines[i]) as Submission;
        if (parsed.problemSlug !== problemSlug) continue;
        if (user && parsed.user !== user) continue;
        // Backward compat: older entries used `allPass`
        const anyParsed = parsed as unknown as { allPass?: boolean; verdict?: Submission["verdict"]; score?: number };
        if (!anyParsed.verdict && typeof anyParsed.allPass === "boolean") {
          (parsed as Submission).verdict = anyParsed.allPass ? "AC" : "WA";
        }
        if (typeof anyParsed.score !== "number") {
          (parsed as Submission).score = parsed.verdict === "AC" ? 100 : 0;
        }
        items.push(parsed);
        if (items.length >= limit) break;
      } catch {
        // ignore bad lines
      }
    }
    return dedupeSubmissions(items);
  } catch {
    return [];
  }
}

function parseAllSubmissionsFromRaw(raw: string): Submission[] {
  const lines = raw.split("\n").filter(Boolean);
  const items: Submission[] = [];
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const parsed = JSON.parse(lines[i]) as Submission;
      const anyParsed = parsed as unknown as { allPass?: boolean; verdict?: Submission["verdict"]; score?: number };
      if (!anyParsed.verdict && typeof anyParsed.allPass === "boolean") {
        (parsed as Submission).verdict = anyParsed.allPass ? "AC" : "WA";
      }
      if (typeof anyParsed.score !== "number") {
        (parsed as Submission).score = parsed.verdict === "AC" ? 100 : 0;
      }
      items.push(parsed);
    } catch {
      // ignore bad lines
    }
  }
  return dedupeSubmissions(items);
}

export async function listAllSubmissions(): Promise<Submission[]> {
  const now = Date.now();
  if (allSubsCache && now - allSubsCache.at < ALL_SUBS_CACHE_TTL_MS) {
    return allSubsCache.data;
  }
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const data = parseAllSubmissionsFromRaw(raw);
    allSubsCache = { data, at: now };
    return data;
  } catch {
    allSubsCache = null;
    return [];
  }
}

/** Progress for a user: solved problem slugs and submission counts. Use in server components so auth context is shared. */
export async function getProgressForUser(userId: string): Promise<{
  solved: string[];
  counts: { ac: number; total: number };
}> {
  const all = await listAllSubmissions();
  const solved = new Set<string>();
  let total = 0;
  let ac = 0;
  for (const s of all) {
    if (s.user !== userId) continue;
    total += 1;
    const passed = s.verdict === "AC" || s.score === 100;
    if (passed) {
      ac += 1;
      solved.add(s.problemSlug);
    }
  }
  return { solved: Array.from(solved), counts: { ac, total } };
}

