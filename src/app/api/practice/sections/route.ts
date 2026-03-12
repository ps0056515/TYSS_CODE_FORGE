import { NextResponse } from "next/server";
import { practiceSections } from "@/lib/data";

export const runtime = "nodejs";

/** Returns practice section metadata (filter logic is applied on client using problem list). */
export async function GET() {
  const sections = practiceSections.map((s) => ({
    id: s.id,
    name: s.name,
    shortName: s.shortName,
    description: s.description,
    groupByTag: s.groupByTag ?? false
  }));
  return NextResponse.json({ ok: true, sections });
}
