import { Container, Card } from "@/components/ui";

export default function TermsPage() {
  return (
    <Container className="py-10">
      <Card className="p-6 md:p-8">
        <div className="text-xs tracking-[0.35em] text-muted uppercase">Legal</div>
        <h1 className="text-2xl md:text-3xl font-extrabold mt-2 text-text">Terms of Service</h1>
        <p className="text-sm text-muted mt-3 max-w-3xl leading-relaxed">
          This is a placeholder Terms of Service for CodeForge. Update this page with your organization’s official terms
          before going live.
        </p>

        <div className="mt-6 space-y-4 text-sm text-text leading-relaxed">
          <section>
            <h2 className="font-semibold">Acceptable use</h2>
            <p className="text-muted mt-1">
              Do not upload malicious code, abuse resources, or violate academic integrity policies.
            </p>
          </section>
          <section>
            <h2 className="font-semibold">Submissions</h2>
            <p className="text-muted mt-1">
              Submissions are evaluated automatically. Scores and verdicts are provided “as is” and may change as tests
              improve.
            </p>
          </section>
          <section>
            <h2 className="font-semibold">Limitation of liability</h2>
            <p className="text-muted mt-1">
              The service is provided without warranties. To the extent permitted by law, liability is limited.
            </p>
          </section>
        </div>
      </Card>
    </Container>
  );
}

