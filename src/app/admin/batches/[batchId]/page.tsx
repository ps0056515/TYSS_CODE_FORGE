import { Container } from "@/components/ui";
import { getUserAsync, isAdminUser } from "@/lib/auth";
import { getBatch } from "@/lib/assignment-platform-store";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminBatchDetailClient } from "./AdminBatchDetailClient";

export default async function AdminBatchDetailPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const user = await getUserAsync();
  const isAdmin = isAdminUser(user);
  if (!user || !isAdmin) {
    return (
      <Container className="py-10">
        <p className="text-muted">Access restricted.</p>
      </Container>
    );
  }
  const { batchId } = await params;
  const batch = await getBatch(batchId);
  if (!batch) notFound();

  return (
    <Container className="py-10">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/business-units/${batch.businessUnitId}`} className="text-sm text-muted hover:text-text">← Business unit</Link>
        <Link href={`/admin/batches/${batchId}/command`} className="text-sm text-muted hover:text-text">Command Center</Link>
      </div>
      <div className="text-xs tracking-[0.35em] text-muted">BATCH</div>
      <h1 className="text-2xl font-extrabold mt-2">{batch.name}</h1>
      <p className="text-sm text-muted mt-1">{batch.skill} · {batch.startDate} – {batch.endDate}</p>
      <p className="text-sm text-muted mt-2">
        Next: add <span className="text-text">assignments</span> and share invite links with students. You can also add daily handouts/materials.
      </p>
      <AdminBatchDetailClient batchId={batchId} batchName={batch.name} />
    </Container>
  );
}
