import * as fs from "node:fs/promises";
import * as path from "node:path";
import { problems as builtInProblems, type Problem, type UseCase, type RunConfig } from "@/lib/data";

export type CustomProblemInput = Pick<Problem, "title" | "difficulty" | "tags" | "languages"> & {
  slug?: string;
  statement?: string;
  examples?: Problem["examples"];
  type?: Problem["type"];
  useCases?: UseCase[];
  runConfig?: RunConfig;
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
    examples: input.examples ?? [],
    type: input.type ?? "algorithm",
    useCases: input.useCases ?? undefined,
    runConfig: input.runConfig ?? undefined
  };

  custom.push(problem);
  await writeCustom(custom);
  return problem;
}

/** Add multiple problems in one go (e.g. bulk add by topic). Returns created problems and any per-item errors. */
export async function addProblemsBulk(inputs: CustomProblemInput[]): Promise<{
  created: Problem[];
  errors: { index: number; message: string }[];
}> {
  const created: Problem[] = [];
  const errors: { index: number; message: string }[] = [];
  let custom = await readCustom();
  const existingSlugs = new Set(custom.map((p) => p.slug).concat(builtInProblems.map((p) => p.slug)));

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    if (!input.title?.trim()) {
      errors.push({ index: i, message: "Empty title" });
      continue;
    }
    const baseSlug = slugify(input.slug?.trim() || input.title);
    let slug = baseSlug || `problem-${Date.now()}-${i}`;
    let n = 2;
    while (existingSlugs.has(slug)) {
      slug = `${baseSlug}-${n++}`;
    }
    existingSlugs.add(slug);

    const problem: Problem = {
      slug,
      title: input.title.trim(),
      difficulty: input.difficulty,
      tags: input.tags ?? [],
      languages: input.languages ?? ["javascript", "python"],
      statement: input.statement?.trim() || "Statement coming soon.",
      examples: input.examples ?? [],
      type: input.type ?? "algorithm",
      useCases: input.useCases ?? undefined,
      runConfig: input.runConfig ?? undefined,
    };
    custom.push(problem);
    created.push(problem);
  }

  if (created.length > 0) await writeCustom(custom);
  return { created, errors };
}

/** Whether a problem is custom (editable/deletable). Built-in problems are read-only. */
export async function isCustomProblem(slug: string): Promise<boolean> {
  const custom = await readCustom();
  return custom.some((p) => p.slug === slug);
}

/** Slugs of all custom (editable) problems. */
export async function listCustomSlugs(): Promise<string[]> {
  const custom = await readCustom();
  return custom.map((p) => p.slug);
}

export async function updateProblem(
  slug: string,
  patch: Partial<CustomProblemInput> & { statement?: string; examples?: Problem["examples"] }
): Promise<Problem | null> {
  const custom = await readCustom();
  const idx = custom.findIndex((p) => p.slug === slug);
  if (idx < 0) return null;
  const existing = custom[idx];
  const updated: Problem = {
    ...existing,
    title: patch.title ?? existing.title,
    difficulty: patch.difficulty ?? existing.difficulty,
    tags: patch.tags ?? existing.tags,
    languages: patch.languages ?? existing.languages,
    statement: (patch.statement !== undefined ? patch.statement : existing.statement) ?? "Statement coming soon.",
    examples: patch.examples ?? existing.examples,
    type: patch.type ?? existing.type,
    useCases: patch.useCases !== undefined ? patch.useCases : existing.useCases,
    runConfig: patch.runConfig !== undefined ? patch.runConfig : existing.runConfig,
  };
  custom[idx] = updated;
  await writeCustom(custom);
  return updated;
}

export async function deleteProblem(slug: string): Promise<boolean> {
  const custom = await readCustom();
  const filtered = custom.filter((p) => p.slug !== slug);
  if (filtered.length === custom.length) return false;
  await writeCustom(filtered);
  return true;
}

