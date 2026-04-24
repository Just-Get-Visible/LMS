import Link from "next/link";

import { CohortStatusBadge } from "@/components/cohorts/cohort-status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/user";
import { getInstructorCohorts } from "@/lib/data/cohorts";
import { formatDateTime } from "@/lib/format";

export const metadata = {
  title: "Cohorts · Instructor",
};

export default async function InstructorCohortsPage() {
  const user = await requireUser();
  const cohorts = await getInstructorCohorts(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cohorts</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Cohorts you instruct or mentor.
          </p>
        </div>
        <Link href="/instructor/cohorts/new">
          <Button>New cohort</Button>
        </Link>
      </div>

      {cohorts.length === 0 ? (
        <EmptyState
          title="No cohorts yet"
          description="Create your first cohort to start scheduling sessions and enrolling students."
          action={
            <Link href="/instructor/cohorts/new">
              <Button>Create cohort</Button>
            </Link>
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your cohorts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-black/5 dark:divide-white/5">
              {cohorts.map((cohort) => (
                <li
                  key={cohort.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 space-y-1">
                    <Link
                      href={`/instructor/cohorts/${cohort.id}`}
                      className="block truncate text-sm font-medium hover:underline"
                    >
                      {cohort.name}
                    </Link>
                    <p className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      {cohort.starts_at && (
                        <span>Starts {formatDateTime(cohort.starts_at)}</span>
                      )}
                      {cohort.capacity && (
                        <>
                          <span>·</span>
                          <span>Capacity {cohort.capacity}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <CohortStatusBadge status={cohort.status} />
                    <Link
                      href={`/instructor/cohorts/${cohort.id}`}
                      className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    >
                      Manage →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
