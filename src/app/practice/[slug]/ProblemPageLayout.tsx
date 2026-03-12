"use client";

import * as React from "react";
import Link from "next/link";
import type { Problem } from "@/lib/data";
import { ProblemClient } from "./ProblemClient";
import { cn } from "@/lib/cn";

export function ProblemPageLayout({
  problem,
  starter
}: {
  problem: Problem;
  starter: string;
}) {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] min-h-[500px]">
      {/* Top bar: breadcrumb / title + leaderboard link — CodeChef-style */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border bg-black/20 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/practice"
            className="text-sm text-muted hover:text-text transition shrink-0"
          >
            ← Practice
          </Link>
          <span className="text-muted">/</span>
          <h1 className="text-base font-semibold text-text truncate">
            {problem.title}
          </h1>
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded border shrink-0",
              problem.difficulty === "Easy" && "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
              problem.difficulty === "Medium" && "bg-amber-500/15 text-amber-300 border-amber-500/30",
              problem.difficulty === "Hard" && "bg-rose-500/15 text-rose-300 border-rose-500/30"
            )}
          >
            {problem.difficulty}
          </span>
        </div>
        <Link
          href={`/leaderboard/${problem.slug}`}
          className="text-sm text-muted hover:text-brand transition shrink-0"
        >
          Leaderboard →
        </Link>
      </div>

      {/* Two columns: Problem (left) | Editor (right) */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Problem statement — scrollable */}
        <div className="w-full lg:w-[42%] xl:w-[38%] flex flex-col border-r border-border bg-black/10 shrink-0">
          <div className="flex-1 overflow-y-auto p-5 lg:p-6">
            <section>
              <h2 className="text-xs font-semibold tracking-widest text-muted uppercase">Problem</h2>
              <div className="mt-2 text-sm leading-relaxed text-text whitespace-pre-wrap">
                {problem.statement}
              </div>
            </section>

            {problem.examples.length > 0 && (
              <section className="mt-6 pt-6 border-t border-border">
                <h2 className="text-xs font-semibold tracking-widest text-muted uppercase">Sample</h2>
                <div className="mt-3 space-y-4">
                  {problem.examples.map((ex, i) => (
                    <div key={i} className="rounded-lg border border-border bg-black/30 p-4 font-mono text-sm">
                      <div className="text-xs text-muted uppercase mb-1">Input</div>
                      <pre className="whitespace-pre-wrap break-words text-text">{ex.input}</pre>
                      <div className="text-xs text-muted uppercase mt-3 mb-1">Output</div>
                      <pre className="whitespace-pre-wrap break-words text-text">{ex.output}</pre>
                      {ex.explanation && (
                        <div className="text-xs text-muted mt-2 font-sans">{ex.explanation}</div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {problem.type === "project" && problem.useCases && problem.useCases.length > 0 && (
              <section className="mt-6 pt-6 border-t border-border">
                <h2 className="text-xs font-semibold tracking-widest text-muted uppercase">Use cases</h2>
                <ul className="mt-3 space-y-2 text-sm text-text">
                  {problem.useCases.map((uc) => (
                    <li key={uc.id} className="flex gap-2">
                      <span className="text-muted shrink-0">{uc.id}:</span>
                      <span><strong>{uc.title}</strong> — {uc.description}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>

        {/* Right: Editor + Run + Input/Output — CodeChef-style */}
        <div className="flex-1 flex flex-col min-w-0">
          <ProblemClient
            starter={starter}
            title={problem.title}
            problemSlug={problem.slug}
            problemType={problem.type}
          />
        </div>
      </div>
    </div>
  );
}
