import { prisma } from "./prisma";
import type {
  Organization,
  BusinessUnit,
  Batch,
  Assignment,
  Enrolment,
  Material,
} from "./assignment-platform-types";

function formatDate(d: Date | null | undefined): string {
  return d ? d.toISOString() : new Date().toISOString();
}

// --- Organizations
export async function listOrganizations(): Promise<Organization[]> {
  const orgs = await prisma.organization.findMany({ orderBy: { name: 'asc' } });
  return orgs.map(o => ({ ...o, createdAt: formatDate(o.createdAt) }));
}

export async function listAllBusinessUnits(): Promise<BusinessUnit[]> {
  const bus = await prisma.businessUnit.findMany({ orderBy: { name: 'asc' } });
  return bus.map(b => ({ ...b, createdAt: formatDate(b.createdAt) }));
}

export async function listAllBatches(): Promise<Batch[]> {
  const batches = await prisma.batch.findMany({ orderBy: { startDate: 'desc' } });
  return batches.map(b => ({
    ...b,
    startDate: formatDate(b.startDate),
    endDate: formatDate(b.endDate),
    createdAt: formatDate(b.createdAt),
  }));
}

export async function listAllAssignments(): Promise<Assignment[]> {
  const assignments = await prisma.assignment.findMany({ orderBy: { dueAt: 'asc' } });
  return assignments.map(a => ({
    ...a,
    dueAt: formatDate(a.dueAt),
    startAt: formatDate(a.startAt),
    endAt: formatDate(a.endAt),
    createdAt: formatDate(a.createdAt),
    codingSet: a.codingSet as Assignment["codingSet"] | undefined,
  }));
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '') || "item";
}

export async function createOrganization(input: { name: string }): Promise<Organization> {
  const baseSlug = slugify(input.name);
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.organization.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }
  const org = await prisma.organization.create({
    data: { name: input.name.trim(), slug }
  });
  return { ...org, createdAt: formatDate(org.createdAt) };
}

export async function getOrganization(id: string): Promise<Organization | null> {
  const org = await prisma.organization.findUnique({ where: { id } });
  return org ? { ...org, createdAt: formatDate(org.createdAt) } : null;
}

export async function updateOrganization(id: string, patch: { name: string }): Promise<Organization | null> {
  try {
    const org = await prisma.organization.update({
      where: { id },
      data: { name: patch.name.trim() }
    });
    return { ...org, createdAt: formatDate(org.createdAt) };
  } catch {
    return null; // Record not found
  }
}

// --- Business Units
export async function listBusinessUnits(organizationId: string): Promise<BusinessUnit[]> {
  const list = await prisma.businessUnit.findMany({
    where: { organizationId },
    orderBy: { name: 'asc' }
  });
  return list.map(b => ({ ...b, createdAt: formatDate(b.createdAt) }));
}

export async function createBusinessUnit(input: { organizationId: string; name: string; }): Promise<BusinessUnit> {
  const slug = slugify(input.name);
  const bu = await prisma.businessUnit.create({
    data: { organizationId: input.organizationId, name: input.name.trim(), slug }
  });
  return { ...bu, createdAt: formatDate(bu.createdAt) };
}

export async function getBusinessUnit(id: string): Promise<BusinessUnit | null> {
  const bu = await prisma.businessUnit.findUnique({ where: { id } });
  return bu ? { ...bu, createdAt: formatDate(bu.createdAt) } : null;
}

export async function updateBusinessUnit(id: string, patch: { name: string }): Promise<BusinessUnit | null> {
  try {
    const bu = await prisma.businessUnit.update({
      where: { id },
      data: { name: patch.name.trim(), slug: slugify(patch.name.trim()) }
    });
    return { ...bu, createdAt: formatDate(bu.createdAt) };
  } catch {
    return null;
  }
}

// --- Batches
export async function listBatches(businessUnitId: string): Promise<Batch[]> {
  const list = await prisma.batch.findMany({
    where: { businessUnitId },
    orderBy: { startDate: 'desc' }
  });
  return list.map(b => ({
    ...b,
    startDate: formatDate(b.startDate),
    endDate: formatDate(b.endDate),
    createdAt: formatDate(b.createdAt)
  }));
}

export async function createBatch(input: {
  businessUnitId: string;
  name: string;
  skill: string;
  startDate: string;
  endDate: string;
}): Promise<Batch> {
  const slug = slugify(input.name);
  const batch = await prisma.batch.create({
    data: {
      businessUnitId: input.businessUnitId,
      name: input.name.trim(),
      slug,
      skill: input.skill.trim(),
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate)
    }
  });
  return {
    ...batch,
    startDate: formatDate(batch.startDate),
    endDate: formatDate(batch.endDate),
    createdAt: formatDate(batch.createdAt)
  };
}

export async function getBatch(id: string): Promise<Batch | null> {
  const b = await prisma.batch.findUnique({ where: { id } });
  return b ? {
    ...b,
    startDate: formatDate(b.startDate),
    endDate: formatDate(b.endDate),
    createdAt: formatDate(b.createdAt)
  } : null;
}

export async function updateBatch(
  id: string,
  patch: Partial<Pick<Batch, "name" | "skill" | "startDate" | "endDate">>
): Promise<Batch | null> {
  const data: any = {};
  if (patch.name !== undefined) {
    data.name = patch.name.trim();
    data.slug = slugify(patch.name.trim());
  }
  if (patch.skill !== undefined) data.skill = patch.skill.trim();
  if (patch.startDate !== undefined) data.startDate = new Date(patch.startDate);
  if (patch.endDate !== undefined) data.endDate = new Date(patch.endDate);

  try {
    const b = await prisma.batch.update({ where: { id }, data });
    return {
      ...b,
      startDate: formatDate(b.startDate),
      endDate: formatDate(b.endDate),
      createdAt: formatDate(b.createdAt)
    };
  } catch {
    return null;
  }
}

// --- Assignments
export async function listAssignments(batchId: string): Promise<Assignment[]> {
  const list = await prisma.assignment.findMany({
    where: { batchId },
    orderBy: { dueAt: 'asc' }
  });
  return list.map(a => ({
    ...a,
    dueAt: formatDate(a.dueAt),
    startAt: formatDate(a.startAt),
    endAt: formatDate(a.endAt),
    createdAt: formatDate(a.createdAt),
    codingSet: a.codingSet as Assignment["codingSet"] | undefined,
  }));
}

export async function createAssignment(input: {
  batchId: string;
  title: string;
  description: string;
  dueAt: string;
  kind?: Assignment["kind"];
  type?: Assignment["type"];
  templateRepoUrl?: string;
  codeforgeProblemId?: string;
  codingSet?: Assignment["codingSet"];
}): Promise<Assignment> {
  const baseSlug = slugify(input.title);
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.assignment.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }
  
  const a = await prisma.assignment.create({
    data: {
      batchId: input.batchId,
      title: input.title.trim(),
      slug,
      description: input.description.trim(),
      kind: input.kind ?? "assignment",
      type: input.type ?? "general",
      dueAt: new Date(input.dueAt),
      templateRepoUrl: input.templateRepoUrl?.trim() || null,
      codeforgeProblemId: input.codeforgeProblemId?.trim() || null,
      codingSet: input.codingSet as object,
    }
  });

  return {
    ...a,
    templateRepoUrl: a.templateRepoUrl ?? undefined,
    codeforgeProblemId: a.codeforgeProblemId ?? undefined,
    dueAt: formatDate(a.dueAt),
    startAt: formatDate(a.startAt),
    endAt: formatDate(a.endAt),
    createdAt: formatDate(a.createdAt),
    codingSet: a.codingSet as Assignment["codingSet"] | undefined,
  };
}

export async function getAssignment(id: string): Promise<Assignment | null> {
  const a = await prisma.assignment.findUnique({ where: { id } });
  return a ? {
    ...a,
    templateRepoUrl: a.templateRepoUrl ?? undefined,
    codeforgeProblemId: a.codeforgeProblemId ?? undefined,
    dueAt: formatDate(a.dueAt),
    startAt: formatDate(a.startAt),
    endAt: formatDate(a.endAt),
    createdAt: formatDate(a.createdAt),
    codingSet: a.codingSet as Assignment["codingSet"] | undefined,
    projectInstructions: a.projectInstructions ?? undefined,
  } : null;
}

export async function getAssignmentBySlug(slug: string): Promise<Assignment | null> {
  const a = await prisma.assignment.findUnique({ where: { slug } });
  return a ? {
    ...a,
    templateRepoUrl: a.templateRepoUrl ?? undefined,
    codeforgeProblemId: a.codeforgeProblemId ?? undefined,
    dueAt: formatDate(a.dueAt),
    startAt: formatDate(a.startAt),
    endAt: formatDate(a.endAt),
    createdAt: formatDate(a.createdAt),
    codingSet: a.codingSet as Assignment["codingSet"] | undefined,
    projectInstructions: a.projectInstructions ?? undefined,
  } : null;
}

export async function updateAssignment(
  id: string,
  patch: Partial<Pick<Assignment, "title" | "description" | "kind" | "dueAt" | "startAt" | "endAt" | "type" | "codingSet" | "codeforgeProblemId" | "templateRepoUrl" | "projectInstructions">>
): Promise<Assignment | null> {
  const data: any = { ...patch };
  if (patch.title !== undefined) data.title = patch.title.trim();
  if (patch.description !== undefined) data.description = patch.description.trim();
  if (patch.dueAt !== undefined) data.dueAt = new Date(patch.dueAt);
  if (patch.startAt !== undefined) data.startAt = patch.startAt ? new Date(patch.startAt) : null;
  if (patch.endAt !== undefined) data.endAt = patch.endAt ? new Date(patch.endAt) : null;
  if (data.codingSet !== undefined) data.codingSet = data.codingSet as any;

  try {
    const a = await prisma.assignment.update({ where: { id }, data });
    return {
      ...a,
      templateRepoUrl: a.templateRepoUrl ?? undefined,
      codeforgeProblemId: a.codeforgeProblemId ?? undefined,
      dueAt: formatDate(a.dueAt),
      startAt: formatDate(a.startAt),
      endAt: formatDate(a.endAt),
      createdAt: formatDate(a.createdAt),
      codingSet: a.codingSet as Assignment["codingSet"] | undefined,
      projectInstructions: a.projectInstructions ?? undefined,
    };
  } catch {
    return null;
  }
}

// --- Enrolments
export async function listEnrolments(assignmentId: string): Promise<Enrolment[]> {
  const list = await prisma.enrolment.findMany({
    where: { assignmentId },
    orderBy: { joinedAt: 'asc' }
  });
  return list.map(e => ({
    ...e,
    repoUrl: e.repoUrl ?? undefined,
    joinedAt: formatDate(e.joinedAt)
  }));
}

export async function getEnrolment(assignmentId: string, userId: string): Promise<Enrolment | null> {
  const e = await prisma.enrolment.findUnique({
    where: { assignmentId_userId: { assignmentId, userId } }
  });
  return e ? { ...e, repoUrl: e.repoUrl ?? undefined, joinedAt: formatDate(e.joinedAt) } : null;
}

export async function joinAssignment(assignmentId: string, userId: string, repoUrl?: string): Promise<Enrolment> {
  const e = await prisma.enrolment.upsert({
    where: { assignmentId_userId: { assignmentId, userId } },
    update: repoUrl ? { repoUrl: repoUrl.trim() } : {},
    create: { assignmentId, userId, repoUrl: repoUrl?.trim() || null }
  });
  return { ...e, repoUrl: e.repoUrl ?? undefined, joinedAt: formatDate(e.joinedAt) };
}

export async function removeEnrolment(assignmentId: string, userId: string): Promise<boolean> {
  try {
    await prisma.enrolment.delete({
      where: { assignmentId_userId: { assignmentId, userId } }
    });
    return true;
  } catch {
    return false;
  }
}

export async function listEnrolmentsByUser(userId: string): Promise<Enrolment[]> {
  const list = await prisma.enrolment.findMany({ where: { userId } });
  return list.map(e => ({ ...e, repoUrl: e.repoUrl ?? undefined, joinedAt: formatDate(e.joinedAt) }));
}

export async function listMyAssignments(userId: string): Promise<
  Array<{ assignment: Assignment; batch: Batch | null; enrolment: Enrolment }>
> {
  const list = await prisma.enrolment.findMany({
    where: { userId },
    include: {
      assignment: { include: { batch: true } }
    }
  });

  const result = list.map(e => {
    const a = e.assignment;
    const b = a.batch;
    return {
      enrolment: { ...e, assignment: undefined, repoUrl: e.repoUrl ?? undefined, joinedAt: formatDate(e.joinedAt) },
      assignment: {
        ...a,
        batch: undefined,
        templateRepoUrl: a.templateRepoUrl ?? undefined,
        codeforgeProblemId: a.codeforgeProblemId ?? undefined,
        dueAt: formatDate(a.dueAt),
        startAt: formatDate(a.startAt),
        endAt: formatDate(a.endAt),
        createdAt: formatDate(a.createdAt),
        codingSet: a.codingSet as Assignment["codingSet"] | undefined,
        projectInstructions: a.projectInstructions ?? undefined,
      },
      batch: b ? {
        ...b,
        startDate: formatDate(b.startDate),
        endDate: formatDate(b.endDate),
        createdAt: formatDate(b.createdAt)
      } : null
    };
  });

  // @ts-ignore
  return result.sort((x, y) => x.assignment.dueAt.localeCompare(y.assignment.dueAt));
}

// --- Materials
export async function listMaterials(batchId: string): Promise<Material[]> {
  const list = await prisma.material.findMany({
    where: { batchId },
    orderBy: [{ order: 'asc' }, { day: 'asc' }]
  });
  return list.map(m => ({ ...m, day: m.day ?? undefined, type: m.type as Material["type"], createdAt: formatDate(m.createdAt) }));
}

export async function createMaterial(input: {
  batchId: string;
  title: string;
  type: Material["type"];
  contentOrUrl: string;
  day?: number;
  order?: number;
}): Promise<Material> {
  const maxM = await prisma.material.findFirst({
    where: { batchId: input.batchId },
    orderBy: { order: 'desc' }
  });
  const m = await prisma.material.create({
    data: {
      batchId: input.batchId,
      title: input.title.trim(),
      type: input.type,
      contentOrUrl: input.contentOrUrl.trim(),
      day: input.day || null,
      order: input.order ?? ((maxM?.order || 0) + 1)
    }
  });
  return { ...m, day: m.day ?? undefined, type: m.type as Material["type"], createdAt: formatDate(m.createdAt) };
}
