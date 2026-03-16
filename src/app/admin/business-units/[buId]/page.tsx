import { Container, Card } from "@/components/ui";
import { getUserAsync, isAdminUser } from "@/lib/auth";
import { getBusinessUnit } from "@/lib/assignment-platform-store";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminBatchesClient } from "./AdminBatchesClient";

export const dynamic = "force-dynamic";

export default async function AdminBUDetailPage({
  params,
}: {
  params: Promise<{ buId: string }>;
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
  const { buId } = await params;
  const bu = await getBusinessUnit(buId);
  if (!bu) notFound();

  return (
    <Container className="py-10">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/organizations/${bu.organizationId}`} className="text-sm text-muted hover:text-text">← Organization</Link>
      </div>
      <div className="text-xs tracking-[0.35em] text-muted">SETUP</div>
      <h1 className="text-2xl font-extrabold mt-2">{bu.name}</h1>
      <p className="text-sm text-muted mt-1">
        Step 3 of 3. Create batches under this BU. Each batch can have assignments and daily handouts.
      </p>
      <p className="text-sm text-muted mt-2">
        Tip: Set a clear <span className="text-text">Skill</span> per batch (e.g. Java, Spring, React) so learners only see the relevant assignments/assessments/handouts for that technology.
      </p>
      <AdminBatchesClient businessUnitId={buId} businessUnitName={bu.name} />
    </Container>
  );
}
