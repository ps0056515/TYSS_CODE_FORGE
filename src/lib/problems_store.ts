import { prisma } from "./prisma";
import { problems as builtInProblems, type Problem, type UseCase, type RunConfig } from "@/lib/data";

export type CustomProblemInput = Pick<Problem, "title" | "difficulty" | "tags" | "languages"> & {
  slug?: string;
  statement?: string;
  examples?: Problem["examples"];
  type?: Problem["type"];
  useCases?: UseCase[];
  runConfig?: RunConfig;
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "").slice(0, 60);
}

export async function listProblems(): Promise<Problem[]> {
  const custom = await prisma.customProblem.findMany();
  const transformed: Problem[] = custom.map(c => ({
    ...c,
    difficulty: c.difficulty as "Easy" | "Medium" | "Hard",
    type: c.type as "algorithm" | "project",
    examples: c.examples as Problem["examples"],
    useCases: (c.useCases as UseCase[] | null) ?? undefined,
    runConfig: (c.runConfig as RunConfig | null) ?? undefined,
  }));
  
  const bySlug = new Map<string, Problem>();
  for (const p of builtInProblems) bySlug.set(p.slug, p);
  for (const p of transformed) bySlug.set(p.slug, p);
  return Array.from(bySlug.values());
}

export async function getProblemBySlug(slug: string): Promise<Problem | null> {
  const all = await listProblems();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function addProblem(input: CustomProblemInput): Promise<Problem> {
  const all = await listProblems();
  const existingSlugs = new Set(all.map((p) => p.slug));

  const baseSlug = slugify(input.slug?.trim() || input.title);
  let slug = baseSlug || `problem-${Date.now()}`;
  let i = 2;
  while (existingSlugs.has(slug)) slug = `${baseSlug}-${i++}`;

  const cp = await prisma.customProblem.create({
    data: {
      slug,
      title: input.title.trim(),
      difficulty: input.difficulty,
      tags: input.tags,
      languages: input.languages,
      statement: input.statement?.trim() || "Statement coming soon.",
      examples: input.examples ?? [],
      type: input.type ?? "algorithm",
      useCases: input.useCases ?? null,
      runConfig: input.runConfig ?? null
    }
  });
  
  return {
    ...cp,
    difficulty: cp.difficulty as "Easy" | "Medium" | "Hard",
    type: cp.type as "algorithm" | "project",
    examples: cp.examples as Problem["examples"],
    useCases: (cp.useCases as UseCase[] | null) ?? undefined,
    runConfig: (cp.runConfig as RunConfig | null) ?? undefined,
  };
}

export async function addProblemsBulk(inputs: CustomProblemInput[]) {
  const created: Problem[] = [];
  const errors: { index: number; message: string }[] = [];
  
  let all = await listProblems();
  const existingSlugs = new Set(all.map((p) => p.slug));

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    if (!input.title?.trim()) { errors.push({ index: i, message: "Empty title" }); continue; }
    const baseSlug = slugify(input.slug?.trim() || input.title);
    let slug = baseSlug || `problem-${Date.now()}-${i}`;
    let n = 2;
    while (existingSlugs.has(slug)) slug = `${baseSlug}-${n++}`;
    existingSlugs.add(slug);

    const cp = await prisma.customProblem.create({
      data: {
        slug,
        title: input.title.trim(),
        difficulty: input.difficulty,
        tags: input.tags ?? [],
        languages: input.languages ?? ["javascript", "python"],
        statement: input.statement?.trim() || "Statement coming soon.",
        examples: input.examples ?? [],
        type: input.type ?? "algorithm",
        useCases: input.useCases ?? null,
        runConfig: input.runConfig ?? null,
      }
    });
    
    created.push({
      ...cp,
      difficulty: cp.difficulty as "Easy" | "Medium" | "Hard",
      type: cp.type as "algorithm" | "project",
      examples: cp.examples as Problem["examples"],
      useCases: (cp.useCases as UseCase[] | null) ?? undefined,
      runConfig: (cp.runConfig as RunConfig | null) ?? undefined,
    });
  }
  return { created, errors };
}

export async function isCustomProblem(slug: string): Promise<boolean> {
  return (await prisma.customProblem.count({ where: { slug } })) > 0;
}

export async function listCustomSlugs(): Promise<string[]> {
  const custom = await prisma.customProblem.findMany({ select: { slug: true } });
  return custom.map((p) => p.slug);
}

export async function updateProblem(
  slug: string,
  patch: Partial<CustomProblemInput> & { statement?: string; examples?: Problem["examples"] }
): Promise<Problem | null> {
  const data: any = { ...patch };
  if (patch.useCases !== undefined) data.useCases = patch.useCases;
  if (patch.runConfig !== undefined) data.runConfig = patch.runConfig;
  try {
    const cp = await prisma.customProblem.update({ where: { slug }, data });
    return {
      ...cp,
      difficulty: cp.difficulty as "Easy" | "Medium" | "Hard",
      type: cp.type as "algorithm" | "project",
      examples: cp.examples as Problem["examples"],
      useCases: (cp.useCases as UseCase[] | null) ?? undefined,
      runConfig: (cp.runConfig as RunConfig | null) ?? undefined,
    };
  } catch {
    return null;
  }
}

export async function deleteProblem(slug: string): Promise<boolean> {
  try {
    await prisma.customProblem.delete({ where: { slug } });
    return true;
  } catch {
    return false;
  }
}
