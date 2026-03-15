import { Suspense } from "react";
import { Container, Card } from "@/components/ui";
import { getUserAsync, isAdminUser } from "@/lib/auth";
import { AdminProblemsClient } from "./AdminProblemsClient";

export default async function AdminProblemsPage() {
  const user = await getUserAsync();
  const isAdmin = isAdminUser(user);

  if (!user || !isAdmin) {
    return (
      <Container className="py-10">
        <Card className="p-6">
          <div className="text-xs tracking-[0.35em] text-muted">ADMIN</div>
          <h2 className="text-2xl font-extrabold mt-2">Access restricted</h2>
          <p className="text-sm text-muted mt-2 max-w-2xl">
            This page is only for admins. Please sign in with an admin account.
          </p>
        </Card>
      </Container>
    );
  }

  return (
    <Suspense fallback={<Container className="py-10"><p className="text-muted">Loading…</p></Container>}>
      <AdminProblemsClient />
    </Suspense>
  );
}
