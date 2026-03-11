import { Container, Card } from "@/components/ui";
import { courses } from "@/lib/data";

export default function AdminCoursesPage() {
  return (
    <Container className="py-10">
      <div>
        <div className="text-xs tracking-[0.35em] text-muted">ADMIN</div>
        <h2 className="text-2xl font-extrabold mt-2">Courses (stub)</h2>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          Currently courses are defined in code (`src/lib/data.ts`). Next: connect CMS/DB for editing.
        </p>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-4">
        {courses.map((c) => (
          <Card key={c.id} className="p-6">
            <div className="text-xs text-muted">{c.level}</div>
            <div className="mt-2 text-lg font-semibold">{c.title}</div>
            <div className="mt-2 text-sm text-muted">{c.tagline}</div>
          </Card>
        ))}
      </div>
    </Container>
  );
}

