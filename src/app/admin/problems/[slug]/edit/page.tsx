import { notFound } from "next/navigation";
import { getProblemBySlug, isCustomProblem } from "@/lib/problems_store";
import { AdminProblemEditClient } from "./AdminProblemEditClient";

export default async function AdminProblemEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [problem, custom] = await Promise.all([getProblemBySlug(slug), isCustomProblem(slug)]);
  if (!problem || !custom) notFound();
  return <AdminProblemEditClient slug={slug} initialProblem={problem} />;
}
