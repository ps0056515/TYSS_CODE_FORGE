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
    <Container className="py-8 md:py-10">
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <Card className="p-6 lg:p-7">
          <div className="text-xs font-medium tracking-widest text-muted uppercase">Problem</div>
          <h1 className="text-xl md:text-2xl font-extrabold mt-2 text-text">{problem.title}</h1>
          <div className="text-sm text-muted mt-4 leading-relaxed prose prose-invert prose-sm max-w-none">{problem.statement}</div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="text-sm font-semibold text-text">Examples</div>
            <div className="mt-3 grid gap-3">
              {problem.examples.map((ex, i) => (
                <div key={i} className="rounded-xl border border-border bg-white/5 p-4 font-mono text-sm">
                  <div className="text-xs text-muted font-sans uppercase">Input</div>
                  <pre className="mt-1 text-sm whitespace-pre-wrap text-text break-words">{ex.input}</pre>
                  <div className="text-xs text-muted font-sans uppercase mt-3">Output</div>
                  <pre className="mt-1 text-sm whitespace-pre-wrap text-text break-words">{ex.output}</pre>
                  {ex.explanation ? <div className="text-xs text-muted mt-3 font-sans">{ex.explanation}</div> : null}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid gap-4">
          <div className="flex items-center justify-end">
            <a
              href={`/leaderboard/${problem.slug}`}
              className="text-sm text-muted hover:text-brand transition"
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

