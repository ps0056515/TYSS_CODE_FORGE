import { notFound } from "next/navigation";
import { Container, Card } from "@/components/ui";
import { getCourse, type SyllabusModule, type SyllabusLesson } from "@/lib/data";

function lessonTitle(lesson: string | SyllabusLesson): string {
  return typeof lesson === "string" ? lesson : lesson.title;
}
function lessonDescription(lesson: string | SyllabusLesson): string | undefined {
  return typeof lesson === "string" ? undefined : lesson.description;
}

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const course = getCourse(params.id);
  if (!course) return notFound();
  const syllabus = (course.syllabus ?? []) as SyllabusModule[];

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
          <h2 className="text-lg font-semibold">Table of Contents</h2>
          <p className="text-sm text-muted mt-1">A detailed breakdown of modules and lessons.</p>
          <div className="mt-6 space-y-6">
            {syllabus.length === 0 ? (
              <div className="text-sm text-muted">Syllabus coming soon.</div>
            ) : (
              syllabus.map((m, modIdx) => (
                <div key={modIdx} className="rounded-xl border border-border bg-white/5 overflow-hidden">
                  <div className="p-4 border-b border-border bg-black/10">
                    <div className="font-semibold text-text">
                      {modIdx + 1}. {m.title}
                    </div>
                    {m.description && (
                      <div className="text-sm text-muted mt-1">{m.description}</div>
                    )}
                  </div>
                  <ul className="divide-y divide-border">
                    {(m.lessons ?? []).map((lesson, lesIdx) => (
                      <li key={lesIdx} className="px-4 py-3 flex flex-col gap-0.5">
                        <span className="font-medium text-sm text-text">
                          {modIdx + 1}.{lesIdx + 1} {lessonTitle(lesson)}
                        </span>
                        {lessonDescription(lesson) && (
                          <span className="text-xs text-muted">{lessonDescription(lesson)}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
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

