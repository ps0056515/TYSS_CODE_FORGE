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

export async function appendSubmission(s: Submission) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.appendFile(FILE, JSON.stringify(s) + "\n", "utf8");
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
    return items;
  } catch {
    return [];
  }
}

export async function listAllSubmissions(): Promise<Submission[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const lines = raw.split("\n").filter(Boolean);
    const items: Submission[] = [];
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const parsed = JSON.parse(lines[i]) as Submission;
        // Backward compat
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
    return items;
  } catch {
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

