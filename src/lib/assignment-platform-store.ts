import * as fs from "node:fs/promises";
import * as path from "node:path";
import type {
  Organization,
  BusinessUnit,
  Batch,
  Assignment,
  Enrolment,
  Material,
} from "./assignment-platform-types";

const DATA_DIR = path.join(process.cwd(), "data");
const ORGS_FILE = path.join(DATA_DIR, "organizations.json");
const BUS_FILE = path.join(DATA_DIR, "business-units.json");
const BATCHES_FILE = path.join(DATA_DIR, "batches.json");
const ASSIGNMENTS_FILE = path.join(DATA_DIR, "assignments.json");
const ENROLMENTS_FILE = path.join(DATA_DIR, "enrolments.json");
const MATERIALS_FILE = path.join(DATA_DIR, "materials.json");

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "item";
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

async function readJson<T>(file: string, defaultVal: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return defaultVal;
  }
}

async function writeJson<T>(file: string, data: T): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
}

// --- Organizations
export async function listOrganizations(): Promise<Organization[]> {
  const list = await readJson<Organization[]>(ORGS_FILE, []);
  return list.sort((a, b) => a.name.localeCompare(b.name));
}

export async function listAllBusinessUnits(): Promise<BusinessUnit[]> {
  const list = await readJson<BusinessUnit[]>(BUS_FILE, []);
  return list.sort((a, b) => a.name.localeCompare(b.name));
}

export async function listAllBatches(): Promise<Batch[]> {
  const list = await readJson<Batch[]>(BATCHES_FILE, []);
  return list.sort((a, b) => b.startDate.localeCompare(a.startDate));
}

export async function listAllAssignments(): Promise<Assignment[]> {
  const list = await readJson<Assignment[]>(ASSIGNMENTS_FILE, []);
  return list.sort((a, b) => a.dueAt.localeCompare(b.dueAt));
}

export async function createOrganization(input: { name: string }): Promise<Organization> {
  const list = await listOrganizations();
  const slug = slugify(input.name);
  const existing = list.find((o) => o.slug === slug);
  const baseSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug;
  const org: Organization = {
    id: newId(),
    name: input.name.trim(),
    slug: baseSlug,
    createdAt: new Date().toISOString(),
  };
  list.push(org);
  await writeJson(ORGS_FILE, list);
  return org;
}

export async function getOrganization(id: string): Promise<Organization | null> {
  const list = await listOrganizations();
  return list.find((o) => o.id === id) ?? null;
}

// --- Business Units
export async function listBusinessUnits(organizationId: string): Promise<BusinessUnit[]> {
  const list = await readJson<BusinessUnit[]>(BUS_FILE, []);
  return list
    .filter((b) => b.organizationId === organizationId)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function createBusinessUnit(input: {
  organizationId: string;
  name: string;
}): Promise<BusinessUnit> {
  const list = await readJson<BusinessUnit[]>(BUS_FILE, []);
  const slug = slugify(input.name);
  const bu: BusinessUnit = {
    id: newId(),
    organizationId: input.organizationId,
    name: input.name.trim(),
    slug,
    createdAt: new Date().toISOString(),
  };
  list.push(bu);
  await writeJson(BUS_FILE, list);
  return bu;
}

export async function getBusinessUnit(id: string): Promise<BusinessUnit | null> {
  const raw = await readJson<BusinessUnit[]>(BUS_FILE, []);
  return raw.find((b) => b.id === id) ?? null;
}

// --- Batches
export async function listBatches(businessUnitId: string): Promise<Batch[]> {
  const list = await readJson<Batch[]>(BATCHES_FILE, []);
  return list
    .filter((b) => b.businessUnitId === businessUnitId)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
}

export async function createBatch(input: {
  businessUnitId: string;
  name: string;
  skill: string;
  startDate: string;
  endDate: string;
}): Promise<Batch> {
  const list = await readJson<Batch[]>(BATCHES_FILE, []);
  const slug = slugify(input.name);
  const batch: Batch = {
    id: newId(),
    businessUnitId: input.businessUnitId,
    name: input.name.trim(),
    slug,
    skill: input.skill.trim(),
    startDate: input.startDate,
    endDate: input.endDate,
    createdAt: new Date().toISOString(),
  };
  list.push(batch);
  await writeJson(BATCHES_FILE, list);
  return batch;
}

export async function getBatch(id: string): Promise<Batch | null> {
  const raw = await readJson<Batch[]>(BATCHES_FILE, []);
  return raw.find((b) => b.id === id) ?? null;
}

// --- Assignments
export async function listAssignments(batchId: string): Promise<Assignment[]> {
  const list = await readJson<Assignment[]>(ASSIGNMENTS_FILE, []);
  return list
    .filter((a) => a.batchId === batchId)
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
}

export async function createAssignment(input: {
  batchId: string;
  title: string;
  description: string;
  dueAt: string;
  type?: Assignment["type"];
  templateRepoUrl?: string;
  codeforgeProblemId?: string;
  codingSet?: Assignment["codingSet"];
}): Promise<Assignment> {
  const list = await readJson<Assignment[]>(ASSIGNMENTS_FILE, []);
  const slug = slugify(input.title);
  const assignment: Assignment = {
    id: newId(),
    batchId: input.batchId,
    title: input.title.trim(),
    slug,
    description: input.description.trim(),
    dueAt: input.dueAt,
    type: input.type ?? "general",
    templateRepoUrl: input.templateRepoUrl?.trim() || undefined,
    codeforgeProblemId: input.codeforgeProblemId?.trim() || undefined,
    codingSet: input.codingSet,
    createdAt: new Date().toISOString(),
  };
  list.push(assignment);
  await writeJson(ASSIGNMENTS_FILE, list);
  return assignment;
}

export async function getAssignment(id: string): Promise<Assignment | null> {
  const raw = await readJson<Assignment[]>(ASSIGNMENTS_FILE, []);
  return raw.find((a) => a.id === id) ?? null;
}

export async function getAssignmentBySlug(slug: string): Promise<Assignment | null> {
  const raw = await readJson<Assignment[]>(ASSIGNMENTS_FILE, []);
  return raw.find((a) => a.slug === slug) ?? null;
}

export async function updateAssignment(
  id: string,
  patch: Partial<Pick<Assignment, "title" | "description" | "dueAt" | "type" | "codingSet" | "codeforgeProblemId" | "templateRepoUrl">>
): Promise<Assignment | null> {
  const list = await readJson<Assignment[]>(ASSIGNMENTS_FILE, []);
  const idx = list.findIndex((a) => a.id === id);
  if (idx < 0) return null;
  const curr = list[idx];
  const next: Assignment = {
    ...curr,
    ...patch,
    title: (patch.title ?? curr.title).trim(),
    description: (patch.description ?? curr.description).trim(),
    templateRepoUrl: (patch.templateRepoUrl ?? curr.templateRepoUrl)?.trim() || undefined,
    codeforgeProblemId: (patch.codeforgeProblemId ?? curr.codeforgeProblemId)?.trim() || undefined,
  };
  // keep slug stable for links
  list[idx] = next;
  await writeJson(ASSIGNMENTS_FILE, list);
  return next;
}

// --- Enrolments
export async function listEnrolments(assignmentId: string): Promise<Enrolment[]> {
  const list = await readJson<Enrolment[]>(ENROLMENTS_FILE, []);
  return list
    .filter((e) => e.assignmentId === assignmentId)
    .sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
}

export async function getEnrolment(assignmentId: string, userId: string): Promise<Enrolment | null> {
  const list = await readJson<Enrolment[]>(ENROLMENTS_FILE, []);
  return list.find((e) => e.assignmentId === assignmentId && e.userId === userId) ?? null;
}

export async function joinAssignment(assignmentId: string, userId: string): Promise<Enrolment> {
  const list = await readJson<Enrolment[]>(ENROLMENTS_FILE, []);
  const existing = list.find((e) => e.assignmentId === assignmentId && e.userId === userId);
  if (existing) return existing;
  const enrolment: Enrolment = {
    id: newId(),
    assignmentId,
    userId,
    joinedAt: new Date().toISOString(),
  };
  list.push(enrolment);
  await writeJson(ENROLMENTS_FILE, list);
  return enrolment;
}

export async function listEnrolmentsByUser(userId: string): Promise<Enrolment[]> {
  const list = await readJson<Enrolment[]>(ENROLMENTS_FILE, []);
  return list.filter((e) => e.userId === userId);
}

/** Returns assignments the user is enrolled in, with batch and enrolment info */
export async function listMyAssignments(userId: string): Promise<
  Array<{ assignment: Assignment; batch: Batch | null; enrolment: Enrolment }>
> {
  const enrolments = await listEnrolmentsByUser(userId);
  const result: Array<{ assignment: Assignment; batch: Batch | null; enrolment: Enrolment }> = [];
  const assignments = await readJson<Assignment[]>(ASSIGNMENTS_FILE, []);
  const batches = await readJson<Batch[]>(BATCHES_FILE, []);
  for (const e of enrolments) {
    const assignment = assignments.find((a) => a.id === e.assignmentId);
    if (!assignment) continue;
    const batch = batches.find((b) => b.id === assignment.batchId) ?? null;
    result.push({ assignment, batch, enrolment: e });
  }
  result.sort((a, b) => a.assignment.dueAt.localeCompare(b.assignment.dueAt));
  return result;
}

// --- Materials
export async function listMaterials(batchId: string): Promise<Material[]> {
  const list = await readJson<Material[]>(MATERIALS_FILE, []);
  return list
    .filter((m) => m.batchId === batchId)
    .sort((a, b) => a.order - b.order || (a.day ?? 0) - (b.day ?? 0));
}

export async function createMaterial(input: {
  batchId: string;
  title: string;
  type: Material["type"];
  contentOrUrl: string;
  day?: number;
  order?: number;
}): Promise<Material> {
  const list = await readJson<Material[]>(MATERIALS_FILE, []);
  const maxOrder = list.filter((m) => m.batchId === input.batchId).reduce((max, m) => Math.max(max, m.order), 0);
  const material: Material = {
    id: newId(),
    batchId: input.batchId,
    title: input.title.trim(),
    type: input.type,
    contentOrUrl: input.contentOrUrl.trim(),
    day: input.day,
    order: input.order ?? maxOrder + 1,
    createdAt: new Date().toISOString(),
  };
  list.push(material);
  await writeJson(MATERIALS_FILE, list);
  return material;
}
