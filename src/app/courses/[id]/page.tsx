import { notFound } from "next/navigation";
import { Container, Card } from "@/components/ui";
import { getCourse } from "@/lib/data";

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const course = getCourse(params.id);
  if (!course) return notFound();

  return (
    <Container className="py-10">
      <div>
        <div className="text-xs tracking-[0.35em] text-muted">COURSE</div>
        <h1 className="text-3xl font-extrabold mt-2">{course.title}</h1>
        <p className="text-sm text-muted mt-2 max-w-2xl">{course.tagline}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted">
          <span className="rounded-full border border-border bg-white/5 px-3 py-1">{course.level}</span>
          <span className="rounded-full border border-border bg-white/5 px-3 py-1">{course.modules} modules</span>
          <span className="rounded-full border border-border bg-white/5 px-3 py-1">{course.learners} learners</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-8">
        <Card className="p-6 lg:col-span-2">
          <div className="text-sm font-semibold">Syllabus</div>
          <div className="mt-4 grid gap-3">
            {(course.syllabus ?? []).map((m, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-white/5 p-4">
                <div className="font-semibold">{m.title}</div>
                <div className="text-sm text-muted mt-2">{m.lessons.join(" · ")}</div>
              </div>
            ))}
            {(course.syllabus ?? []).length === 0 ? (
              <div className="text-sm text-muted">Syllabus coming soon.</div>
            ) : null}
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm font-semibold">Roadmap (placeholder)</div>
          <div className="text-sm text-muted mt-2">
            Next: progress tracking, quizzes, certificates, and course projects.
          </div>
          <div className="mt-4 grid gap-2">
            {["Start", "Learn", "Practice", "Project", "Checkpoint"].map((s) => (
              <div key={s} className="rounded-xl border border-border bg-black/20 p-3 text-sm">
                {s}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Container>
  );
}

