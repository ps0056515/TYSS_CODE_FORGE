import { Container, Card } from "@/components/ui";
import { getUserAsync, isAdminUser } from "@/lib/auth";
import Link from "next/link";
import {
  listOrganizations,
  listAllBusinessUnits,
  listAllBatches,
  listAllAssignments,
} from "@/lib/assignment-platform-store";
import { loadAllSubmissionsCached, isAtRiskRuleBased } from "@/lib/dashboard-metrics";
import { listEnrolments } from "@/lib/assignment-platform-store";
import { formatDateTimeIST } from "@/lib/datetime";
import {
  DashboardKpiCard,
  DashboardSection,
  DashboardCard,
} from "@/components/dashboard";
import {
  Users,
  Building2,
  Clock,
  AlertTriangle,
  LayoutGrid,
  Briefcase,
  Layers,
  ListChecks,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await getUserAsync();
  const isAdmin = isAdminUser(user);
  if (!user || !isAdmin) {
    return (
      <Container className="py-10">
        <Card className="p-6">
          <div className="text-xs tracking-[0.35em] text-muted">ADMIN</div>
          <h2 className="text-2xl font-extrabold mt-2">Access restricted</h2>
          <p className="text-sm text-muted mt-2">Admins only.</p>
        </Card>
      </Container>
    );
  }

  const [orgs, bus, batches, assignments] = await Promise.all([
    listOrganizations(),
    listAllBusinessUnits(),
    listAllBatches(),
    listAllAssignments(),
  ]);

  const subs = await loadAllSubmissionsCached();
  const nowIso = new Date().toISOString();

  const subsIndex = (() => {
    const byUser = new Map<string, { lastAt?: string; bestBySlug: Map<string, number> }>();
    for (const s of subs) {
      const curr = byUser.get(s.user) ?? { bestBySlug: new Map<string, number>(), lastAt: undefined };
      const prev = curr.bestBySlug.get(s.problemSlug) ?? -1;
      if (s.score > prev) curr.bestBySlug.set(s.problemSlug, s.score);
      if (!curr.lastAt || s.createdAt > curr.lastAt) curr.lastAt = s.createdAt;
      byUser.set(s.user, curr);
    }
    return byUser;
  })();

  const active7d = (() => {
    const since = Date.now() - 7 * 24 * 3600 * 1000;
    const set = new Set<string>();
    for (const s of subs) {
      if (new Date(s.createdAt).getTime() >= since) set.add(s.user);
    }
    return set.size;
  })();

  const assignmentStats = await Promise.all(
    assignments.map(async (a) => {
      const enrol = await listEnrolments(a.id);
      return { a, enrol };
    })
  );
  let overdueStudents = 0;
  let atRiskStudents = 0;
  for (const { a, enrol } of assignmentStats) {
    if (a.type !== "coding_set" || !(a.codingSet?.problemSlugs?.length)) continue;
    const slugs = a.codingSet.problemSlugs;
    const threshold = a.codingSet.completionScoreThreshold ?? 100;
    for (const e of enrol) {
      const userIdx = subsIndex.get(e.userId);
      const best = userIdx?.bestBySlug ?? new Map<string, number>();
      const lastAt = userIdx?.lastAt;
      let solved = 0;
      for (const slug of slugs) {
        const sc = best.get(slug) ?? -1;
        if (sc >= threshold) solved++;
      }
      const completionPct = slugs.length ? solved / slugs.length : 0;
      if (nowIso > a.dueAt && completionPct < 1) overdueStudents++;
      const risk = isAtRiskRuleBased({ nowIso, dueAtIso: a.dueAt, completionPct, lastActivityIso: lastAt });
      if (risk.atRisk) atRiskStudents++;
    }
  }

  const orgById = new Map(orgs.map((o) => [o.id, o]));
  const buById = new Map(bus.map((b) => [b.id, b]));
  const batchById = new Map(batches.map((b) => [b.id, b]));

  const needsAttention = assignments
    .filter((a) => a.type === "coding_set")
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
    .slice(0, 6);

  return (
    <Container className="py-8 md:py-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-text transition mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Admin
      </Link>

      <header className="mb-10">
        <p className="text-xs font-medium uppercase tracking-widest text-muted">Executive dashboard</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-text md:text-4xl">
          Overview
        </h1>
        <p className="mt-2 text-sm text-muted max-w-xl">
          High-level metrics, quick access to organizations, business units, batches, and assignment dashboards.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <Link
          href="/admin/dashboard/active-learners"
          className="block rounded-xl transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:ring-offset-2 focus:ring-offset-bg"
        >
          <DashboardKpiCard
            label="Active learners (7 days)"
            value={active7d}
            icon={Users}
            accent="success"
            subtitle="Click to view list"
          />
        </Link>
        <DashboardKpiCard
          label="Organizations"
          value={orgs.length}
          icon={Building2}
          accent="brand"
          subtitle="Total orgs"
        />
        <Link
          href="/admin/dashboard/overdue"
          className="block rounded-xl transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:ring-offset-2 focus:ring-offset-bg"
        >
          <DashboardKpiCard
            label="Overdue students"
            value={overdueStudents}
            icon={Clock}
            accent="warning"
            subtitle="Click to view list"
          />
        </Link>
        <Link
          href="/admin/dashboard/at-risk"
          className="block rounded-xl transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:ring-offset-2 focus:ring-offset-bg"
        >
          <DashboardKpiCard
            label="At-risk flags"
            value={atRiskStudents}
            icon={AlertTriangle}
            accent="danger"
            subtitle="Click to view list"
          />
        </Link>
      </div>

      <DashboardSection
        title="Quick access"
        description="Jump to orgs, business units, and batches"
        icon={LayoutGrid}
        action={
          <Link
            href="/admin/organizations"
            className="text-sm font-medium text-brand hover:underline inline-flex items-center gap-1"
          >
            Manage all
            <ChevronRight className="h-4 w-4" />
          </Link>
        }
      >
        <div className="grid md:grid-cols-3 gap-4">
          <DashboardCard className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-text">Organizations</h3>
                <p className="text-xs text-muted">{orgs.length} total</p>
              </div>
            </div>
            <ul className="space-y-2">
              {orgs.slice(0, 5).map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/organizations/${o.id}`}
                    className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-text hover:bg-black/5 dark:hover:bg-white/5 transition group"
                  >
                    <span className="truncate">{o.name}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted group-hover:text-brand transition" />
                  </Link>
                </li>
              ))}
              {orgs.length === 0 && <p className="text-sm text-muted py-2">No organizations yet.</p>}
            </ul>
            <Link
              href="/admin/organizations"
              className="mt-3 inline-block text-sm text-muted hover:text-brand transition"
            >
              Manage organizations →
            </Link>
          </DashboardCard>

          <DashboardCard className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-text">Business Units</h3>
                <p className="text-xs text-muted">{bus.length} total</p>
              </div>
            </div>
            <ul className="space-y-2">
              {bus.slice(0, 5).map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/admin/business-units/${b.id}`}
                    className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-text hover:bg-black/5 dark:hover:bg-white/5 transition group"
                  >
                    <span className="truncate">{b.name}</span>
                    <span className="text-xs text-muted shrink-0">{orgById.get(b.organizationId)?.name ?? "—"}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted group-hover:text-brand transition" />
                  </Link>
                </li>
              ))}
              {bus.length === 0 && <p className="text-sm text-muted py-2">No business units yet.</p>}
            </ul>
          </DashboardCard>

          <DashboardCard className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-text">Batches</h3>
                <p className="text-xs text-muted">{batches.length} total</p>
              </div>
            </div>
            <ul className="space-y-2">
              {batches.slice(0, 5).map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/admin/batches/${b.id}`}
                    className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-text hover:bg-black/5 dark:hover:bg-white/5 transition group"
                  >
                    <span className="truncate">{b.name}</span>
                    <span className="text-xs text-muted shrink-0">{buById.get(b.businessUnitId)?.name ?? "—"}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted group-hover:text-brand transition" />
                  </Link>
                </li>
              ))}
              {batches.length === 0 && <p className="text-sm text-muted py-2">No batches yet.</p>}
            </ul>
          </DashboardCard>
        </div>
      </DashboardSection>

      <DashboardSection
        title="Assignment dashboards"
        description="Open invite link, view enrolled students, and track progress"
        icon={ListChecks}
        className="mt-12"
      >
        {assignments.length === 0 ? (
          <DashboardCard className="p-8 text-center">
            <p className="font-semibold text-text">No assignments yet</p>
            <p className="text-sm text-muted mt-1">Create a batch first, then add assignments inside the batch.</p>
            <Link href="/admin/organizations" className="inline-flex mt-4 text-sm font-medium text-brand hover:underline">
              Start setup →
            </Link>
          </DashboardCard>
        ) : (
          <div className="space-y-3">
            {assignments.map((a) => (
              <DashboardCard key={a.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-text truncate">{a.title}</h3>
                    <p className="text-sm text-muted mt-0.5">
                      {batchById.get(a.batchId)?.name && <span className="text-muted">{batchById.get(a.batchId)?.name} · </span>}
                      Due {formatDateTimeIST(a.dueAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Link
                      href={`/admin/batches/${a.batchId}`}
                      className="text-sm text-muted hover:text-text transition"
                    >
                      Open batch
                    </Link>
                    <Link
                      href={`/admin/assignments/${a.id}/dashboard`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
                    >
                      Dashboard
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </DashboardCard>
            ))}
          </div>
        )}
      </DashboardSection>

      {needsAttention.length > 0 && (
        <DashboardSection
          title="Needs attention"
          description="Coding assignments that may need follow-up (due date, at-risk students)"
          icon={AlertTriangle}
          className="mt-12"
        >
          <div className="space-y-3">
            {needsAttention.map((a) => (
              <DashboardCard key={a.id} accent="warning" className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-text truncate">{a.title}</h3>
                    <p className="text-sm text-muted mt-0.5">
                      Due {new Date(a.dueAt).toLocaleString()} · {a.codingSet?.problemSlugs?.length ?? 0} problems
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Link
                      href={`/admin/batches/${a.batchId}/command`}
                      className="text-sm text-muted hover:text-text transition"
                    >
                      Command Center
                    </Link>
                    <Link
                      href={`/admin/assignments/${a.id}/dashboard`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
                    >
                      Dashboard
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </DashboardCard>
            ))}
          </div>
        </DashboardSection>
      )}
    </Container>
  );
}
