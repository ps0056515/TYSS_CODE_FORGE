import * as fs from "node:fs/promises";
import * as path from "node:path";

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

