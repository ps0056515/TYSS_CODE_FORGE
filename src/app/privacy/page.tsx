import { Container, Card } from "@/components/ui";

export default function PrivacyPage() {
  return (
    <Container className="py-10">
      <Card className="p-6 md:p-8">
        <div className="text-xs tracking-[0.35em] text-muted uppercase">Legal</div>
        <h1 className="text-2xl md:text-3xl font-extrabold mt-2 text-text">Privacy Policy</h1>
        <p className="text-sm text-muted mt-3 max-w-3xl leading-relaxed">
          This is a placeholder Privacy Policy for CodeForge. Update this page with your organization’s official privacy
          terms before going live.
        </p>

        <div className="mt-6 space-y-4 text-sm text-text leading-relaxed">
          <section>
            <h2 className="font-semibold">Data we collect</h2>
            <p className="text-muted mt-1">
              Account identifiers, submission metadata, and usage analytics needed to provide the service.
            </p>
          </section>
          <section>
            <h2 className="font-semibold">How we use data</h2>
            <p className="text-muted mt-1">
              To authenticate users, run submissions, show progress/leaderboards, and improve the platform.
            </p>
          </section>
          <section>
            <h2 className="font-semibold">Contact</h2>
            <p className="text-muted mt-1">
              For privacy requests, contact the admin using the details on the Contact page.
            </p>
          </section>
        </div>
      </Card>
    </Container>
  );
}

