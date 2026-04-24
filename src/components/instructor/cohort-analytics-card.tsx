import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CohortAnalytics } from "@/lib/data/instructor";

interface Props {
  analytics: CohortAnalytics;
}

export function CohortAnalyticsCard({ analytics }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
        <CardDescription>
          Engagement and progress for this cohort.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Stat
            label="Active enrolments"
            value={analytics.activeEnrolments.toLocaleString()}
            sub={
              analytics.completedEnrolments > 0
                ? `${analytics.completedEnrolments} completed`
                : undefined
            }
          />
          <Stat
            label="Sessions held"
            value={`${analytics.sessionsHeld} / ${analytics.sessionsScheduled}`}
          />
          <Stat
            label="Avg. attendance"
            value={
              analytics.sessionsHeld > 0
                ? `${analytics.attendanceRatePercent}%`
                : "—"
            }
          />
          <Stat
            label="Avg. progress"
            value={`${analytics.averageProgressPercent}%`}
          />
          <Stat
            label="Pending submissions"
            value={analytics.pendingSubmissions.toLocaleString()}
          />
        </dl>
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div>
      <dt className="text-xs text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tracking-tight">{value}</dd>
      {sub && (
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          {sub}
        </p>
      )}
    </div>
  );
}
