import { CohortPublicCard } from "@/components/cohorts/cohort-public-card";
import { EmptyState } from "@/components/ui/empty-state";
import { listPublicCohorts } from "@/lib/data/cohorts";

export const metadata = {
  title: "Cohorts",
};

export default async function CohortsPage() {
  const items = await listPublicCohorts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Cohorts</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Open and running cohorts you can join.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No cohorts open right now"
          description="Check back soon — new cohorts open up regularly."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ cohort, course }) => (
            <CohortPublicCard
              key={cohort.id}
              cohort={cohort}
              courseTitle={course?.title}
            />
          ))}
        </div>
      )}
    </div>
  );
}
