"use client";

import * as React from "react";
import Link from "next/link";
import type { Problem } from "@/lib/data";
import type { LanguageTopic } from "@/lib/practice-language-topics";
import { Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import { ChevronDown, ChevronRight } from "lucide-react";

function DifficultyPill({ d }: { d: Problem["difficulty"] }) {
  const cls =
    d === "Easy" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
    : d === "Medium" ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
    : "bg-rose-500/15 text-rose-300 border-rose-500/30";
  return <span className={cn("text-xs px-2 py-1 rounded-full border", cls)}>{d}</span>;
}

export function PracticeLanguageClient({
  lang,
  langName,
  topics = [],
}: {
  lang: string;
  langName: string;
  topics?: LanguageTopic[];
}) {
  const safeTopics = Array.isArray(topics) ? topics : [];
  const [problems, setProblems] = React.useState<Problem[]>([]);
  const [solved, setSolved] = React.useState<Set<string>>(new Set());
  const [user, setUser] = React.useState<string | null>(null);
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

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
        const filtered = all.filter((p) => (p.languages as readonly string[])?.includes(lang));
        setProblems(filtered);
      }
      if (progressData?.ok) {
        setUser(progressData.user);
        setSolved(new Set(progressData.solved ?? []));
      }
    })();
  }, [lang]);

  const problemsByTag = React.useMemo(() => {
    const map: Record<string, Problem[]> = {};
    safeTopics.forEach((t) => {
      map[t.tag] = problems.filter((p) => p.tags?.includes(t.tag));
    });
    return map;
  }, [problems, safeTopics]);

  const uncategorized = React.useMemo(() => {
    const used = new Set(problems.filter((p) => safeTopics.some((t) => p.tags?.includes(t.tag))).map((p) => p.slug));
    return problems.filter((p) => !used.has(p.slug));
  }, [problems, safeTopics]);

  return (
    <div>
      <Link
        href="/practice"
        className="text-sm text-muted hover:text-text transition inline-flex items-center gap-1 mb-4"
      >
        ← Back to Practice
      </Link>
      <h1 className="text-2xl md:text-3xl font-extrabold text-text mt-2">
        {langName} — Topic-wise Practice
      </h1>
      <p className="text-sm text-muted mt-2">
        Expand a topic to see practice problems. Solve problems to track your progress.
      </p>

      <div className="mt-8 space-y-0">
        {safeTopics.map((topic, index) => {
          const probs = problemsByTag[topic.tag] ?? [];
          const isExpanded = expanded.has(topic.id);
          return (
            <div
              key={topic.id}
              className="border-b border-border last:border-b-0"
            >
              <button
                type="button"
                onClick={() => {
                  setExpanded((prev) => {
                    const next = new Set(prev);
                    if (next.has(topic.id)) next.delete(topic.id);
                    else next.add(topic.id);
                    return next;
                  });
                }}
                className="w-full flex items-start gap-4 py-4 px-1 text-left hover:bg-white/5 transition rounded-lg"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg font-semibold text-text">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-text">{topic.title}</h2>
                  <p className="text-sm text-muted mt-0.5">{topic.description}</p>
                </div>
                <span className="shrink-0 text-muted mt-1">
                  {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </span>
              </button>
              {isExpanded && (
                <div className="pb-4 pl-14 pr-4">
                  {probs.length === 0 ? (
                    <p className="text-sm text-muted">No practice problems in this topic yet.</p>
                  ) : (
                    <div className="grid gap-2">
                      {probs.map((p) => (
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
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {uncategorized.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border">
          <h2 className="text-lg font-semibold text-text mb-3">Other problems</h2>
          <p className="text-sm text-muted mb-3">Problems in {langName} not yet assigned to a topic above.</p>
          <div className="grid gap-2">
            {uncategorized.map((p) => (
              <Link key={p.slug} href={`/practice/${p.slug}`}>
                <Card className="p-4 hover:bg-white/5 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <span className="font-medium text-text">{p.title}</span>
                      {user && (
                        <span className={cn("ml-2 text-xs px-2 py-0.5 rounded border", solved.has(p.slug) ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-white/5 text-muted border-border")}>
                          {solved.has(p.slug) ? "Solved" : "Unsolved"}
                        </span>
                      )}
                      <p className="text-xs text-muted mt-1">{p.tags.join(" · ")}</p>
                    </div>
                    <DifficultyPill d={p.difficulty} />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
