import { Container } from "@/components/ui";
import { getAssignment, getBatch, getEnrolment } from "@/lib/assignment-platform-store";
import { getUserAsync } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JoinAssignmentClient } from "./JoinAssignmentClient";

export default async function JoinAssignmentPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  const assignment = await getAssignment(assignmentId);
  if (!assignment) notFound();
  const batch = await getBatch(assignment.batchId);
  const user = await getUserAsync();
  let alreadyEnrolled = false;
  if (user) {
    const enrolment = await getEnrolment(assignmentId, user);
    alreadyEnrolled = !!enrolment;
  }

  return (
    <Container className="py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-extrabold">{assignment.title}</h1>
        {batch && <p className="text-sm text-muted mt-1">Batch: {batch.name} · {batch.skill}</p>}
        <p className="text-sm text-muted mt-2">Due: {new Date(assignment.dueAt).toLocaleString()}</p>
        {(assignment.startAt || assignment.endAt) && (
          <p className="text-sm text-muted mt-1">
            Available: {assignment.startAt ? new Date(assignment.startAt).toLocaleString() : "now"} – {assignment.endAt ? new Date(assignment.endAt).toLocaleString() : new Date(assignment.dueAt).toLocaleString()}
          </p>
        )}
        {assignment.description && (
          <div className="mt-4 p-4 rounded-lg bg-card/80 border border-border prose prose-sm max-w-none">
            {assignment.description}
          </div>
        )}
        <JoinAssignmentClient
          assignmentId={assignmentId}
          alreadyEnrolled={alreadyEnrolled}
          signedIn={!!user}
        />
      </div>
    </Container>
  );
}
