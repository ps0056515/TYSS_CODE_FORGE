import { Container, Card } from "@/components/ui";

const plans = [
  {
    name: "Free",
    price: "₹0",
    desc: "Practice basics and explore the platform.",
    features: ["Practice problems", "Sample tests", "Public leaderboards", "Basic courses (preview)"]
  },
  {
    name: "Pro",
    price: "₹299/mo",
    desc: "Serious prep with advanced tooling.",
    features: ["Unlimited submissions", "Advanced analytics", "Private contests", "Certificates", "Priority support"]
  },
  {
    name: "Enterprise",
    price: "Contact",
    desc: "For colleges & orgs — dashboards and custom curricula.",
    features: ["Custom learning paths", "Admin dashboards", "SSO/RBAC", "On-prem options", "SLA support"]
  }
];

export default function PricingPage() {
  return (
    <Container className="py-10">
      <div>
        <div className="text-xs tracking-[0.35em] text-muted">PRICING</div>
        <h2 className="text-2xl font-extrabold mt-2">Plans</h2>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          MVP pricing page. Next: payment integration + plan gating.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-8">
        {plans.map((p) => (
          <Card key={p.name} className="p-6">
            <div className="text-sm font-semibold">{p.name}</div>
            <div className="mt-2 text-3xl font-extrabold">{p.price}</div>
            <div className="mt-2 text-sm text-muted">{p.desc}</div>
            <div className="mt-4 grid gap-2">
              {p.features.map((f) => (
                <div key={f} className="text-sm text-muted rounded-xl border border-border bg-white/5 px-3 py-2">
                  {f}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </Container>
  );
}

