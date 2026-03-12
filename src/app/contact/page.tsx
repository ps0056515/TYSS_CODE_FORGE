import { Container, Card, A } from "@/components/ui";

export default function ContactPage() {
  return (
    <Container className="py-10">
      <Card className="p-6 md:p-8">
        <div className="text-xs tracking-[0.35em] text-muted uppercase">Support</div>
        <h1 className="text-2xl md:text-3xl font-extrabold mt-2 text-text">Contact</h1>
        <p className="text-sm text-muted mt-3 max-w-3xl leading-relaxed">
          For questions about courses, practice problems, assessments, or admin access, reach out to your CodeForge
          administrator.
        </p>

        <div className="mt-6 space-y-3 text-sm">
          <div className="rounded-xl border border-border bg-white/5 p-4">
            <div className="text-xs text-muted">Email</div>
            <div className="mt-1 text-text font-medium">admin@yourdomain.com</div>
            <div className="mt-2 text-muted text-xs">
              Update this email in <code className="bg-white/10 px-1 rounded">src/app/contact/page.tsx</code>.
            </div>
          </div>

          <div className="text-muted">
            Quick links: <A href="/practice">Practice</A> <span className="mx-2">·</span> <A href="/courses">Courses</A>{" "}
            <span className="mx-2">·</span> <A href="/login">Sign in</A>
          </div>
        </div>
      </Card>
    </Container>
  );
}

