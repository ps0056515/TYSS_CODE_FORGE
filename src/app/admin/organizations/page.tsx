import { Container, Card } from "@/components/ui";
import { getUserAsync, isAdminUser } from "@/lib/auth";
import Link from "next/link";
import { AdminOrganizationsClient } from "./AdminOrganizationsClient";

export const dynamic = "force-dynamic";

export default async function AdminOrganizationsPage() {
  const user = await getUserAsync();
  const isAdmin = isAdminUser(user);

  if (!user || !isAdmin) {
    return (
      <Container className="py-10">
        <Card className="p-6">
          <div className="text-xs tracking-[0.35em] text-muted">ADMIN</div>
          <h2 className="text-2xl font-extrabold mt-2">Access restricted</h2>
          <p className="text-sm text-muted mt-2">Admins only.</p>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="text-sm text-muted hover:text-text">← Admin</Link>
      </div>
      <div className="text-xs tracking-[0.35em] text-muted">SETUP</div>
      <h1 className="text-2xl font-extrabold mt-2">Organizations</h1>
      <p className="text-sm text-muted mt-1">
        Step 1 of 3. Create an organization (e.g. a college or company), then add business units and batches.
      </p>
      <p className="text-sm text-muted mt-2">
        Final learning view is scoped by: <span className="text-text">Organization → Batch → Skill</span> (skill examples: Java, Spring, React).
      </p>

      <div className="grid md:grid-cols-3 gap-3 mt-6">
        <Card className="p-4">
          <div className="text-xs tracking-[0.35em] text-muted">STEP 1</div>
          <div className="font-semibold mt-1">Organization</div>
          <div className="text-sm text-muted mt-1">Top level like “JCRC College” or “SOGETI”.</div>
        </Card>
        <Card className="p-4 opacity-80">
          <div className="text-xs tracking-[0.35em] text-muted">STEP 2</div>
          <div className="font-semibold mt-1">Business Unit</div>
          <div className="text-sm text-muted mt-1">Subdivision like “BU India”, “CSE Dept”.</div>
        </Card>
        <Card className="p-4 opacity-80">
          <div className="text-xs tracking-[0.35em] text-muted">STEP 3</div>
          <div className="font-semibold mt-1">Batch</div>
          <div className="text-sm text-muted mt-1">Cohort like “.NET Batch 1 (40 students)”.</div>
        </Card>
      </div>

      <AdminOrganizationsClient />
    </Container>
  );
}
