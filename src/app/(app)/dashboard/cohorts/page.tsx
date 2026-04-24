import { CohortCard } from "@/components/cohorts/cohort-card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/user";
import { getActiveCohortsForUser } from "@/lib/data/cohorts";

export const metadata = {
  title: "Cohorts",
};

export default async function StudentCohortsPage() {
  const user = await requireUser();
  const items = await getActiveCohortsForUser(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cohorts</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Cohorts you&apos;re enrolled in.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No cohorts yet"
          description="Once an instructor enrols you in a cohort, it will appear here."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <CohortCard key={item.enrolment.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
