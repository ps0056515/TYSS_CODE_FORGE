"use client";

import * as React from "react";
import Link from "next/link";
import type { Problem } from "@/lib/data";
import { Card } from "@/components/ui";
import { cn } from "@/lib/cn";

type Difficulty = Problem["difficulty"] | "All";

function DifficultyPill({ d }: { d: Problem["difficulty"] }) {
  const cls =
    d === "Easy"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : d === "Medium"
        ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
        : "bg-rose-500/15 text-rose-300 border-rose-500/30";
  return <span className={cn("text-xs px-2 py-1 rounded-full border", cls)}>{d}</span>;
}

function TagChip({ tag, active, onClick }: { tag: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-xs rounded-full border px-3 py-1 transition",
        active ? "bg-brand/20 text-text border-brand/40" : "bg-white/5 text-muted border-border hover:bg-white/10"
      )}
    >
      {tag}
    </button>
  );
}

export function PracticeClient() {
  const [items, setItems] = React.useState<Problem[]>([]);
  const [q, setQ] = React.useState("");
  const [difficulty, setDifficulty] = React.useState<Difficulty>("All");
  const [activeTag, setActiveTag] = React.useState<string | null>(null);
  const [solved, setSolved] = React.useState<Set<string>>(new Set());
  const [user, setUser] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const probsRes = await fetch("/api/problems", { cache: "no-store" });
      const probsData = (await probsRes.json()) as { ok: boolean; items: Problem[] };
      if (probsData?.ok) setItems(probsData.items ?? []);

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
    return Array.from(set.values()).sort();
  }, [items]);

  const filtered = items.filter((p) => {
    if (difficulty !== "All" && p.difficulty !== difficulty) return false;
    if (activeTag && !p.tags.includes(activeTag)) return false;
    if (!q.trim()) return true;
    const s = q.trim().toLowerCase();
    return p.title.toLowerCase().includes(s) || p.tags.some((t) => t.toLowerCase().includes(s));
  });

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="text-xs tracking-[0.35em] text-muted">SEARCH</div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="mt-2 h-11 w-full rounded-xl bg-black/40 border border-border px-4 text-sm outline-none focus:ring-2 focus:ring-brand/50"
            placeholder="Search problems by title or tag (e.g. arrays, strings)"
          />
        </div>
        <div>
          <div className="text-xs tracking-[0.35em] text-muted">DIFFICULTY</div>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="mt-2 h-11 w-full rounded-xl bg-black/40 border border-border px-3 text-sm outline-none focus:ring-2 focus:ring-brand/50"
          >
            {(["All", "Easy", "Medium", "Hard"] as Difficulty[]).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <div className="text-xs tracking-[0.35em] text-muted mr-2">TAGS</div>
        <TagChip tag="All" active={!activeTag} onClick={() => setActiveTag(null)} />
        {tags.map((t) => (
          <TagChip key={t} tag={t} active={activeTag === t} onClick={() => setActiveTag(activeTag === t ? null : t)} />
        ))}
      </div>

      <div className="mt-4 text-sm text-muted">
        {user ? (
          <span>
            Signed in as <span className="text-text font-semibold">{user}</span>
          </span>
        ) : (
          <span>
            Not signed in (solved status hidden). Go to <a className="underline" href="/login">/login</a>.
          </span>
        )}
        <span className="mx-2">·</span>
        <span>{filtered.length} problems</span>
      </div>

      <div className="mt-6 grid gap-3">
        {filtered.map((p) => {
          const isSolved = solved.has(p.slug);
          return (
            <Link key={p.slug} href={`/practice/${p.slug}`}>
              <Card className="p-5 hover:bg-white/5 transition">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{p.title}</div>
                      {user ? (
                        <span
                          className={cn(
                            "text-xs px-2 py-1 rounded-full border",
                            isSolved
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : "bg-white/5 text-muted border-border"
                          )}
                        >
                          {isSolved ? "Solved" : "Unsolved"}
                        </span>
                      ) : null}
                    </div>
                    <div className="text-sm text-muted mt-1">
                      {p.tags.join(" · ")}
                      {p.languages?.length ? (
                        <>
                          <span className="mx-2">·</span>
                          {p.languages.join(" / ")}
                        </>
                      ) : null}
                    </div>
                  </div>
                  <DifficultyPill d={p.difficulty} />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

