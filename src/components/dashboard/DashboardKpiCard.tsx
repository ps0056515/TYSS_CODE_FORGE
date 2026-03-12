import * as React from "react";
import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";

type Accent = "neutral" | "success" | "warning" | "danger" | "brand";

const accentStyles: Record<Accent, { border: string; bg: string; icon: string; label: string }> = {
  neutral: {
    border: "border-l-muted/50",
    bg: "bg-card",
    icon: "text-muted",
    label: "text-muted",
  },
  success: {
    border: "border-l-emerald-500",
    bg: "bg-emerald-500/5 dark:bg-emerald-500/10",
    icon: "text-emerald-600 dark:text-emerald-400",
    label: "text-muted",
  },
  warning: {
    border: "border-l-amber-500",
    bg: "bg-amber-500/5 dark:bg-amber-500/10",
    icon: "text-amber-600 dark:text-amber-400",
    label: "text-muted",
  },
  danger: {
    border: "border-l-rose-500",
    bg: "bg-rose-500/5 dark:bg-rose-500/10",
    icon: "text-rose-600 dark:text-rose-400",
    label: "text-muted",
  },
  brand: {
    border: "border-l-brand",
    bg: "bg-brand-muted",
    icon: "text-brand",
    label: "text-muted",
  },
};

export function DashboardKpiCard({
  label,
  value,
  icon: Icon,
  accent = "neutral",
  subtitle,
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  accent?: Accent;
  subtitle?: string;
  className?: string;
}) {
  const s = accentStyles[accent];
  return (
    <div
      className={cn(
        "rounded-xl border border-border overflow-hidden border-l-4 transition-shadow hover:shadow-md",
        s.border,
        s.bg,
        className
      )}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={cn("text-xs font-medium uppercase tracking-wider", s.label)}>{label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-text truncate">{value}</p>
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
          {Icon && (
            <div className={cn("shrink-0 rounded-lg p-2", s.icon)}>
              <Icon className="h-5 w-5" aria-hidden />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
