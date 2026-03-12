import { notFound } from "next/navigation";
import { getProblemBySlug } from "@/lib/problems_store";
import { ProblemPageLayout } from "./ProblemPageLayout";

export default async function ProblemPage({ params }: { params: { slug: string } }) {
  const problem = await getProblemBySlug(params.slug);
  if (!problem) return notFound();

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
    />
  );
}
