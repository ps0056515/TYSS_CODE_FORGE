import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { PROJECT_CATEGORIES } from "@/lib/practice-categories";
import { PracticeCategoryClient } from "@/app/practice/_components/PracticeCategoryClient";

type Props = { params: { categoryId: string } };

export default function PracticeProjectsPage({ params }: Props) {
  const categoryId = params.categoryId;
  const meta = PROJECT_CATEGORIES.find((c) => c.id === categoryId);
  if (!meta) return notFound();

  return (
    <Container className="py-6 md:py-8">
      <PracticeCategoryClient
        title={meta.name}
        categoryId={categoryId}
        mode="project"
      />
    </Container>
  );
}
