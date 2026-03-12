import { notFound } from "next/navigation";
import {
  mcqTechnologies,
  getMCQTopics,
  getMCQQuestions,
} from "@/lib/mcq-data";
import { MCQPracticeClient } from "./MCQPracticeClient";

type Props = { params: { technology: string } };

export default function MCQTechnologyPage({ params }: Props) {
  const technology = params.technology;
  const techMeta = mcqTechnologies.find((t) => t.id === technology);
  if (!techMeta) return notFound();

  const topics = getMCQTopics(technology);
  const questions = getMCQQuestions(technology);

  return (
    <MCQPracticeClient
      technology={technology}
      techMeta={techMeta}
      topics={topics}
      questions={questions}
    />
  );
}
