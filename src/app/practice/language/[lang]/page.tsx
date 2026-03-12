import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { PROGRAMMING_LANGUAGES } from "@/lib/practice-categories";
import { getLanguageTopics } from "@/lib/practice-language-topics";
import { PracticeLanguageClient } from "./PracticeLanguageClient";

type Props = { params: { lang: string } };

export default function PracticeLanguagePage({ params }: Props) {
  const lang = params.lang;
  const meta = PROGRAMMING_LANGUAGES.find((l) => l.id === lang);
  if (!meta) return notFound();
  const topics = getLanguageTopics(lang);

  return (
    <Container className="py-6 md:py-8">
      <PracticeLanguageClient lang={lang} langName={meta.name} topics={topics} />
    </Container>
  );
}
