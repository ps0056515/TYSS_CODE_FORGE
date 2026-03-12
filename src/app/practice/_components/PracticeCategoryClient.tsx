"use client";

import * as React from "react";
import Link from "next/link";
import type { Problem } from "@/lib/data";
import { Card } from "@/components/ui";
import { cn } from "@/lib/cn";

function DifficultyPill({ d }: { d: Problem["difficulty"] }) {
  const cls =
    d === "Easy" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
    : d === "Medium" ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
    : "bg-rose-500/15 text-rose-300 border-rose-500/30";
  return <span className={cn("text-xs px-2 py-1 rounded-full border", cls)}>{d}</span>;
}

function filterProblems(problems: Problem[], categoryId: string, mode: "tag" | "project"): Problem[] {
  if (mode === "project") {
    if (categoryId === "project") return problems.filter((p) => p.type === "project");
    return problems.filter((p) => p.type === "project" && p.tags.includes(categoryId));
  }
  return problems.filter((p) => p.tags.includes(categoryId));
}

export function PracticeCategoryClient({
  title,
  categoryId,
  mode,
  backHref = "/practice",
}: {
  title: string;
  categoryId: string;
  mode: "tag" | "project";
  backHref?: string;
}) {
  const [items, setItems] = React.useState<Problem[]>([]);
  const [solved, setSolved] = React.useState<Set<string>>(new Set());
  const [user, setUser] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const [probsRes, progressRes] = await Promise.all([
        fetch("/api/problems", { cache: "no-store" }),
        fetch("/api/progress", { cache: "no-store" }),
      ]);
      const probsData = (await probsRes.json()) as { ok: boolean; items: Problem[] };
      const progressData = (await progressRes.json()) as { ok: boolean; user: string | null; solved: string[] };
      if (probsData?.ok) {
        const all = probsData.items ?? [];
        setItems(filterProblems(all, categoryId, mode));
      }
      if (progressData?.ok) {
        setUser(progressData.user);
        setSolved(new Set(progressData.solved ?? []));
      }
    })();
  }, [categoryId, mode]);

  return (
    <div>
      <Link
        href={backHref}
        className="text-sm text-muted hover:text-text transition inline-flex items-center gap-1 mb-4"
      >
        ← Back to Practice
      </Link>
      <h1 className="text-2xl md:text-3xl font-extrabold text-text mt-2">{title}</h1>
      <p className="text-sm text-muted mt-2">
        {items.length} problem{items.length !== 1 ? "s" : ""} in this category.
      </p>

      <div className="mt-6 grid gap-2">
        {items.length === 0 ? (
          <Card className="p-8 text-center text-muted">
            No problems in this category yet. Check back later or try another.
          </Card>
        ) : (
          items.map((p) => (
            <Link key={p.slug} href={`/practice/${p.slug}`}>
              <Card className="p-4 hover:bg-white/5 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-text">{p.title}</span>
                      {p.type === "project" && (
                        <span className="text-xs px-2 py-0.5 rounded border bg-sky-500/15 text-sky-300 border-sky-500/30">
                          Project
                        </span>
                      )}
                      {user && (
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded border",
                            solved.has(p.slug)
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : "bg-white/5 text-muted border-border"
                          )}
                        >
                          {solved.has(p.slug) ? "Solved" : "Unsolved"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-1 truncate">{p.tags.join(" · ")}</p>
                  </div>
                  <DifficultyPill d={p.difficulty} />
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
