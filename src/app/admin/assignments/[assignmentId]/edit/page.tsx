import { Container, Card } from "@/components/ui";
import { getUserAsync, isAdminUser } from "@/lib/auth";
import { getAssignment, getBatch } from "@/lib/assignment-platform-store";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminAssignmentEditClient } from "./AdminAssignmentEditClient";

export default async function AdminAssignmentEditPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const user = await getUserAsync();
  const isAdmin = isAdminUser(user);
  if (!user || !isAdmin) {
    return (
      <Container className="py-10">
        <Card className="p-6">
          <div className="text-xs tracking-[0.35em] text-muted">ADMIN</div>
          <h2 className="text-2xl font-extrabold mt-2">Access restricted</h2>
        </Card>
      </Container>
    );
  }

  const { assignmentId } = await params;
  const assignment = await getAssignment(assignmentId);
  if (!assignment) notFound();
  const batch = await getBatch(assignment.batchId);

  return (
    <Container className="py-10">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/batches/${assignment.batchId}`} className="text-sm text-muted hover:text-text">
          ← Batch
        </Link>
        <Link href={`/admin/assignments/${assignmentId}/dashboard`} className="text-sm text-muted hover:text-text">
          Dashboard
        </Link>
      </div>
      <div className="text-xs tracking-[0.35em] text-muted">ASSIGNMENT</div>
      <h1 className="text-2xl font-extrabold mt-2">{assignment.title}</h1>
      {batch && <p className="text-sm text-muted mt-1">{batch.name} · Due {new Date(assignment.dueAt).toLocaleString()}</p>}
      <AdminAssignmentEditClient assignmentId={assignmentId} />
    </Container>
  );
}

