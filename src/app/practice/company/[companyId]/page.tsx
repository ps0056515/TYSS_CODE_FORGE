import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { COMPANIES } from "@/lib/practice-categories";
import { PracticeCategoryClient } from "@/app/practice/_components/PracticeCategoryClient";

type Props = { params: { companyId: string } };

export default function PracticeCompanyPage({ params }: Props) {
  const companyId = params.companyId;
  const meta = COMPANIES.find((c) => c.id === companyId);
  if (!meta) return notFound();

  return (
    <Container className="py-6 md:py-8">
      <PracticeCategoryClient
        title={`${meta.name} — Interview Prep`}
        categoryId={companyId}
        mode="tag"
      />
    </Container>
  );
}
