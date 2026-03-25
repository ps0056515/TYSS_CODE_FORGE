import { notFound } from "next/navigation";
import { getProblemBySlug } from "@/lib/problems_store";
import { AdminProblemEditClient } from "./AdminProblemEditClient";

export default async function AdminProblemEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const problem = await getProblemBySlug(slug);
  if (!problem) notFound();
  return <AdminProblemEditClient slug={slug} initialProblem={problem} />;
}
