import { Container, Card } from "@/components/ui";
import { problems } from "@/lib/data";
import { getUser, isAdminUser } from "@/lib/auth";

export default function AdminProblemsPage() {
  const user = getUser();
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
    <Container className="py-10">
      <div>
        <div className="text-xs tracking-[0.35em] text-muted">ADMIN</div>
        <h2 className="text-2xl font-extrabold mt-2">Problems (stub)</h2>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          Add new practice problems (difficulty + allowed languages). They will appear in `/practice` for users.
        </p>
        <div className="mt-4">
          <a className="underline text-sm" href="/admin/problems/new">
            + Add practice problem
          </a>
        </div>
      </div>

      <div className="mt-8 grid gap-3">
        {problems.map((p) => (
          <Card key={p.slug} className="p-5">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="font-semibold">{p.title}</div>
                <div className="text-sm text-muted mt-1">
                  {p.slug} · {p.tags.join(" · ")}
                </div>
              </div>
              <div className="text-xs text-muted">{p.difficulty}</div>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  );
}

