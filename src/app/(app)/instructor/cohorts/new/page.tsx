import Link from "next/link";

import { CohortCreateForm } from "@/components/instructor/cohort-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/user";
import { getInstructorCourses } from "@/lib/data/instructor";

export const metadata = {
  title: "New cohort · Instructor",
};

export default async function NewCohortPage() {
  const user = await requireUser();
  const courses = await getInstructorCourses(user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New cohort</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Cohorts run a course on a schedule with a fixed group of students.
        </p>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          title="No courses yet"
          description="Create a course first — cohorts run alongside courses."
          action={
            <Link
              href="/instructor/courses/new"
              className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
            >
              Create your first course →
            </Link>
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Cohort details</CardTitle>
            <CardDescription>
              You can edit everything later, including dates and capacity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CohortCreateForm
              courses={courses.map((c) => ({ id: c.id, title: c.title }))}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
