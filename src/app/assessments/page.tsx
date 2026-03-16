import { Container } from "@/components/ui";
import { getUserAsync } from "@/lib/auth";
import { AssignmentsListClient } from "../assignments/AssignmentsListClient";

export const dynamic = "force-dynamic";

export default async function AssessmentsPage() {
  let user: string | null = null;
  try {
    user = await getUserAsync();
  } catch {
    user = null;
  }

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-extrabold">My assessments</h1>
      <p className="text-sm text-muted mt-1 max-w-xl">
        Assessments are graded activities shared by your instructor for a specific skill/technology.
      </p>
      <AssignmentsListClient signedIn={!!user} kind="assessment" />
    </Container>
  );
}

