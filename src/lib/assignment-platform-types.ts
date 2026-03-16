/**
 * Assignment platform types (file-based storage, no PostgreSQL).
 * Hierarchy: Organization → Business Unit → Batch → Assignments / Materials
 */

export type Organization = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
};

export type BusinessUnit = {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  createdAt: string;
};

export type Batch = {
  id: string;
  businessUnitId: string;
  name: string;
  slug: string;
  skill: string; // e.g. ".NET", "Python Robot Framework", "Java", "TypeScript Playwright"
  startDate: string; // ISO date
  endDate: string;
  createdAt: string;
};

export type AssignmentType = "general" | "coding_set" | "project_usecase";

export type CodingSetFilters = {
  tags?: string[];
  difficulties?: Array<"Easy" | "Medium" | "Hard">;
  languages?: Array<"javascript" | "python" | "java" | "cpp">;
  count?: number;
};

export type CodingSetConfig = {
  /** Instructor-selected filters used to generate a suggested list */
  filters?: CodingSetFilters;
  /** Final curated list of problem slugs students must solve */
  problemSlugs: string[];
  /** If set, treat as solved when best score >= threshold (default 100) */
  completionScoreThreshold?: number;
};

export type Assignment = {
  id: string;
  batchId: string;
  title: string;
  slug: string;
  description: string;
  /** Whether this is an assignment or an assessment (shown under different tabs). Default: assignment */
  kind?: "assignment" | "assessment";
  dueAt: string; // ISO datetime
  /** Optional: when the assignment becomes available (default: immediately) */
  startAt?: string; // ISO datetime
  /** Optional: when the assignment closes (default: use dueAt) */
  endAt?: string; // ISO datetime
  type?: AssignmentType;
  templateRepoUrl?: string;
  /** For type === "coding_set": configuration */
  codingSet?: CodingSetConfig;
  /** For type === "project_usecase": optional link to a project problem slug */
  codeforgeProblemId?: string;
  /** For type === "project_usecase": detailed instructions for candidates */
  projectInstructions?: string;
  createdAt: string;
};

export type Enrolment = {
  id: string;
  assignmentId: string;
  userId: string; // email or cf_user
  repoUrl?: string;
  joinedAt: string;
};

export type MaterialType = "handout" | "ref" | "link";

export type Material = {
  id: string;
  batchId: string;
  title: string;
  type: MaterialType;
  contentOrUrl: string; // URL for link, markdown/text for handout/ref
  day?: number; // optional day index for "daily" handouts
  order: number;
  createdAt: string;
};
