"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Code, Trophy, BookOpen, TerminalSquare, LogIn, LogOut, BarChart3, List, User, CreditCard, Shield, Sun, Moon } from "lucide-react";
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
  { href: "/admin", label: "Admin", icon: Shield },
];

function isActive(href: string, pathname: string | null) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function TopNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const { status } = useSession();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [meUser, setMeUser] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: { user?: string }) => (d?.user ? setMeUser(d.user) : null));
  }, []);
  const isSignedIn = status === "authenticated" || !!meUser;
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <header className={cn("sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md", className)}>
      <Container className="h-14 md:h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-3 shrink-0 rounded-lg py-1.5 -ml-1.5 transition hover:opacity-90"
        >
          <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-brand/20 border border-brand/30 flex items-center justify-center shadow-glow/50">
            <Code className="h-4 w-4 md:h-5 md:w-5 text-brand" />
          </div>
          <div className="leading-tight hidden sm:block">
            <div className="text-sm font-bold tracking-tight">CodeForge</div>
            <div className="text-[10px] md:text-xs text-muted">learn · practice · compete</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5">
          {nav.map((n) => {
            const Icon = n.icon;
            const active = isActive(n.href, pathname);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                  active
                    ? "text-brand bg-brand-muted border border-brand/20"
                    : "text-muted hover:text-text hover:bg-white/5 border border-transparent"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-bg text-muted hover:text-text hover:bg-brand-muted transition"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {mounted && (isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
          </button>
          {isSignedIn ? (
          <Link
            href="/api/auth/signout-custom"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border border-border bg-white/5 hover:bg-white/10 hover:border-white/15 transition shrink-0"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border border-border bg-white/5 hover:bg-white/10 hover:border-white/15 transition shrink-0"
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Sign in</span>
          </Link>
        )}
        </div>
      </Container>
      {/* Mobile: scrollable nav strip */}
      <div className="md:hidden border-t border-border bg-card/50 overflow-x-auto">
        <div className="flex items-center gap-1 px-4 py-2 min-w-max">
          {nav.map((n) => {
            const Icon = n.icon;
            const active = isActive(n.href, pathname);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition",
                  active ? "text-brand bg-brand-muted" : "text-muted hover:text-text hover:bg-white/5"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {n.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}

