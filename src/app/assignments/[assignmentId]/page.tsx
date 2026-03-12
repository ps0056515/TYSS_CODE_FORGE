import { Container, Card } from "@/components/ui";
import { getAssignment, getBatch, getEnrolment, listMaterials } from "@/lib/assignment-platform-store";
import { getUserAsync } from "@/lib/auth";
import { listAllSubmissions } from "@/lib/submissions";
import { getProblemBySlug } from "@/lib/problems_store";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const user = await getUserAsync();
  const { assignmentId } = await params;
  const assignment = await getAssignment(assignmentId);
  if (!assignment) notFound();
  const [batch, enrolment, materials] = await Promise.all([
    getBatch(assignment.batchId),
    user ? getEnrolment(assignmentId, user) : null,
    listMaterials(assignment.batchId),
  ]);

  if (user && !enrolment) {
    return (
      <Container className="py-10">
        <p className="text-muted">You haven’t joined this assignment yet.</p>
        <Link href={`/join/${assignmentId}`} className="inline-block mt-2 text-brand hover:underline">Join assignment →</Link>
      </Container>
    );
  }
  if (!user) {
    return (
      <Container className="py-10">
        <p className="text-muted">Sign in to view this assignment.</p>
        <Link href={`/login?callbackUrl=${encodeURIComponent(`/assignments/${assignmentId}`)}`} className="inline-block mt-2 text-brand hover:underline">Sign in →</Link>
      </Container>
    );
  }

  const codingSlugs = assignment.type === "coding_set" ? (assignment.codingSet?.problemSlugs ?? []) : [];
  const threshold = assignment.codingSet?.completionScoreThreshold ?? 100;
  const subs = codingSlugs.length ? (await listAllSubmissions()).filter((s) => s.user === user && codingSlugs.includes(s.problemSlug)) : [];
  const bestBySlug = new Map<string, number>();
  for (const s of subs) {
    const prev = bestBySlug.get(s.problemSlug) ?? -1;
    if (s.score > prev) bestBySlug.set(s.problemSlug, s.score);
  }

  return (
    <Container className="py-10">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/assignments" className="text-sm text-muted hover:text-text">← My assignments</Link>
      </div>
      <h1 className="text-2xl font-extrabold">{assignment.title}</h1>
      {batch && <p className="text-sm text-muted mt-1">{batch.name} · {batch.skill}</p>}
      <p className="text-sm text-muted mt-1">Due: {new Date(assignment.dueAt).toLocaleString()}</p>
      {assignment.description && (
        <div className="mt-4 p-4 rounded-lg bg-card/80 border border-border">
          <h3 className="text-sm font-semibold mb-2">Instructions</h3>
          <div className="text-sm whitespace-pre-wrap">{assignment.description}</div>
        </div>
      )}

      {assignment.type === "coding_set" && codingSlugs.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Coding tasks</h2>
          <p className="text-sm text-muted mb-3">
            Solve these problems in CodeForge. Completed when your best score is ≥ {threshold}.
          </p>
          <div className="grid gap-2">
            {await Promise.all(
              codingSlugs.map(async (slug) => {
                const p = await getProblemBySlug(slug);
                const best = bestBySlug.get(slug) ?? null;
                const done = typeof best === "number" && best >= threshold;
                return (
                  <Card key={slug} className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{p?.title ?? slug}</div>
                        <div className="text-xs text-muted mt-1">{slug}{p?.difficulty ? ` · ${p.difficulty}` : ""}</div>
                      </div>
                      <div className="shrink-0 flex items-center gap-3">
                        <span className={done ? "text-xs font-semibold text-green-600" : "text-xs text-muted"}>
                          {done ? "Completed" : best != null ? `Best ${best}` : "Not started"}
                        </span>
                        <Link href={`/practice/${slug}`} className="text-xs text-brand hover:underline">
                          Open →
                        </Link>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </section>
      )}

      {enrolment?.repoUrl && (
        <Card className="p-4 mt-6 max-w-md">
          <a href={enrolment.repoUrl} target="_blank" rel="noopener noreferrer" className="text-brand font-medium hover:underline">
            Open your repository →
          </a>
        </Card>
      )}
      {materials.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Handouts & materials</h2>
          <ul className="space-y-2">
            {materials.map((m) => (
              <li key={m.id} className="rounded-lg border border-border bg-card/80 p-3">
                <span className="font-medium">{m.title}</span>
                <span className="text-muted text-sm ml-2">({m.type})</span>
                {m.day != null && <span className="text-muted text-sm ml-2">Day {m.day}</span>}
                {m.type === "link" ? (
                  <a href={m.contentOrUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-brand text-sm hover:underline">Open link</a>
                ) : (
                  <p className="text-sm text-muted mt-1">{m.contentOrUrl}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      {assignment.codeforgeProblemId && (
        <Card className="p-4 mt-6 max-w-md">
          <Link href={`/practice/${assignment.codeforgeProblemId}`} className="text-brand font-medium hover:underline">
            Practice this in CodeForge →
          </Link>
        </Card>
      )}
    </Container>
  );
}
