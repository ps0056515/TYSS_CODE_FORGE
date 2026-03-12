"use client";

import * as React from "react";
import Link from "next/link";
import {
  getMCQTopics,
  getMCQQuestions,
  getMCQQuestionOrder,
  type MCQTopic,
  type MCQQuestion,
  type MCQTechnology,
} from "@/lib/mcq-data";
import { Card, Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { Lightbulb, ChevronRight, ChevronLeft } from "lucide-react";

const STORAGE_KEY = "codeforge-mcq-completed";

function getCompleted(technology: string): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, Record<string, boolean>>) : {};
    return all[technology] ?? {};
  } catch {
    return {};
  }
}

function setCompleted(technology: string, questionId: string, completed: boolean) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, Record<string, boolean>>) : {};
    if (!all[technology]) all[technology] = {};
    all[technology][questionId] = completed;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

export function MCQPracticeClient({
  technology,
  techMeta,
  topics,
  questions,
}: {
  technology: string;
  techMeta: MCQTechnology;
  topics: MCQTopic[];
  questions: MCQQuestion[];
}) {
  const order = React.useMemo(() => getMCQQuestionOrder(technology), [technology]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const [showSolution, setShowSolution] = React.useState(false);
  const [completed, setCompletedState] = React.useState<Record<string, boolean>>({});

  const currentQuestion = order[currentIndex] ? questions.find((q) => q.id === order[currentIndex]) : questions[0];
  const isCorrect = currentQuestion && selectedOption !== null && selectedOption === currentQuestion.correctIndex;

  React.useEffect(() => {
    setCompletedState(getCompleted(technology));
  }, [technology]);

  const completedCount = Object.values(completed).filter(Boolean).length;
  const totalCount = order.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleSubmit = () => {
    if (selectedOption === null || !currentQuestion) return;
    setSubmitted(true);
    if (selectedOption === currentQuestion.correctIndex) {
      setCompleted(technology, currentQuestion.id, true);
      setCompletedState((prev) => ({ ...prev, [currentQuestion.id]: true }));
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setSubmitted(false);
    setShowSolution(false);
    setCurrentIndex((i) => (i + 1) % order.length);
  };

  const handlePrev = () => {
    setSelectedOption(null);
    setSubmitted(false);
    setShowSolution(false);
    setCurrentIndex((i) => (order.length + i - 1) % order.length);
  };

  if (!currentQuestion) {
    return (
      <div className="p-8 text-muted">
        No questions available for this technology. Add questions in mcq-data.ts.
      </div>
    );
  }

  const correctAnswerText = currentQuestion.correctAnswer ?? currentQuestion.options[currentQuestion.correctIndex];

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-[500px]">
      {/* Left: Syllabus */}
      <aside className="w-64 shrink-0 border-r border-border bg-card/50 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border">
          <Link href="/practice/mcq" className="text-xs text-muted hover:text-text">
            ← All technologies
          </Link>
          <h2 className="mt-2 font-semibold text-text">{techMeta.name}</h2>
          <a href="#" className="text-xs text-brand hover:underline mt-1 block">
            View full syllabus
          </a>
          <div className="mt-3 text-sm text-muted">
            <span className="font-medium text-text">{progressPct}%</span> Completed
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {topics.map((t) => {
            const firstIdx = order.findIndex((id) => questions.find((q) => q.id === id)?.topicId === t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => firstIdx >= 0 && (setCurrentIndex(firstIdx), setSelectedOption(null), setSubmitted(false), setShowSolution(false))}
                className={cn(
                  "w-full text-left rounded-lg px-3 py-2 text-sm cursor-pointer transition",
                  currentQuestion.topicId === t.id ? "bg-brand-muted text-brand font-medium" : "text-muted hover:bg-white/5 hover:text-text"
                )}
              >
                {t.title}
                {t.pro && <span className="ml-1 text-[10px] text-amber-400">Pro</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Right: Question */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Tabs: Statement | AI Help */}
        <div className="flex items-center gap-1 border-b border-border bg-black/20 px-4 py-2 shrink-0">
          <button
            type="button"
            className="px-3 py-2 text-sm font-medium rounded-lg bg-brand-muted text-brand border border-brand/20"
          >
            Statement
          </button>
          <button type="button" className="px-3 py-2 text-sm text-muted hover:text-text rounded-lg">
            AI Help
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex">
          {/* Statement panel */}
          <div className="flex-1 p-6 max-w-2xl">
            <h1 className="text-xl font-bold text-text">{currentQuestion.title}</h1>
            <p className="mt-3 text-text leading-relaxed">{currentQuestion.statement}</p>
            <div className="mt-8 pt-6 border-t border-border text-xs text-muted">
              Did you like the problem? (thumbs up/down placeholder)
            </div>
          </div>

          {/* Options + Solution panel */}
          <div className="w-full max-w-xl border-l border-border bg-black/10 p-6 flex flex-col">
            <p className="text-sm font-medium text-text mb-3">Select one of the following options:</p>
            <div className="space-y-2">
              {currentQuestion.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => !submitted && setSelectedOption(idx)}
                  className={cn(
                    "w-full text-left rounded-xl border px-4 py-3 font-mono text-sm transition",
                    selectedOption === idx && !submitted && "border-brand bg-brand-muted",
                    submitted && idx === currentQuestion.correctIndex && "border-emerald-500/50 bg-emerald-500/15",
                    submitted && selectedOption === idx && idx !== currentQuestion.correctIndex && "border-rose-500/30 bg-rose-500/10"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>

            {submitted && (
              <div
                className={cn(
                  "mt-4 rounded-xl border px-4 py-3 text-sm font-medium",
                  isCorrect ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                )}
              >
                {isCorrect ? "✔ Awesome, you nailed it!" : "Incorrect. See the solution below."}
              </div>
            )}

            {/* See Answer / Hide Solution */}
            <div className="mt-4 rounded-xl border border-border bg-black/20 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowSolution(!showSolution)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-text hover:bg-white/5"
              >
                <span className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                  {showSolution ? "Hide Solution" : "See Answer"}
                </span>
              </button>
              {showSolution && (
                <div className="px-4 pb-4 pt-0 space-y-2 border-t border-border">
                  <div>
                    <div className="text-xs text-muted uppercase">Correct answer</div>
                    <pre className="mt-1 font-mono text-sm text-text bg-black/30 rounded-lg p-3 overflow-x-auto">
                      {correctAnswerText}
                    </pre>
                  </div>
                  <div>
                    <div className="text-xs text-muted uppercase">Explanation</div>
                    <p className="mt-1 text-sm text-muted leading-relaxed">{currentQuestion.explanation}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
              <div className="flex gap-2">
                <Button variant="ghost" onClick={handlePrev} className="gap-1">
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <Button variant="ghost" onClick={handleNext} className="gap-1">
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={submitted ? handleNext : handleSubmit} disabled={selectedOption === null}>
                {submitted ? "Next" : "Submit"}
              </Button>
            </div>

            <div className="mt-2 text-xs text-muted">
              Question {currentIndex + 1} of {order.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
