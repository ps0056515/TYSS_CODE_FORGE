import { Container, Card } from "@/components/ui";
import { getUserAsync, isAdminUser } from "@/lib/auth";
import { getOrganization } from "@/lib/assignment-platform-store";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminBusinessUnitsClient } from "./AdminBusinessUnitsClient";

export default async function AdminOrgDetailPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
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
  const { orgId } = await params;
  const org = await getOrganization(orgId);
  if (!org) notFound();

  return (
    <Container className="py-10">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/organizations" className="text-sm text-muted hover:text-text">← Organizations</Link>
      </div>
      <div className="text-xs tracking-[0.35em] text-muted">SETUP</div>
      <h1 className="text-2xl font-extrabold mt-2">{org.name}</h1>
      <p className="text-sm text-muted mt-1">
        Step 2 of 3. Add business units (BU) under this organization, then create batches inside each BU.
      </p>
      <p className="text-sm text-muted mt-2">
        Hierarchy: <span className="text-text">Organization → Batch → Skill</span>. Skills (e.g. Java, Spring, React) live on batches and scope assignments/assessments/handouts.
      </p>
      <AdminBusinessUnitsClient organizationId={orgId} organizationName={org.name} />
    </Container>
  );
}
