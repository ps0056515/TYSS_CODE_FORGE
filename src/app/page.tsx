import Link from "next/link";
import { ArrowRight, Sparkles, TerminalSquare, BookOpen, Trophy } from "lucide-react";
import { Container, Card, Button, A } from "@/components/ui";

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <Card className="p-6 transition hover:border-white/15 hover:shadow-glow/30">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-brand-muted border border-brand/20 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-brand" />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-text">{title}</div>
          <div className="text-sm text-muted mt-1 leading-relaxed">{desc}</div>
        </div>
      </div>
    </Card>
  );
}

export default function HomePage() {
  return (
    <main>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_500px_at_50%_-120px,rgba(109,94,241,0.25),transparent_60%)]" />
        <Container className="py-16 md:py-20 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-muted px-3 py-1.5 text-xs font-medium text-brand">
              <Sparkles className="h-3.5 w-3.5" />
              Built for learners who want real practice
            </div>
            <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-text">
              Learn. Practice. Compete.
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted max-w-2xl leading-relaxed">
              A clean, fast coding platform with a modern editor, instant run, submissions, and leaderboards.
            </p>
            <p className="mt-3 text-sm text-muted max-w-2xl">
              CodeForge gives you curated problems, courses, and contests—in-browser coding with JS, Python, Java, and C++.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link href="/practice">
                <Button className="shadow-glow/40">
                  Start practice <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant="ghost">Explore courses</Button>
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mt-14">
            <Feature
              icon={TerminalSquare}
              title="Practice library"
              desc="Browse by difficulty and tags. Write code in the editor and run against samples or submit for grading."
            />
            <Feature icon={BookOpen} title="Course catalog" desc="Structured tracks with modules and checkpoints." />
            <Feature icon={Trophy} title="Contests & leaderboard" desc="Compete and see standings per problem or globally." />
          </div>

          <div className="mt-12 pt-8 border-t border-border text-sm text-muted">
            <A href="/practice">Practice</A>
            <span className="mx-2">·</span>
            <A href="/courses">Courses</A>
            <span className="mx-2">·</span>
            <A href="/contests">Contests</A>
            <span className="mx-2">·</span>
            <A href="/leaderboard">Leaderboard</A>
            <span className="mx-2">·</span>
            <A href="/login">Sign in</A>
          </div>
        </Container>
      </div>
    </main>
  );
}

