import { Container } from "@/components/ui";
import { PracticeClient } from "./PracticeClient";

export default function PracticePage() {
  return (
    <Container className="py-10">
      <div>
        <div className="text-xs tracking-[0.35em] text-muted">PRACTICE</div>
        <h2 className="text-2xl font-extrabold mt-2">Problem Library</h2>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          Pick a problem, open it, write code, and hit Run. (Judge is a stub for now; next step is a real sandboxed
          runner + submissions + leaderboards.)
        </p>
      </div>

      <div className="mt-8">
        <PracticeClient />
      </div>
    </Container>
  );
}

