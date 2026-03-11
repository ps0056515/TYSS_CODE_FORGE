import { Container, Card } from "@/components/ui";
import { courses } from "@/lib/data";
import Link from "next/link";

export default function CoursesPage() {
  return (
    <Container className="py-10">
      <div className="flex items-end justify-between gap-6">
        <div>
          <div className="text-xs font-medium tracking-widest text-muted uppercase">Courses</div>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-2 text-text">Catalogue</h1>
          <p className="text-sm text-muted mt-2 max-w-2xl leading-relaxed">
            Structured learning paths with practice. This is an MVP dataset; next we can connect this to your org’s
            content, progress tracking, and certificates.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-8">
        {courses.map((c) => (
          <Link key={c.id} href={`/courses/${c.id}`}>
            <Card className="p-6 hover:bg-white/5 transition">
              <div className="text-xs text-muted">{c.level}</div>
              <div className="mt-2 text-lg font-semibold">{c.title}</div>
              <div className="mt-2 text-sm text-muted">{c.tagline}</div>
              <div className="mt-5 flex items-center justify-between text-sm">
                <div className="text-muted">{c.modules} modules</div>
                <div className="text-muted">{c.learners} learners</div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </Container>
  );
}

