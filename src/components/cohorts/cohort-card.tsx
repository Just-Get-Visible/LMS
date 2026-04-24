import Link from "next/link";

import { CohortStatusBadge } from "@/components/cohorts/cohort-status-badge";
import type { ActiveCohortItem } from "@/lib/data/cohorts";
import { formatDateTime } from "@/lib/format";

export function CohortCard({ item }: { item: ActiveCohortItem }) {
  const { cohort, course } = item;
  return (
    <Link
      href={`/dashboard/cohorts/${cohort.id}`}
      className="block rounded-xl border border-black/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-white/10 dark:bg-zinc-950"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="truncate font-medium tracking-tight">{cohort.name}</h3>
          {course && (
            <p className="truncate text-sm text-zinc-600 dark:text-zinc-400">
              {course.title}
            </p>
          )}
        </div>
        <CohortStatusBadge status={cohort.status} />
      </div>
      <dl className="mt-4 space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        {cohort.starts_at && (
          <Row label="Starts">{formatDateTime(cohort.starts_at)}</Row>
        )}
        {cohort.ends_at && <Row label="Ends">{formatDateTime(cohort.ends_at)}</Row>}
      </dl>
    </Link>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-2">
      <dt>{label}</dt>
      <dd className="font-medium text-zinc-700 dark:text-zinc-300">
        {children}
      </dd>
    </div>
  );
}
