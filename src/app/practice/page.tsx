import { Container } from "@/components/ui";
import { PracticeClient } from "./PracticeClient";

export default function PracticePage() {
  return (
    <Container className="py-8 md:py-10">
      <div className="mb-8">
        <div className="text-xs font-medium tracking-widest text-muted uppercase">Practice</div>
        <h1 className="text-2xl md:text-3xl font-extrabold mt-2 text-text">Problem Library</h1>
        <p className="text-sm text-muted mt-2 max-w-2xl leading-relaxed">
          Pick a problem, write code in the editor, run against samples, then submit for grading. Filter by difficulty and tags.
        </p>
      </div>

      <PracticeClient />
    </Container>
  );
}

