import Link from "next/link";
import { Container, Card } from "@/components/ui";
import { mcqTechnologies } from "@/lib/mcq-data";

export default function MCQPracticePage() {
  return (
    <Container className="py-10">
      <div className="mb-8">
        <div className="text-xs font-medium tracking-widest text-muted uppercase">Practice by topic</div>
        <h1 className="text-2xl md:text-3xl font-extrabold mt-2 text-text">MCQ Practice</h1>
        <p className="text-sm text-muted mt-2 max-w-2xl leading-relaxed">
          Multiple-choice questions by technology and topic. Topics and sub-topics are aligned with CodeChef (Foundation, 1★–2★, DSA). Select an option, submit, and see the solution with explanation.
        </p>
        <Link href="/practice" className="text-sm text-muted hover:text-brand mt-2 inline-block">
          ← Back to Practice
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mcqTechnologies.map((t) => (
          <Link key={t.id} href={`/practice/mcq/${t.id}`}>
            <Card className="p-6 hover:bg-white/5 transition">
              <div className="font-semibold text-text">{t.name}</div>
              <p className="mt-2 text-sm text-muted">{t.description}</p>
              <span className="mt-3 inline-block text-sm text-brand">Start practice →</span>
            </Card>
          </Link>
        ))}
      </div>
    </Container>
  );
}
