import * as fs from "node:fs/promises";
import * as path from "node:path";
import { problems as builtInProblems, type Problem } from "@/lib/data";

export type CustomProblemInput = Pick<Problem, "title" | "difficulty" | "tags" | "languages"> & {
  slug?: string;
  statement?: string;
  examples?: Problem["examples"];
};

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "custom-problems.json");

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

async function readCustom(): Promise<Problem[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as Problem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeCustom(items: Problem[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(items, null, 2), "utf8");
}

export async function listProblems(): Promise<Problem[]> {
  const custom = await readCustom();
  const bySlug = new Map<string, Problem>();
  for (const p of builtInProblems) bySlug.set(p.slug, p);
  for (const p of custom) bySlug.set(p.slug, p);
  return Array.from(bySlug.values());
}

export async function getProblemBySlug(slug: string): Promise<Problem | null> {
  const all = await listProblems();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function addProblem(input: CustomProblemInput): Promise<Problem> {
  const custom = await readCustom();
  const existingSlugs = new Set(custom.map((p) => p.slug).concat(builtInProblems.map((p) => p.slug)));

  const baseSlug = slugify(input.slug?.trim() || input.title);
  let slug = baseSlug || `problem-${Date.now()}`;
  let i = 2;
  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${i++}`;
  }

  const problem: Problem = {
    slug,
    title: input.title.trim(),
    difficulty: input.difficulty,
    tags: input.tags,
    languages: input.languages,
    statement: input.statement?.trim() || "Statement coming soon.",
    examples: input.examples ?? []
  };

  custom.push(problem);
  await writeCustom(custom);
  return problem;
}

