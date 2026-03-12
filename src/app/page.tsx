import Link from "next/link";
import { ArrowRight, Sparkles, TerminalSquare, BookOpen, Trophy, CheckCircle2, ShieldCheck, Zap, Code2 } from "lucide-react";
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

function QuickChip({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-full border border-border bg-white/5 hover:bg-white/10 hover:border-white/20 transition px-3 py-1.5 text-sm text-text"
    >
      {label}
    </Link>
  );
}

export default function HomePage() {
  return (
    <main>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_500px_at_50%_-120px,rgba(109,94,241,0.25),transparent_60%)]" />
        <Container className="py-16 md:py-20 relative">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
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

              <div className="mt-5 grid gap-2 text-sm text-muted max-w-2xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand" />
                  Instant run, samples, and graded submissions (hidden tests)
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand" />
                  Project-based assessment: upload ZIP → use-case score
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/practice">
                  <Button className="shadow-glow/40">
                    Start practice <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/compiler">
                  <Button variant="ghost">Open compiler</Button>
                </Link>
                <Link href="/courses">
                  <Button variant="ghost">Explore courses</Button>
                </Link>
              </div>

              {/* Quick browse chips */}
              <div className="mt-8">
                <div className="text-xs tracking-[0.35em] text-muted uppercase">Quick browse</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <QuickChip href="/practice/data-structures/arrays" label="Arrays" />
                  <QuickChip href="/practice/data-structures/strings" label="Strings" />
                  <QuickChip href="/practice/algorithms/binary-search" label="Binary Search" />
                  <QuickChip href="/practice/algorithms/dp" label="Dynamic Programming" />
                  <QuickChip href="/practice/company/company-amazon" label="Amazon Prep" />
                  <QuickChip href="/practice/company/company-google" label="Google Prep" />
                  <QuickChip href="/practice/projects/project" label="Projects (Use-cases)" />
                </div>
              </div>
            </div>

            {/* Hero preview (static) */}
            <div className="hidden lg:block">
              <Card className="p-0 overflow-hidden">
                <div className="h-2 bg-[linear-gradient(90deg,#426BFF,#6D5EF1,#D9A300,#10B981)]" />
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-xl bg-brand/20 border border-brand/30 flex items-center justify-center">
                        <Code2 className="h-4 w-4 text-brand" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-text">Practice + Compiler</div>
                        <div className="text-xs text-muted">Run → Samples → Submit</div>
                      </div>
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full border border-border bg-white/5 text-muted">
                      Live preview
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-border bg-white/5 p-3">
                      <div className="text-xs text-muted uppercase">Problem</div>
                      <div className="mt-1 text-sm font-semibold text-text">Sum of Two Numbers</div>
                      <div className="mt-2 text-xs text-muted line-clamp-3">
                        Given two integers a and b, print their sum. Verify your I/O setup.
                      </div>
                      <div className="mt-3 flex gap-2">
                        <span className="text-[11px] px-2 py-1 rounded-full border bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300">
                          Easy
                        </span>
                        <span className="text-[11px] px-2 py-1 rounded-full border bg-brand/10 border-brand/25 text-brand">
                          Arrays
                        </span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-border bg-[#1e1e1e] p-3">
                      <div className="text-xs text-white/50 uppercase">Editor</div>
                      <pre className="mt-2 text-[12px] leading-relaxed text-white/90 font-mono whitespace-pre-wrap">
{`function solve(input) {
  const [a,b] = input.trim().split(/\\s+/).map(Number);
  return String(a + b);
}
console.log(solve(require("fs").readFileSync(0,"utf8")));`}
                      </pre>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[11px] px-2 py-1 rounded border border-white/10 bg-white/5 text-white/70">
                          Run
                        </span>
                        <span className="text-[11px] px-2 py-1 rounded border border-white/10 bg-white/5 text-white/70">
                          Run Samples
                        </span>
                        <span className="text-[11px] px-2 py-1 rounded border border-brand/40 bg-brand/20 text-white/90 ml-auto">
                          Submit
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
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

      {/* Stats */}
      <Container className="py-14">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { k: "Problems", v: "100+", d: "Curated practice across DSA + interview prep" },
            { k: "Languages", v: "4", d: "JS, Python, Java, C++ (more can be added)" },
            { k: "Projects", v: "Use-cases", d: "Submit ZIPs and get behaviour-based scoring" },
          ].map((x) => (
            <Card key={x.k} className="p-6">
              <div className="text-xs text-muted">{x.k}</div>
              <div className="mt-2 text-2xl font-extrabold text-text">{x.v}</div>
              <div className="mt-2 text-sm text-muted">{x.d}</div>
            </Card>
          ))}
        </div>
      </Container>

      {/* How it works */}
      <div className="border-t border-border bg-black/5">
        <Container className="py-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-text">How CodeForge works</h2>
          <p className="text-sm text-muted mt-2 max-w-3xl">
            Learn concepts, practice systematically, and measure progress with submissions and leaderboards.
          </p>

          <div className="grid md:grid-cols-3 gap-5 mt-8">
            <Card className="p-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-muted border border-brand/20 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-brand" />
                </div>
                <div>
                  <div className="font-semibold text-text">Practice in browser</div>
                  <div className="text-sm text-muted mt-1">
                    Use the editor to run code instantly and submit against hidden tests.
                  </div>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-muted border border-brand/20 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-brand" />
                </div>
                <div>
                  <div className="font-semibold text-text">Project-based assessment</div>
                  <div className="text-sm text-muted mt-1">
                    Upload a ZIP; we run instructor test suites and score per use case.
                  </div>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-muted border border-brand/20 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-brand" />
                </div>
                <div>
                  <div className="font-semibold text-text">Track progress</div>
                  <div className="text-sm text-muted mt-1">
                    See your submissions history, solved status, and leaderboards.
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </div>

      {/* FAQ */}
      <Container className="py-14">
        <h2 className="text-2xl md:text-3xl font-extrabold text-text">FAQ</h2>
        <div className="mt-6 grid gap-3">
          {[
            {
              q: "How are algorithm submissions scored?",
              a: "We run your code against hidden tests. Output is normalized (trim + line endings) and must match expected output exactly. Score is 100 for AC, 0 otherwise (or 0–100 for subtask scoring).",
            },
            {
              q: "How are project submissions scored?",
              a: "You upload a ZIP. We run the instructor test suite for the project and score based on passed use cases (passed/total × 100).",
            },
            {
              q: "Which languages are supported?",
              a: "Currently JavaScript, Python, Java, and C++ for algorithm problems. Project problems can define their own run configuration.",
            },
          ].map((x) => (
            <details key={x.q} className="rounded-2xl border border-border bg-card/60 p-5">
              <summary className="cursor-pointer text-text font-semibold">{x.q}</summary>
              <p className="mt-2 text-sm text-muted leading-relaxed">{x.a}</p>
            </details>
          ))}
        </div>
      </Container>

      {/* Final CTA */}
      <div className="border-t border-border bg-[radial-gradient(900px_400px_at_50%_0,rgba(109,94,241,0.18),transparent_70%)]">
        <Container className="py-14">
          <Card className="p-7 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-2xl">
                <div className="text-xs tracking-[0.35em] text-muted uppercase">Get started</div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-text mt-2">
                  Ready to start practicing?
                </h2>
                <p className="text-sm text-muted mt-2">
                  Pick a topic, solve problems, and submit projects to validate real-world behaviour.
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/practice">
                  <Button>
                    Start practice <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="ghost">Sign in</Button>
                </Link>
              </div>
            </div>
          </Card>
        </Container>
      </div>
    </main>
  );
}

