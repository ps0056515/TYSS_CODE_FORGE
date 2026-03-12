import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { ALGORITHMS } from "@/lib/practice-categories";
import { PracticeCategoryClient } from "@/app/practice/_components/PracticeCategoryClient";

type Props = { params: { topicId: string } };

export default function PracticeAlgorithmsPage({ params }: Props) {
  const topicId = params.topicId;
  const meta = ALGORITHMS.find((t) => t.id === topicId);
  if (!meta) return notFound();

  return (
    <Container className="py-6 md:py-8">
      <PracticeCategoryClient
        title={`${meta.name} — Algorithms`}
        categoryId={topicId}
        mode="tag"
      />
    </Container>
  );
}
