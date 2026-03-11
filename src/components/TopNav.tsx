import Link from "next/link";
import { Code, Trophy, BookOpen, TerminalSquare, LogIn, BarChart3, List, User, CreditCard, Shield } from "lucide-react";
import { Container } from "@/components/ui";
import { cn } from "@/lib/cn";

const nav = [
  { href: "/practice", label: "Practice", icon: TerminalSquare },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/contests", label: "Contests", icon: Trophy },
  { href: "/submissions", label: "Submissions", icon: List },
  { href: "/leaderboard", label: "Leaderboard", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
  { href: "/admin", label: "Admin", icon: Shield }
];

export function TopNav({ className }: { className?: string }) {
  return (
    <div className={cn("sticky top-0 z-50 border-b border-border bg-bg/70 backdrop-blur", className)}>
      <Container className="h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-brand/20 border border-brand/30 flex items-center justify-center">
            <Code className="h-5 w-5 text-brand" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-wide">CodeForge</div>
            <div className="text-xs text-muted">learn • practice • compete</div>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          {nav.map((n) => {
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted hover:text-text hover:bg-white/5 transition"
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </div>

        <Link
          href="/login"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm border border-border bg-white/5 hover:bg-white/10 transition"
        >
          <LogIn className="h-4 w-4" />
          Sign in
        </Link>
      </Container>
    </div>
  );
}

