import { Container, Card } from "@/components/ui";
import { getUser, isAdminUser } from "@/lib/auth";

export default function AdminPage() {
  const user = getUser();
  const isAdmin = isAdminUser(user);

  if (!user || !isAdmin) {
    return (
      <Container className="py-10">
        <Card className="p-6">
          <div className="text-xs tracking-[0.35em] text-muted">ADMIN</div>
          <h2 className="text-2xl font-extrabold mt-2">Access restricted</h2>
          <p className="text-sm text-muted mt-2 max-w-2xl">
            This area is for admins only. Please sign in with an admin account or contact your instructor.
          </p>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <div>
        <div className="text-xs tracking-[0.35em] text-muted">ADMIN</div>
        <h2 className="text-2xl font-extrabold mt-2">Admin console (stub)</h2>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          MVP placeholder. Next: create/edit problems & courses, manage contests, moderate submissions.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <Card className="p-6">
          <div className="text-sm font-semibold">Problems</div>
          <div className="text-sm text-muted mt-2">Add/edit statements, tags, sample/hidden tests.</div>
          <a className="inline-block mt-4 underline text-sm" href="/admin/problems">
            Open →
          </a>
        </Card>
        <Card className="p-6">
          <div className="text-sm font-semibold">Courses</div>
          <div className="text-sm text-muted mt-2">Manage syllabus, modules, and roadmaps.</div>
          <a className="inline-block mt-4 underline text-sm" href="/admin/courses">
            Open →
          </a>
        </Card>
        <Card className="p-6">
          <div className="text-sm font-semibold">Contests</div>
          <div className="text-sm text-muted mt-2">Schedule contests and configure scoring.</div>
          <a className="inline-block mt-4 underline text-sm" href="/admin/contests">
            Open →
          </a>
        </Card>
      </div>
    </Container>
  );
}

