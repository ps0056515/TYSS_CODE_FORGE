import * as React from "react";
import { cn } from "@/lib/cn";

type Tone = "default" | "success" | "warning" | "danger";

const toneClass: Record<Tone, string> = {
  default: "bg-brand",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
};

export function ProgressBar({
  value,
  max = 100,
  tone = "default",
  height = "sm",
  showLabel,
  className,
}: {
  value: number;
  max?: number;
  tone?: Tone;
  showLabel?: boolean;
  height?: "sm" | "md";
  className?: string;
}) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10",
          height === "sm" && "h-2",
          height === "md" && "h-3"
        )}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500", toneClass[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-xs text-muted tabular-nums">{value}/{max} ({pct}%)</p>
      )}
    </div>
  );
}
