import { notFound } from "next/navigation";
import { getProblemBySlug } from "@/lib/problems_store";
import { getAssignment } from "@/lib/assignment-platform-store";
import { ProblemPageLayout } from "./ProblemPageLayout";

export default async function ProblemPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ assignmentId?: string; problemIndex?: string }>;
}) {
  const { slug } = await params;
  const problem = await getProblemBySlug(slug);
  if (!problem) return notFound();

  const sp = await searchParams;
  const assignmentId = sp?.assignmentId;
  const parsedIndex = sp?.problemIndex != null ? parseInt(sp.problemIndex, 10) : NaN;
  const problemIndex = Number.isFinite(parsedIndex) ? parsedIndex : undefined;
  let problemSlugs: string[] | null = null;
  if (assignmentId) {
    const assignment = await getAssignment(assignmentId);
    if (assignment?.type === "coding_set") problemSlugs = assignment.codingSet?.problemSlugs ?? [];
  }

  const starter = `// ${problem.title}
// Write your solution here.

function solve(input) {
  // TODO
  return "";
}

console.log(solve(require("fs").readFileSync(0, "utf8").trim()));
`;

  return (
    <ProblemPageLayout
      problem={problem}
      starter={starter}
      assignmentId={assignmentId}
      problemSlugs={problemSlugs ?? undefined}
      problemIndex={problemIndex}
    />
  );
}
