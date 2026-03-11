import Link from "next/link";
import { ArrowRight, Sparkles, TerminalSquare, BookOpen, Trophy } from "lucide-react";
import { Container, Card, Button, A } from "@/components/ui";

function Feature({
  icon: Icon,
  title,
  desc
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-2xl bg-white/5 border border-border flex items-center justify-center">
          <Icon className="h-5 w-5 text-brand" />
        </div>
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-muted mt-1">{desc}</div>
        </div>
      </div>
    </Card>
  );
}

export default function HomePage() {
  return (
    <main>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(1000px_400px_at_50%_-80px,rgba(109,94,241,0.40),transparent)]" />
        <Container className="py-14 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/5 px-3 py-1 text-xs text-muted">
              <Sparkles className="h-4 w-4 text-brand" />
              Built for learners who want real practice
            </div>
            <h1 className="mt-6 text-4xl md:text-5xl font-extrabold tracking-tight">
              Learn. Practice. Compete.
              <span className="block text-muted font-semibold mt-2">
                A clean, fast coding platform with modern UX.
              </span>
            </h1>
            <p className="mt-5 text-base text-muted leading-relaxed">
              CodeForge is an MVP workspace inspired by platforms like CodeChef: curated learning tracks, a practice
              library, contests, and a lightweight in-browser editor.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/practice">
                <Button>
                  Start practice <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant="ghost">Explore courses</Button>
              </Link>
            </div>

            <div className="mt-8 text-sm text-muted">
              Want it to feel even closer to CodeChef? We can add: auth, submissions, a real judge worker, leaderboards,
              and payments.
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-12">
            <Feature
              icon={TerminalSquare}
              title="Practice library"
              desc="Browse problems by difficulty & tags. Open a problem and code instantly."
            />
            <Feature icon={BookOpen} title="Course catalog" desc="Tracks with modules, projects, and checkpoints." />
            <Feature icon={Trophy} title="Contests" desc="A contest shell with standings + future scheduling." />
          </div>

          <div className="mt-10 text-sm text-muted">
            Quick links: <A href="/practice">Practice</A> · <A href="/courses">Courses</A> ·{" "}
            <A href="/contests">Contests</A>
          </div>
        </Container>
      </div>
    </main>
  );
}

