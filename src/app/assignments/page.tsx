import { Container, Card } from "@/components/ui";
import { getUserAsync } from "@/lib/auth";
import Link from "next/link";
import { AssignmentsListClient } from "./AssignmentsListClient";

export default async function AssignmentsPage() {
  let user: string | null = null;
  try {
    user = await getUserAsync();
  } catch {
    user = null;
  }
  return (
    <Container className="py-10">
      <h1 className="text-2xl font-extrabold">My assignments</h1>
      <p className="text-sm text-muted mt-1 max-w-xl">
        View and open assignments you’ve joined. To join a new one, use the invitation link from your instructor and click <strong>Join</strong>.
      </p>
      <AssignmentsListClient signedIn={!!user} kind="assignment" />
    </Container>
  );
}
