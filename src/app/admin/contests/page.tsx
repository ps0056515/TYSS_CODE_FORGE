import { Container, Card } from "@/components/ui";

export default function AdminContestsPage() {
  return (
    <Container className="py-10">
      <div>
        <div className="text-xs tracking-[0.35em] text-muted">ADMIN</div>
        <h2 className="text-2xl font-extrabold mt-2">Contests (stub)</h2>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          Next: contest creation, problem sets, start/end time, and live standings.
        </p>
      </div>

      <Card className="p-6 mt-8">
        <div className="text-sm text-muted">No admin contest tools yet.</div>
      </Card>
    </Container>
  );
}

