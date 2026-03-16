"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Code, Trophy, BookOpen, TerminalSquare, LogIn, LogOut, BarChart3, List, User, CreditCard, Shield, Sun, Moon, Wrench, ClipboardList, FileCheck2 } from "lucide-react";
import { Container } from "@/components/ui";
import { cn } from "@/lib/cn";

const nav: Array<{ href: string; label: string; icon: React.ElementType; title?: string }> = [
  { href: "/practice", label: "Practice", icon: TerminalSquare },
  { href: "/assignments", label: "Assignments", icon: ClipboardList, title: "My assignments & assessments" },
  { href: "/assessments", label: "Assessments", icon: FileCheck2, title: "My assessments" },
  { href: "/compiler", label: "Compiler", icon: Wrench },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/contests", label: "Contests", icon: Trophy },
  { href: "/submissions", label: "Submissions", icon: List },
  { href: "/leaderboard", label: "Leaderboard", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
];

function isActive(href: string, pathname: string | null) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function TopNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [meUser, setMeUser] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [moreOpen, setMoreOpen] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: { user?: string }) => (d?.user ? setMeUser(d.user) : setMeUser(null)));
  }, []);
  const isSignedIn = status === "authenticated" || !!meUser;
  const isDark = mounted && resolvedTheme === "dark";
  // Display name: prefer session name/email (OAuth), then API user (email or username)
  const displayUser =
    (session?.user as { name?: string; email?: string } | undefined)?.name ||
    (session?.user as { name?: string; email?: string } | undefined)?.email ||
    meUser ||
    null;

  return (
    <header className={cn("sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md w-full", className)}>
      <Container className="h-14 md:h-16 flex items-center justify-between gap-2 min-w-0">
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-3 shrink-0 rounded-lg py-1.5 -ml-1.5 transition hover:opacity-90 min-w-0"
        >
          <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-brand/20 border border-brand/30 flex items-center justify-center shadow-glow/50 shrink-0">
            <Code className="h-4 w-4 md:h-5 md:w-5 text-brand" />
          </div>
          <div className="leading-tight hidden sm:block min-w-0">
            <div className="text-sm font-bold tracking-tight truncate">CodeForge</div>
            <div className="text-xs md:text-sm text-muted truncate">learn · practice · compete</div>
          </div>
        </Link>

        <nav
          className="hidden md:flex items-center gap-0.5 min-w-0 flex-1 justify-start px-2 mr-2"
          aria-label="Main navigation"
        >
          {nav
            .filter((n) => ["/practice", "/assignments", "/assessments", "/compiler"].includes(n.href))
            .filter((n) => !(isSignedIn && n.href === "/profile"))
            .map((n) => {
              const Icon = n.icon;
              const active = isActive(n.href, pathname);
              const title = n.title;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  title={title}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition shrink-0 min-w-0",
                    active
                      ? "text-brand bg-brand-muted border border-brand/20"
                      : "text-muted hover:text-text hover:bg-white/5 border border-transparent"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="whitespace-nowrap" title={title || n.label}>
                    {n.label}
                  </span>
                </Link>
              );
            })}

          {/* More dropdown for less-frequent links */}
          <div className="relative ml-1">
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium border transition shrink-0",
                "text-muted hover:text-text hover:bg-white/5 border-border",
                moreOpen && "bg-white/10 text-text"
              )}
            >
              <span>More</span>
            </button>
            {moreOpen && (
              <div
                className="absolute right-0 mt-1 min-w-[180px] rounded-xl border border-border bg-bg shadow-lg py-1 z-50"
                onMouseLeave={() => setMoreOpen(false)}
              >
                {nav
                  .filter(
                    (n) =>
                      !["/practice", "/assignments", "/assessments", "/compiler"].includes(n.href)
                  )
                  .filter((n) => !(isSignedIn && n.href === "/profile"))
                  .map((n) => {
                    const Icon = n.icon;
                    const active = isActive(n.href, pathname);
                    const title = n.title;
                    return (
                      <Link
                        key={n.href}
                        href={n.href}
                        title={title}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 text-sm transition",
                          active ? "text-brand bg-brand-muted" : "text-muted hover:text-text hover:bg-white/5"
                        )}
                        onClick={() => setMoreOpen(false)}
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden />
                        <span className="whitespace-nowrap" title={title || n.label}>
                          {n.label}
                        </span>
                      </Link>
                    );
                  })}
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium border transition shrink-0",
              isActive("/admin", pathname)
                ? "text-brand bg-brand-muted border-brand/20"
                : "text-muted hover:text-text hover:bg-white/5 border-border"
            )}
          >
            <Shield className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">Admin</span>
          </Link>
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-bg text-muted hover:text-text hover:bg-brand-muted transition shrink-0"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {mounted && (isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
          </button>
          {isSignedIn ? (
          <>
            {displayUser && (
              <Link
                href="/profile"
                className="hidden sm:flex items-center gap-2 rounded-lg px-3 py-2 border border-border bg-white/5 dark:bg-white/5 min-w-0 max-w-[180px] lg:max-w-[220px] hover:bg-white/10 hover:border-white/15 transition"
                title={`Signed in as ${displayUser}`}
              >
                <User className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                <span className="text-sm text-muted truncate" title={displayUser}>
                  {displayUser}
                </span>
              </Link>
            )}
            <Link
              href="/api/auth/signout-custom"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border border-border bg-white/5 hover:bg-white/10 hover:border-white/15 transition shrink-0"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Link>
          </>
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
      {/* Mobile: scrollable nav strip (scrollbar hidden for clean look) */}
      <div className="md:hidden border-t border-border bg-card/50 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1 px-4 py-2 min-w-max">
          {displayUser && (
            <Link href="/profile" className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted bg-white/5 border border-border shrink-0 mr-1 hover:text-text transition" title={`Profile: ${displayUser}`}>
              <User className="h-3.5 w-3.5" />
              <span className="max-w-[120px] truncate">{displayUser}</span>
            </Link>
          )}
          {nav
            .filter((n) => !(isSignedIn && n.href === "/profile"))
            .map((n) => {
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
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition shrink-0",
              isActive("/admin", pathname) ? "text-brand bg-brand-muted" : "text-muted hover:text-text hover:bg-white/5"
            )}
          >
            <Shield className="h-3.5 w-3.5" />
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}

