import * as fs from "node:fs/promises";
import * as path from "node:path";
import type {
  Organization,
  BusinessUnit,
  Batch,
  Assignment,
  Enrolment,
  Material,
  BatchMembership,
} from "./assignment-platform-types";

const DATA_DIR = path.join(process.cwd(), "data");
const ORGS_FILE = path.join(DATA_DIR, "organizations.json");
const BUS_FILE = path.join(DATA_DIR, "business-units.json");
const BATCHES_FILE = path.join(DATA_DIR, "batches.json");
const BATCH_MEMBERS_FILE = path.join(DATA_DIR, "batch-members.json");
const ASSIGNMENTS_FILE = path.join(DATA_DIR, "assignments.json");
const ENROLMENTS_FILE = path.join(DATA_DIR, "enrolments.json");
const MATERIALS_FILE = path.join(DATA_DIR, "materials.json");

const ENROLMENTS_CACHE_TTL_MS = 8_000;
let enrolmentsCache: { list: Enrolment[]; at: number } | null = null;

async function readEnrolments(): Promise<Enrolment[]> {
  const now = Date.now();
  if (enrolmentsCache && now - enrolmentsCache.at < ENROLMENTS_CACHE_TTL_MS) {
    return enrolmentsCache.list;
  }
  const list = await readJson<Enrolment[]>(ENROLMENTS_FILE, []);
  enrolmentsCache = { list, at: now };
  return list;
}

function invalidateEnrolmentsCache() {
  enrolmentsCache = null;
}

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

export async function updateOrganization(id: string, patch: { name: string }): Promise<Organization | null> {
  const list = await listOrganizations();
  const idx = list.findIndex((o) => o.id === id);
  if (idx < 0) return null;
  const name = patch.name.trim();
  const slug = slugify(name);
  const existing = list.find((o) => o.slug === slug && o.id !== id);
  list[idx] = { ...list[idx], name, slug: existing ? `${slug}-${Date.now().toString(36)}` : slug };
  await writeJson(ORGS_FILE, list);
  return list[idx];
}

/** Delete an organization only if it contains no business units. */
export async function deleteOrganization(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const bus = await readJson<BusinessUnit[]>(BUS_FILE, []);
  if (bus.some((b) => b.organizationId === id)) {
    return { ok: false, error: "Cannot delete: organization has business units." };
  }
  const orgs = await listOrganizations();
  const filtered = orgs.filter((o) => o.id !== id);
  if (filtered.length === orgs.length) return { ok: false, error: "Not found" };
  await writeJson(ORGS_FILE, filtered);
  return { ok: true };
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

export async function updateBusinessUnit(id: string, patch: { name: string }): Promise<BusinessUnit | null> {
  const list = await readJson<BusinessUnit[]>(BUS_FILE, []);
  const idx = list.findIndex((b) => b.id === id);
  if (idx < 0) return null;
  list[idx] = { ...list[idx], name: patch.name.trim(), slug: slugify(patch.name.trim()) };
  await writeJson(BUS_FILE, list);
  return list[idx];
}

/** Delete a business unit only if it contains no batches. */
export async function deleteBusinessUnit(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const batches = await readJson<Batch[]>(BATCHES_FILE, []);
  if (batches.some((b) => b.businessUnitId === id)) {
    return { ok: false, error: "Cannot delete: business unit has batches." };
  }
  const list = await readJson<BusinessUnit[]>(BUS_FILE, []);
  const filtered = list.filter((b) => b.id !== id);
  if (filtered.length === list.length) return { ok: false, error: "Not found" };
  await writeJson(BUS_FILE, filtered);
  return { ok: true };
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

export async function updateBatch(
  id: string,
  patch: Partial<Pick<Batch, "name" | "skill" | "startDate" | "endDate">>
): Promise<Batch | null> {
  const list = await readJson<Batch[]>(BATCHES_FILE, []);
  const idx = list.findIndex((b) => b.id === id);
  if (idx < 0) return null;
  const curr = list[idx];
  const name = patch.name !== undefined ? patch.name.trim() : curr.name;
  list[idx] = {
    ...curr,
    name: patch.name !== undefined ? patch.name.trim() : curr.name,
    slug: patch.name !== undefined ? slugify(patch.name.trim()) : curr.slug,
    skill: patch.skill !== undefined ? patch.skill.trim() : curr.skill,
    startDate: patch.startDate ?? curr.startDate,
    endDate: patch.endDate ?? curr.endDate,
  };
  await writeJson(BATCHES_FILE, list);
  return list[idx];
}

/** Delete a batch only if it contains no assignments, materials, or enrolled students. */
export async function deleteBatch(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const assignments = await readJson<Assignment[]>(ASSIGNMENTS_FILE, []);
  if (assignments.some((a) => a.batchId === id)) {
    return { ok: false, error: "Cannot delete: batch has assignments/assessments." };
  }
  const materials = await readJson<Material[]>(MATERIALS_FILE, []);
  if (materials.some((m) => m.batchId === id)) {
    return { ok: false, error: "Cannot delete: batch has materials." };
  }
  const members = await readJson<BatchMembership[]>(BATCH_MEMBERS_FILE, []);
  if (members.some((m) => m.batchId === id)) {
    return { ok: false, error: "Cannot delete: batch has enrolled students." };
  }

  const batches = await readJson<Batch[]>(BATCHES_FILE, []);
  const filtered = batches.filter((b) => b.id !== id);
  if (filtered.length === batches.length) return { ok: false, error: "Not found" };
  await writeJson(BATCHES_FILE, filtered);
  return { ok: true };
}

// --- Batch members (enrollment at batch level; members inherit access to batch assignments)
async function readBatchMembers(): Promise<BatchMembership[]> {
  const list = await readJson<BatchMembership[]>(BATCH_MEMBERS_FILE, []);
  return list;
}

export async function listBatchMembers(batchId: string): Promise<BatchMembership[]> {
  const list = await readBatchMembers();
  return list.filter((m) => m.batchId === batchId);
}

export async function listBatchesForUser(userId: string): Promise<Batch[]> {
  const list = await readBatchMembers();
  const batchIds = [...new Set(list.filter((m) => m.userId === userId).map((m) => m.batchId))];
  const batches = await readJson<Batch[]>(BATCHES_FILE, []);
  return batches.filter((b) => batchIds.includes(b.id));
}

export async function addBatchMember(batchId: string, userId: string): Promise<BatchMembership> {
  const list = await readBatchMembers();
  const existing = list.find((m) => m.batchId === batchId && m.userId === userId);
  if (existing) return existing;
  const membership: BatchMembership = {
    id: newId(),
    batchId,
    userId,
    joinedAt: new Date().toISOString(),
  };
  list.push(membership);
  await writeJson(BATCH_MEMBERS_FILE, list);

  // Auto-enrol in all assignments in this batch so they appear in "My assignments"
  const assignments = await listAssignments(batchId);
  for (const a of assignments) {
    const enrolments = await readEnrolments();
    if (!enrolments.some((e) => e.assignmentId === a.id && e.userId === userId)) {
      await joinAssignment(a.id, userId);
    }
  }
  return membership;
}

export async function removeBatchMember(batchId: string, userId: string): Promise<boolean> {
  const list = await readBatchMembers();
  const idx = list.findIndex((m) => m.batchId === batchId && m.userId === userId);
  if (idx < 0) return false;
  list.splice(idx, 1);
  await writeJson(BATCH_MEMBERS_FILE, list);

  // Remove enrolments for this batch's assignments so they no longer see them
  const assignments = await listAssignments(batchId);
  for (const a of assignments) {
    await removeEnrolment(a.id, userId);
  }
  return true;
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
  kind?: Assignment["kind"];
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
    kind: input.kind ?? "assignment",
    dueAt: input.dueAt,
    type: input.type ?? "general",
    templateRepoUrl: input.templateRepoUrl?.trim() || undefined,
    codeforgeProblemId: input.codeforgeProblemId?.trim() || undefined,
    codingSet: input.codingSet,
    createdAt: new Date().toISOString(),
  };
  list.push(assignment);
  await writeJson(ASSIGNMENTS_FILE, list);

  // Auto-enrol all batch members so they see the new assignment
  const members = await listBatchMembers(input.batchId);
  for (const m of members) {
    await joinAssignment(assignment.id, m.userId);
  }
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
  patch: Partial<Pick<Assignment, "title" | "description" | "kind" | "dueAt" | "startAt" | "endAt" | "type" | "codingSet" | "codeforgeProblemId" | "templateRepoUrl" | "projectInstructions">>
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
    kind: patch.kind ?? curr.kind ?? "assignment",
    templateRepoUrl: (patch.templateRepoUrl ?? curr.templateRepoUrl)?.trim() || undefined,
    startAt: patch.startAt !== undefined ? (patch.startAt || undefined) : curr.startAt,
    endAt: patch.endAt !== undefined ? (patch.endAt || undefined) : curr.endAt,
    codeforgeProblemId: (patch.codeforgeProblemId ?? curr.codeforgeProblemId)?.trim() || undefined,
    projectInstructions: patch.projectInstructions !== undefined ? patch.projectInstructions : curr.projectInstructions,
  };
  // keep slug stable for links
  list[idx] = next;
  await writeJson(ASSIGNMENTS_FILE, list);
  return next;
}

/** Delete an assignment only if it contains no enrolled students. */
export async function deleteAssignment(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const enrolments = await readEnrolments();
  if (enrolments.some((e) => e.assignmentId === id)) {
    return { ok: false, error: "Cannot delete: assignment has enrolled students." };
  }
  const list = await readJson<Assignment[]>(ASSIGNMENTS_FILE, []);
  const filtered = list.filter((a) => a.id !== id);
  if (filtered.length === list.length) return { ok: false, error: "Not found" };
  await writeJson(ASSIGNMENTS_FILE, filtered);
  return { ok: true };
}

// --- Enrolments
export async function listEnrolments(assignmentId: string): Promise<Enrolment[]> {
  const list = await readEnrolments();
  return list
    .filter((e) => e.assignmentId === assignmentId)
    .sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
}

export async function getEnrolment(assignmentId: string, userId: string): Promise<Enrolment | null> {
  const list = await readEnrolments();
  return list.find((e) => e.assignmentId === assignmentId && e.userId === userId) ?? null;
}

export async function joinAssignment(assignmentId: string, userId: string, repoUrl?: string): Promise<Enrolment> {
  invalidateEnrolmentsCache();
  const list = await readJson<Enrolment[]>(ENROLMENTS_FILE, []);
  const existing = list.find((e) => e.assignmentId === assignmentId && e.userId === userId);
  if (existing) {
    if (repoUrl && repoUrl.trim()) {
      existing.repoUrl = repoUrl.trim();
      await writeJson(ENROLMENTS_FILE, list);
      invalidateEnrolmentsCache();
    }
    return existing;
  }
  const enrolment: Enrolment = {
    id: newId(),
    assignmentId,
    userId,
    repoUrl: repoUrl?.trim() || undefined,
    joinedAt: new Date().toISOString(),
  };
  list.push(enrolment);
  await writeJson(ENROLMENTS_FILE, list);
  invalidateEnrolmentsCache();
  return enrolment;
}

export async function removeEnrolment(assignmentId: string, userId: string): Promise<boolean> {
  invalidateEnrolmentsCache();
  const list = await readJson<Enrolment[]>(ENROLMENTS_FILE, []);
  const idx = list.findIndex((e) => e.assignmentId === assignmentId && e.userId === userId);
  if (idx < 0) return false;
  list.splice(idx, 1);
  await writeJson(ENROLMENTS_FILE, list);
  invalidateEnrolmentsCache();
  return true;
}

export async function listEnrolmentsByUser(userId: string): Promise<Enrolment[]> {
  const list = await readEnrolments();
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
