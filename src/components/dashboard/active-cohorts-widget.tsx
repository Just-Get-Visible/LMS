import Link from "next/link";

import { CohortStatusBadge } from "@/components/cohorts/cohort-status-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ActiveCohortItem } from "@/lib/data/cohorts";
import { formatDateTime } from "@/lib/format";

export function ActiveCohortsWidget({ items }: { items: ActiveCohortItem[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Cohorts</CardTitle>
        {items.length > 0 && (
          <Link
            href="/dashboard/cohorts"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            All →
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            You&apos;re not in any cohorts.
          </p>
        ) : (
          <ul className="space-y-4">
            {items.map(({ enrolment, cohort, course }) => (
              <li key={enrolment.id} className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/dashboard/cohorts/${cohort.id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {cohort.name}
                  </Link>
                  <CohortStatusBadge status={cohort.status} />
                </div>
                {course && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {course.title}
                  </p>
                )}
                {cohort.starts_at && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Starts {formatDateTime(cohort.starts_at)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
