/** Verdict codes from judge */
export type VerdictCode = "AC" | "PARTIAL" | "WA" | "RE" | "TLE";

/** Human-readable labels for submission verdicts */
export function verdictLabel(v: string | null | undefined): string {
  switch (v) {
    case "AC": return "Passed";
    case "WA": return "Failed (Wrong Answer)";
    case "RE": return "Failed (Compilation / Runtime Error)";
    case "TLE": return "Failed (Time Limit Exceeded)";
    case "PARTIAL": return "Partially Correct";
    default: return v ? String(v) : "—";
  }
}

/** Tailwind classes for verdict text color */
export function verdictColorClass(v: string | null | undefined): string {
  switch (v) {
    case "AC": return "text-emerald-300";
    case "PARTIAL": return "text-amber-300";
    case "WA":
    case "RE":
    case "TLE":
      return "text-rose-300";
    default:
      return "text-muted";
  }
}
