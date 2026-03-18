import { prisma } from "./prisma";
import { problems as builtInProblems, type Problem, type UseCase, type RunConfig } from "./data";

export type CustomProblemInput = Pick<Problem, "title" | "difficulty" | "tags" | "languages"> & {
  slug?: string;
  statement?: string;
  examples?: Problem["examples"];
  hiddenTests?: Problem["hiddenTests"];
  type?: Problem["type"];
  useCases?: UseCase[];
  runConfig?: RunConfig;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

export async function listProblems(): Promise<Problem[]> {
  const customPrisma = await prisma.customProblem.findMany();
  const custom: Problem[] = customPrisma.map(p => ({
    ...p,
    difficulty: p.difficulty as Problem["difficulty"],
    languages: p.languages as Problem["languages"],
    examples: p.examples as Problem["examples"],
    hiddenTests: (p.hiddenTests as Problem["hiddenTests"]) ?? undefined,
    type: p.type as Problem["type"],
    useCases: (p.useCases as UseCase[]) ?? undefined,
    runConfig: (p.runConfig as RunConfig) ?? undefined,
  }));

  const bySlug = new Map<string, Problem>();
  for (const p of builtInProblems) bySlug.set(p.slug, p);
  for (const p of custom) bySlug.set(p.slug, p);
  return Array.from(bySlug.values());
}

export async function getProblemBySlug(slug: string): Promise<Problem | null> {
  // Check custom first (more likely to be what the admin is looking for)
  const p = await prisma.customProblem.findUnique({ where: { slug } });
  if (p) {
    return {
      ...p,
      difficulty: p.difficulty as Problem["difficulty"],
      languages: p.languages as Problem["languages"],
      examples: p.examples as Problem["examples"],
      hiddenTests: (p.hiddenTests as Problem["hiddenTests"]) ?? undefined,
      type: p.type as Problem["type"],
      useCases: (p.useCases as UseCase[]) ?? undefined,
      runConfig: (p.runConfig as RunConfig) ?? undefined,
    };
  }
  return builtInProblems.find(bp => bp.slug === slug) ?? null;
}

export async function addProblem(input: CustomProblemInput): Promise<Problem> {
  const baseSlug = slugify(input.slug?.trim() || input.title);
  let slug = baseSlug || `problem-${Date.now()}`;
  
  // Ensure global uniqueness (built-in + custom)
  const existing = await getProblemBySlug(slug);
  if (existing) {
    let i = 2;
    while (await getProblemBySlug(`${baseSlug}-${i}`)) {
      i++;
    }
    slug = `${baseSlug}-${i}`;
  }

  const p = await prisma.customProblem.create({
    data: {
      slug,
      title: input.title.trim(),
      difficulty: input.difficulty,
      tags: input.tags,
      languages: input.languages,
      statement: input.statement?.trim() || "Statement coming soon.",
      examples: (input.examples ?? []) as any,
      hiddenTests: (input.hiddenTests ?? []) as any,
      type: input.type ?? "algorithm",
      useCases: (input.useCases ?? []) as any,
      runConfig: (input.runConfig ?? {}) as any,
    }
  });

  return {
    ...p,
    difficulty: p.difficulty as Problem["difficulty"],
    languages: p.languages as Problem["languages"],
    examples: p.examples as Problem["examples"],
    hiddenTests: (p.hiddenTests as Problem["hiddenTests"]) ?? undefined,
    type: p.type as Problem["type"],
    useCases: (p.useCases as UseCase[]) ?? undefined,
    runConfig: (p.runConfig as RunConfig) ?? undefined,
  };
}

export async function updateProblem(
  slug: string,
  patch: Partial<CustomProblemInput>
): Promise<Problem | null> {
  try {
    const data: any = { ...patch };
    if (patch.title) data.title = patch.title.trim();
    if (patch.statement) data.statement = patch.statement.trim();
    
    // Cast Json fields if present
    if (patch.examples) data.examples = patch.examples as any;
    if (patch.hiddenTests) data.hiddenTests = patch.hiddenTests as any;
    if (patch.useCases) data.useCases = patch.useCases as any;
    if (patch.runConfig) data.runConfig = patch.runConfig as any;

    const p = await prisma.customProblem.update({
      where: { slug },
      data
    });

    return {
      ...p,
      difficulty: p.difficulty as Problem["difficulty"],
      languages: p.languages as Problem["languages"],
      examples: p.examples as Problem["examples"],
      hiddenTests: (p.hiddenTests as Problem["hiddenTests"]) ?? undefined,
      type: p.type as Problem["type"],
      useCases: (p.useCases as UseCase[]) ?? undefined,
      runConfig: (p.runConfig as RunConfig) ?? undefined,
    };
  } catch {
    return null;
  }
}

export async function addProblemsBulk(inputs: CustomProblemInput[]): Promise<{ created: Problem[]; errors: string[] }> {
  const custom = await prisma.customProblem.findMany({ select: { slug: true } });
  const existingSlugs = new Set([...builtInProblems.map(p => p.slug), ...custom.map(p => p.slug)]);
  
  const finalToAdd: any[] = [];
  const errors: string[] = [];
  
  for (const i of inputs) {
    let slug = slugify(i.slug?.trim() || i.title);
    if (!slug) {
      errors.push(`Invalid title/slug for: ${i.title}`);
      continue;
    }
    
    if (existingSlugs.has(slug)) {
      errors.push(`Slug already exists: ${slug}`);
      continue;
    }

    finalToAdd.push({
      slug,
      title: i.title.trim(),
      difficulty: i.difficulty,
      tags: i.tags,
      languages: i.languages,
      statement: i.statement?.trim() || "Statement coming soon.",
      examples: (i.examples ?? []) as any,
      hiddenTests: (i.hiddenTests ?? []) as any,
      type: i.type ?? "algorithm",
      useCases: (i.useCases ?? []) as any,
      runConfig: (i.runConfig ?? {}) as any,
    });
    existingSlugs.add(slug);
  }

  const created: Problem[] = [];
  if (finalToAdd.length > 0) {
    // createMany does not return the created records in some Prisma versions/connectors
    // But we need to return them. We can use create for each if we want the full object back,
    // or just return the data we sent (since we generated the slugs).
    await prisma.customProblem.createMany({ data: finalToAdd });
    
    // Convert back to Problem type
    for (const data of finalToAdd) {
      created.push({
        ...data,
        createdAt: new Date().toISOString(), // Approximation if not fetched
        id: "temp-id", // Same
        difficulty: data.difficulty as Problem["difficulty"],
        languages: data.languages as Problem["languages"],
        examples: data.examples as Problem["examples"],
        hiddenTests: data.hiddenTests as Problem["hiddenTests"],
        type: data.type as Problem["type"],
      });
    }
  }

  return { created, errors };
}

export async function deleteProblem(slug: string): Promise<boolean> {
  try {
    await prisma.customProblem.delete({ where: { slug } });
    return true;
  } catch {
    return false;
  }
}

export async function isCustomProblem(slug: string): Promise<boolean> {
  const p = await prisma.customProblem.findUnique({ where: { slug } });
  return !!p;
}

export async function listCustomSlugs(): Promise<string[]> {
  const all = await prisma.customProblem.findMany({ select: { slug: true } });
  return all.map(p => p.slug);
}