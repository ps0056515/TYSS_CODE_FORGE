"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Problem } from "@/lib/data";
import { Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  PROGRAMMING_LANGUAGES,
  DATA_STRUCTURES,
  ALGORITHMS,
  COMPANIES,
  PROJECT_CATEGORIES,
} from "@/lib/practice-categories";
import { getLanguageCardMeta } from "@/lib/practice-languages-ui";
import { LanguageLogo } from "./_components/LanguageLogo";

type Difficulty = Problem["difficulty"] | "All";
type PracticeSectionId = "all" | "topic-wise" | "company-prep" | "beginner" | "projects";

function sectionFilter(sectionId: PracticeSectionId, p: Problem): boolean {
  switch (sectionId) {
    case "all": return true;
    case "topic-wise": return true;
    case "company-prep": return p.tags.some((t) => t === "company-prep" || t.startsWith("company-"));
    case "beginner": return p.difficulty === "Easy";
    case "projects": return p.type === "project";
    default: return true;
  }
}

function DifficultyPill({ d }: { d: Problem["difficulty"] }) {
  const cls =
    d === "Easy" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
    : d === "Medium" ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
    : "bg-rose-500/15 text-rose-300 border-rose-500/30";
  return <span className={cn("text-xs px-2 py-1 rounded-full border", cls)}>{d}</span>;
}

/** Palette for category cards (Data Structures, Algorithms, Company, Projects) */
const CATEGORY_CARD_COLORS = [
  "#426BFF", "#D9A300", "#10B981", "#8B5CF6", "#EC4899", "#06B6D4",
  "#F59E0B", "#6366F1", "#14B8A6", "#F43F5E", "#3B82F6", "#84CC16",
];

function getCategoryCardColor(index: number) {
  return CATEGORY_CARD_COLORS[index % CATEGORY_CARD_COLORS.length];
}

/** Shared card layout for Data Structures, Algorithms, Company, Projects (like Programming Languages). */
function CategoryBrowseCard({
  href,
  title,
  description,
  problemCount,
  levelLabel,
  color,
  iconLabel,
}: {
  href: string;
  title: string;
  description: string;
  problemCount: number;
  levelLabel: string;
  color: string;
  iconLabel: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-xl overflow-hidden border border-border bg-[var(--cf-card)] hover:border-white/20 hover:shadow-lg hover:shadow-black/20 transition text-left"
    >
      <div className="h-2 w-full shrink-0" style={{ backgroundColor: color }} />
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md -mt-6 relative z-10 ring-1 ring-black/5 text-white font-bold text-sm shrink-0"
            style={{ backgroundColor: color }}
          >
            {iconLabel}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="font-bold text-lg text-text group-hover:text-[#8C9EFF] transition">
              {title}
            </h3>
            <p className="text-sm text-muted mt-1 line-clamp-2">{description}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-border text-sm text-muted">
          <span className="inline-flex items-center gap-1.5">
            <svg className="w-4 h-4 shrink-0 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            {problemCount} Problem{problemCount !== 1 ? "s" : ""}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg className="w-4 h-4 shrink-0 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            {levelLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}

function iconLabel(name: string): string {
  const words = name.split(/[\s/]+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function ProblemCard({ problem, isSolved, user }: { problem: Problem; isSolved: boolean; user: string | null }) {
  const isProject = problem.type === "project";
  return (
    <Link href={`/practice/${problem.slug}`}>
      <Card className="p-4 hover:bg-white/5 transition">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-text">{problem.title}</span>
              {isProject && (
                <span className="text-xs px-2 py-0.5 rounded border bg-sky-500/15 text-sky-300 border-sky-500/30">
                  Project
                </span>
              )}
              {user && (
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded border",
                  isSolved ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-white/5 text-muted border-border"
                )}>
                  {isSolved ? "Solved" : "Unsolved"}
                </span>
              )}
            </div>
            <p className="text-xs text-muted mt-1 truncate">{problem.tags.join(" · ")}</p>
          </div>
          <DifficultyPill d={problem.difficulty} />
        </div>
      </Card>
    </Link>
  );
}

export function PracticeClient() {
  const [items, setItems] = React.useState<Problem[]>([]);
  const [sections, setSections] = React.useState<{ id: string; name: string; shortName: string; description: string; groupByTag: boolean }[]>([]);
  const [activeSection, setActiveSection] = React.useState<PracticeSectionId>("all");
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<Difficulty>("All");
  const [q, setQ] = React.useState("");
  const [solved, setSolved] = React.useState<Set<string>>(new Set());
  const [user, setUser] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const [probsRes, sectionsRes] = await Promise.all([
        fetch("/api/problems", { cache: "no-store" }),
        fetch("/api/practice/sections", { cache: "no-store" }),
      ]);
      const probsData = (await probsRes.json()) as { ok: boolean; items: Problem[] };
      const sectionsData = (await sectionsRes.json()) as { ok: boolean; sections: { id: string; name: string; shortName: string; description: string; groupByTag: boolean }[] };
      if (probsData?.ok) setItems(probsData.items ?? []);
      if (sectionsData?.ok) setSections(sectionsData.sections ?? []);

      const res = await fetch("/api/progress", { cache: "no-store" });
      const data = (await res.json()) as { ok: boolean; user: string | null; solved: string[] };
      if (data?.ok) {
        setUser(data.user);
        setSolved(new Set(data.solved ?? []));
      }
    })();
  }, []);

  const tags = React.useMemo(() => {
    const set = new Set<string>();
    items.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [items]);

  const sectionFiltered = React.useMemo(
    () => items.filter((p) => sectionFilter(activeSection, p)),
    [items, activeSection]
  );

  const byLanguage = React.useMemo(() => {
    const map: Record<string, Problem[]> = {};
    PROGRAMMING_LANGUAGES.forEach(({ id }) => {
      map[id] = sectionFiltered.filter((p) => (p.languages as readonly string[])?.includes(id));
    });
    return map;
  }, [sectionFiltered]);

  const filtered = React.useMemo(() => {
    let list = sectionFiltered;
    if (selectedTag) {
      if (selectedTag === "project") list = list.filter((p) => p.type === "project");
      else list = list.filter((p) => p.tags.includes(selectedTag));
    }
    if (selectedDifficulty !== "All") list = list.filter((p) => p.difficulty === selectedDifficulty);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(s) || p.tags.some((t) => t.toLowerCase().includes(s)));
    }
    return list;
  }, [sectionFiltered, selectedTag, selectedDifficulty, q]);

  const activeSectionMeta = sections.find((s) => s.id === activeSection);
  const groupedByTag = activeSectionMeta?.groupByTag
    ? (() => {
        const byTag = new Map<string, Problem[]>();
        filtered.forEach((p) => {
          p.tags.forEach((tag) => {
            if (!byTag.has(tag)) byTag.set(tag, []);
            byTag.get(tag)!.push(p);
          });
        });
        return Array.from(byTag.entries()).sort((a, b) => a[0].localeCompare(b[0]));
      })()
    : null;

  return (
    <div className="space-y-10">
      {/* Header: title left, nav links right (reference design) */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text tracking-tight">
          Programming Languages
        </h1>
        <nav className="flex flex-wrap items-center gap-4 text-sm">
          <Link
            href="/practice#topics"
            className="inline-flex items-center gap-1 text-[#8C9EFF] hover:text-[#A5B4FF] transition"
          >
            Recent Contest Problems
            <ChevronRight className="w-4 h-4 shrink-0" />
          </Link>
          <Link
            href="/practice#difficulty"
            className="inline-flex items-center gap-1 text-[#8C9EFF] hover:text-[#A5B4FF] transition"
          >
            Old practice page
            <ChevronRight className="w-4 h-4 shrink-0" />
          </Link>
        </nav>
      </header>

      {/* Browse by — anchor nav */}
      <nav className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-muted">
        <a href="#programming-languages" className="hover:text-text transition underline-offset-2 hover:underline">Programming Languages</a>
        <span>·</span>
        <a href="#data-structures" className="hover:text-text transition underline-offset-2 hover:underline">Data Structures</a>
        <span>·</span>
        <a href="#algorithms" className="hover:text-text transition underline-offset-2 hover:underline">Algorithms</a>
        <span>·</span>
        <a href="#company-wise" className="hover:text-text transition underline-offset-2 hover:underline">Company-wise</a>
        <span>·</span>
        <a href="#projects" className="hover:text-text transition underline-offset-2 hover:underline">Projects</a>
        <span>·</span>
        <a href="#topics" className="hover:text-text transition underline-offset-2 hover:underline">Topics</a>
        <span>·</span>
        <a href="#difficulty" className="hover:text-text transition underline-offset-2 hover:underline">Difficulty</a>
        <span>·</span>
        <Link href="/practice/mcq" className="text-[#8C9EFF] hover:underline">MCQ Practice</Link>
      </nav>

      {/* Programming Languages — cards with colored strip, logo, description, count & level */}
      <section id="programming-languages">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {PROGRAMMING_LANGUAGES.map((lang) => {
            const count = byLanguage[lang.id]?.length ?? 0;
            const meta = getLanguageCardMeta(lang.id);
            return (
              <Link
                key={lang.id}
                href={`/practice/language/${lang.id}`}
                className="group block rounded-xl overflow-hidden border border-border bg-[var(--cf-card)] hover:border-white/20 hover:shadow-lg hover:shadow-black/20 transition text-left"
              >
                {/* Colored top strip */}
                <div
                  className="h-2 w-full shrink-0"
                  style={{ backgroundColor: meta.color }}
                />
                <div className="p-4">
                  {/* Logo overlapping strip area: white square with logo */}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-white dark:bg-white/95 flex items-center justify-center shadow-md -mt-6 relative z-10 ring-1 ring-black/5">
                      <LanguageLogo langId={lang.id} stripColor={meta.color} className="w-10 h-10" />
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <h3 className="font-bold text-lg text-text group-hover:text-[#8C9EFF] transition">
                        Practice {lang.name}
                      </h3>
                      <p className="text-sm text-muted mt-1 line-clamp-2">
                        {meta.description}
                      </p>
                    </div>
                  </div>
                  {/* Problem count & level */}
                  <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-border text-sm text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="w-4 h-4 shrink-0 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      {count} Problem{count !== 1 ? "s" : ""}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="w-4 h-4 shrink-0 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                      </svg>
                      {meta.level}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Data Structures — cards like Programming Languages */}
      <section id="data-structures">
        <h2 className="text-lg font-semibold text-text mb-4">Browse by Data Structures</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DATA_STRUCTURES.map((ds, i) => {
            const count = sectionFiltered.filter((p) => p.tags.includes(ds.id)).length;
            return (
              <CategoryBrowseCard
                key={ds.id}
                href={`/practice/data-structures/${ds.id}`}
                title={`Practice ${ds.name}`}
                description={`Problems on ${ds.name.toLowerCase()} and related patterns. Build strength in this topic.`}
                problemCount={count}
                levelLabel="Beginner to Advanced"
                color={getCategoryCardColor(i)}
                iconLabel={iconLabel(ds.name)}
              />
            );
          })}
        </div>
      </section>

      {/* Algorithms — cards like Programming Languages */}
      <section id="algorithms">
        <h2 className="text-lg font-semibold text-text mb-4">Browse by Algorithms</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ALGORITHMS.map((algo, i) => {
            const count = sectionFiltered.filter((p) => p.tags.includes(algo.id)).length;
            return (
              <CategoryBrowseCard
                key={algo.id}
                href={`/practice/algorithms/${algo.id}`}
                title={`Practice ${algo.name}`}
                description={`Problems using ${algo.name.toLowerCase()} techniques and patterns.`}
                problemCount={count}
                levelLabel="Beginner to Advanced"
                color={getCategoryCardColor(i)}
                iconLabel={iconLabel(algo.name)}
              />
            );
          })}
        </div>
      </section>

      {/* Company-wise — cards like Programming Languages */}
      <section id="company-wise">
        <h2 className="text-lg font-semibold text-text mb-4">Browse by Company (Interview Prep)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {COMPANIES.map((co, i) => {
            const count = sectionFiltered.filter((p) => p.tags.includes(co.id)).length;
            const shortName = co.id.replace("company-", "");
            return (
              <CategoryBrowseCard
                key={co.id}
                href={`/practice/company/${co.id}`}
                title={co.name}
                description={shortName === "prep" ? "Curated problems for technical interviews across companies." : `Interview-style problems often asked at ${co.name}.`}
                problemCount={count}
                levelLabel="Interview level"
                color={getCategoryCardColor(i)}
                iconLabel={shortName === "prep" ? "GP" : co.name.slice(0, 2).toUpperCase()}
              />
            );
          })}
        </div>
      </section>

      {/* Projects — cards like Programming Languages */}
      <section id="projects">
        <h2 className="text-lg font-semibold text-text mb-4">Browse by Projects</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {PROJECT_CATEGORIES.map((proj, i) => {
            const count = proj.id === "project"
              ? sectionFiltered.filter((p) => p.type === "project").length
              : sectionFiltered.filter((p) => p.type === "project" && p.tags.includes(proj.id)).length;
            return (
              <CategoryBrowseCard
                key={proj.id}
                href={`/practice/projects/${proj.id}`}
                title={proj.name}
                description={proj.id === "project" ? "Submit codebases and get assessed on use-case behaviour." : `Project-based practice: ${proj.name.toLowerCase()}.`}
                problemCount={count}
                levelLabel="Project-based"
                color={getCategoryCardColor(i)}
                iconLabel={iconLabel(proj.name)}
              />
            );
          })}
        </div>
      </section>

      {/* Topics (all tags) */}
      <section id="topics">
        <h2 className="text-lg font-semibold text-text mb-3">Browse by Topic (all tags)</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm transition",
              !selectedTag ? "bg-brand/20 text-text border-brand/40" : "bg-white/5 text-muted border-border hover:bg-white/10 hover:text-text"
            )}
          >
            All
          </button>
          {tags.map((tag) => {
            const active = selectedTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(active ? null : tag)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm transition",
                  active ? "bg-brand/20 text-text border-brand/40" : "bg-white/5 text-muted border-border hover:bg-white/10 hover:text-text"
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </section>

      {/* Difficulty */}
      <section id="difficulty">
        <h2 className="text-lg font-semibold text-text mb-3">Browse by Difficulty</h2>
        <div className="flex flex-wrap gap-3">
          {(["All", "Easy", "Medium", "Hard"] as Difficulty[]).map((d) => {
            const active = selectedDifficulty === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDifficulty(d)}
                className={cn(
                  "rounded-xl border px-4 py-2.5 text-sm font-medium transition",
                  active ? "bg-brand/15 border-brand/50 text-text" : "bg-white/5 border-border text-muted hover:bg-white/10 hover:text-text"
                )}
              >
                {d}
              </button>
            );
          })}
        </div>
      </section>

      {/* Section tabs (All, Topic-wise, etc.) + Search */}
      <div className="flex flex-wrap items-center gap-3">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveSection(s.id as PracticeSectionId)}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm transition",
              activeSection === s.id ? "bg-brand text-white border-brand" : "bg-white/5 text-muted border-border hover:bg-white/10 hover:text-text"
            )}
          >
            {s.shortName}
          </button>
        ))}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search problems..."
          className="ml-auto min-w-[180px] rounded-lg border border-border bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/50"
        />
      </div>

      {/* Problem list */}
      <section>
        <div className="flex items-center justify-between gap-4 mb-3">
          <h2 className="text-lg font-semibold text-text">
            {groupedByTag ? "Problems by topic" : "Problems"}
          </h2>
          <span className="text-sm text-muted">
            {user && <span className="text-text font-medium">{user}</span>}
            {user && " · "}
            {filtered.length} problem{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {groupedByTag ? (
          <div className="space-y-6">
            {groupedByTag.map(([tag, probs]) => (
              <div key={tag}>
                <h3 className="text-sm font-medium text-muted mb-2">{tag}</h3>
                <div className="grid gap-2">
                  {probs.map((p) => (
                    <ProblemCard key={p.slug} problem={p} isSolved={solved.has(p.slug)} user={user} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-8 text-center text-muted">
            No problems match. Try changing language, topic, or difficulty above.
          </Card>
        ) : (
          <div className="grid gap-2">
            {filtered.map((p) => (
              <ProblemCard key={p.slug} problem={p} isSolved={solved.has(p.slug)} user={user} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
