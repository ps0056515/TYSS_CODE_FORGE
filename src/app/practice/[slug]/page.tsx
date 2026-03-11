import { notFound } from "next/navigation";
import { Container, Card } from "@/components/ui";
import { getProblemBySlug } from "@/lib/problems_store";
import { ProblemClient } from "./ProblemClient";

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
    <Container className="py-10">
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <Card className="p-6">
          <div className="text-xs tracking-[0.35em] text-muted">PROBLEM</div>
          <h1 className="text-2xl font-extrabold mt-2">{problem.title}</h1>
          <div className="text-sm text-muted mt-3 leading-relaxed">{problem.statement}</div>

          <div className="mt-6">
            <div className="text-sm font-semibold">Examples</div>
            <div className="mt-3 grid gap-3">
              {problem.examples.map((ex, i) => (
                <div key={i} className="rounded-xl border border-border bg-white/5 p-4">
                  <div className="text-xs text-muted">Input</div>
                  <pre className="mt-1 text-sm whitespace-pre-wrap">{ex.input}</pre>
                  <div className="text-xs text-muted mt-3">Output</div>
                  <pre className="mt-1 text-sm whitespace-pre-wrap">{ex.output}</pre>
                  {ex.explanation ? <div className="text-xs text-muted mt-3">{ex.explanation}</div> : null}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <a
              href={`/leaderboard/${problem.slug}`}
              className="text-sm text-muted underline hover:text-text transition"
            >
              View leaderboard →
            </a>
          </div>
          <ProblemClient starter={starter} title={problem.title} problemSlug={problem.slug} />
        </div>
      </div>
    </Container>
  );
}

