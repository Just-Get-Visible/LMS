import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CourseAnalytics } from "@/lib/data/instructor";
import { formatPrice } from "@/lib/format";

interface Props {
  analytics: CourseAnalytics;
}

export function CourseAnalyticsCard({ analytics }: Props) {
  const totalEnrolments =
    analytics.activeEnrolments + analytics.completedEnrolments;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
        <CardDescription>
          Activity for this course. Numbers update in real time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Stat
            label="Active enrolments"
            value={analytics.activeEnrolments.toLocaleString()}
            sub={
              analytics.enrolmentsLast7Days > 0
                ? `+${analytics.enrolmentsLast7Days} in last 7 days`
                : undefined
            }
          />
          <Stat
            label="Completed"
            value={analytics.completedEnrolments.toLocaleString()}
            sub={
              totalEnrolments > 0
                ? `${analytics.completionRate}% completion rate`
                : undefined
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
          <Stat
            label="Revenue"
            value={
              analytics.totalRevenue > 0
                ? formatPrice(
                    analytics.totalRevenue,
                    analytics.revenueCurrency,
                    false,
                  )
                : "—"
            }
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
