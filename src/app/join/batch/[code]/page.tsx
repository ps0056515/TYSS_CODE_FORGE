import { Container } from "@/components/ui";
import { getUserAsync } from "@/lib/auth";
import { JoinBatchClient } from "./JoinBatchClient";

export default async function JoinBatchPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const user = await getUserAsync();

  return (
    <Container className="py-10">
      <div className="max-w-2xl mx-auto">
        <div className="text-xs tracking-[0.35em] text-muted">BATCH INVITE</div>
        <h1 className="text-2xl font-extrabold mt-2">Join a batch</h1>
        <p className="text-sm text-muted mt-2">
          This link enrolls you into a training batch so you can access its assignments and assessments.
        </p>
        <JoinBatchClient code={code} signedIn={!!user} />
      </div>
    </Container>
  );
}

