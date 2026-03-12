import * as React from "react";
import { Card } from "@/components/ui";
import { cn } from "@/lib/cn";

type Accent = "none" | "brand" | "success" | "warning" | "danger";

const accentBorder: Record<Accent, string> = {
  none: "",
  brand: "border-l-4 border-l-brand",
  success: "border-l-4 border-l-emerald-500",
  warning: "border-l-4 border-l-amber-500",
  danger: "border-l-4 border-l-rose-500",
};

export function DashboardCard({
  accent = "none",
  className,
  children,
}: {
  accent?: Accent;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn(accent !== "none" && accentBorder[accent], className)}>
      {children}
    </Card>
  );
}
