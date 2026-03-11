import { Container, Card } from "@/components/ui";

const contests = [
  { name: "Weekly Sprint #01", status: "Upcoming", starts: "Sat 7:00 PM IST", duration: "2h" },
  { name: "Starter Arena #12", status: "Planned", starts: "Wed 8:00 PM IST", duration: "1h" }
];

export default function ContestsPage() {
  return (
    <Container className="py-10">
      <div>
        <div className="text-xs tracking-[0.35em] text-muted">CONTESTS</div>
        <h2 className="text-2xl font-extrabold mt-2">Compete</h2>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          Contest module shell. Next: contest registration, live scoreboard, and server-side judging.
        </p>
      </div>

      <div className="mt-8 grid gap-3">
        {contests.map((c) => (
          <Card key={c.name} className="p-5">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-sm text-muted mt-1">
                  {c.starts} · {c.duration}
                </div>
              </div>
              <div className="text-xs px-2 py-1 rounded-full border border-border bg-white/5 text-muted">
                {c.status}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  );
}

