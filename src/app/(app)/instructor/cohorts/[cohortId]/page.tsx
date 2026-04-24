import Link from "next/link";
import { notFound } from "next/navigation";

import { CohortStatusBadge } from "@/components/cohorts/cohort-status-badge";
import { CohortAnalyticsCard } from "@/components/instructor/cohort-analytics-card";
import { CohortEditForm } from "@/components/instructor/cohort-form";
import { CohortInstructorsPanel } from "@/components/instructor/cohort-instructors-panel";
import { CohortRoster } from "@/components/instructor/cohort-roster";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isAdmin } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";
import {
  getCohortById,
  getCohortInstructors,
  getCohortStudents,
} from "@/lib/data/cohorts";
import { isCohortInstructor } from "@/lib/data/enrolments";
import { getCohortAnalytics } from "@/lib/data/instructor";

type Params = Promise<{ cohortId: string }>;

export const metadata = {
  title: "Cohort · Instructor",
};

export default async function InstructorCohortPage({
  params,
}: {
  params: Params;
}) {
  const { cohortId } = await params;
  const user = await requireUser();

  const canManage =
    (await isCohortInstructor(user.id, cohortId)) || (await isAdmin(user.id));
  if (!canManage) notFound();

  const cohort = await getCohortById(cohortId);
  if (!cohort) notFound();

  const [students, instructors, analytics] = await Promise.all([
    getCohortStudents(cohortId),
    getCohortInstructors(cohortId),
    getCohortAnalytics(cohortId),
  ]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link
          href="/instructor/cohorts"
          className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← All cohorts
        </Link>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {cohort.name}
          </h1>
          <CohortStatusBadge status={cohort.status} />
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
            {cohort.slug}
          </code>
        </p>
      </div>

      <CohortAnalyticsCard analytics={analytics} />

      <Card>
        <CardHeader>
          <CardTitle>Cohort details</CardTitle>
        </CardHeader>
        <CardContent>
          <CohortEditForm cohort={cohort} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mentors &amp; instructors</CardTitle>
          <CardDescription>
            Anyone added here can manage this cohort and its roster.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CohortInstructorsPanel
            cohortId={cohort.id}
            instructors={instructors}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roster ({students.length})</CardTitle>
          <CardDescription>
            Add students by email and manage their enrolment status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CohortRoster cohortId={cohort.id} students={students} />
        </CardContent>
      </Card>
    </div>
  );
}
