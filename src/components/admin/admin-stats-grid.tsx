import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AdminStats } from "@/lib/data/admin";
import { formatPrice } from "@/lib/format";

export function AdminStatsGrid({ stats }: { stats: AdminStats }) {
  const revenueDelta = sumAcrossCurrencies(stats.revenueLast30d) -
    sumAcrossCurrencies(stats.revenuePrior30d);
  const revenueTrend = trendLabel(
    sumAcrossCurrencies(stats.revenueLast30d),
    sumAcrossCurrencies(stats.revenuePrior30d),
  );
  const signupTrend = trendLabel(stats.signupsLast30d, stats.signupsPrior30d);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Users" value={stats.totalUsers} />
        <Stat label="Courses" value={stats.totalCourses} />
        <Stat label="Cohorts" value={stats.totalCohorts} />
        <Stat label="Active enrolments" value={stats.activeEnrolments} />
        <Stat label="Paid orders" value={stats.paidOrders} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Revenue (all-time)</CardDescription>
            <CardTitle className="text-2xl tracking-tight">
              {formatRevenue(stats.revenueByCurrency)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Last 30d: {formatRevenue(stats.revenueLast30d)}
              {revenueTrend && (
                <span className="ml-2">
                  ({revenueTrend}
                  {revenueDelta !== 0 && stats.revenueLast30d &&
                    " vs prior 30d"}
                  )
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Signups (last 30d)</CardDescription>
            <CardTitle className="text-2xl tracking-tight">
              {stats.signupsLast30d.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Prior 30d: {stats.signupsPrior30d.toLocaleString()}
              {signupTrend && <span className="ml-2">({signupTrend})</span>}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users by role</CardTitle>
          <CardDescription>
            Total assignments — a single user can hold multiple roles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            {(["admin", "instructor", "student", "staff"] as const).map(
              (role) => (
                <div
                  key={role}
                  className="rounded-md bg-zinc-50 p-3 dark:bg-zinc-900"
                >
                  <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    {role}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {stats.roleCounts[role] ?? 0}
                  </p>
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl tracking-tight">{value}</CardTitle>
      </CardHeader>
      <CardContent />
    </Card>
  );
}

function sumAcrossCurrencies(byCurrency: Record<string, number>): number {
  return Object.values(byCurrency).reduce((s, n) => s + n, 0);
}

function formatRevenue(byCurrency: Record<string, number>): string {
  const entries = Object.entries(byCurrency).filter(([, v]) => v > 0);
  if (entries.length === 0) return "—";
  return entries
    .map(([code, amount]) => formatPrice(amount, code, false))
    .join(" + ");
}

function trendLabel(current: number, prior: number): string | null {
  if (current === 0 && prior === 0) return null;
  if (prior === 0) return "new";
  const pct = Math.round(((current - prior) / prior) * 100);
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct}%`;
}
