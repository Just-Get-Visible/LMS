import Link from "next/link";

import { CohortStatusBadge } from "@/components/cohorts/cohort-status-badge";
import { formatDateTime, formatPrice } from "@/lib/format";
import type { Tables } from "@/types";

export function CohortPublicCard({
  cohort,
  courseTitle,
}: {
  cohort: Tables<"cohorts">;
  courseTitle?: string;
}) {
  return (
    <Link
      href={`/cohorts/${cohort.slug}`}
      className="block rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-white/10 dark:bg-zinc-950"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="truncate font-semibold tracking-tight">
            {cohort.name}
          </h3>
          {courseTitle && (
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              {courseTitle}
            </p>
          )}
        </div>
        <CohortStatusBadge status={cohort.status} />
      </div>
      <dl className="mt-3 space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        {cohort.starts_at && (
          <div className="flex justify-between gap-2">
            <dt>Starts</dt>
            <dd className="font-medium text-zinc-700 dark:text-zinc-300">
              {formatDateTime(cohort.starts_at)}
            </dd>
          </div>
        )}
        {cohort.capacity && (
          <div className="flex justify-between gap-2">
            <dt>Capacity</dt>
            <dd className="font-medium text-zinc-700 dark:text-zinc-300">
              {cohort.capacity}
            </dd>
          </div>
        )}
        <div className="flex justify-between gap-2">
          <dt>Price</dt>
          <dd className="font-medium text-zinc-700 dark:text-zinc-300">
            {formatPrice(
              cohort.price_amount,
              cohort.currency_code,
              cohort.price_amount === 0,
            )}
          </dd>
        </div>
      </dl>
    </Link>
  );
}
