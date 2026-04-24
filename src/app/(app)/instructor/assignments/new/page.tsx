import Link from "next/link";

import { AssignmentCreateForm } from "@/components/assignments/assignment-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/user";
import { getInstructorCohorts } from "@/lib/data/cohorts";
import { getInstructorCourses } from "@/lib/data/instructor";

export const metadata = {
  title: "New assignment · Instructor",
};

export default async function NewAssignmentPage() {
  const user = await requireUser();
  const [courses, cohorts] = await Promise.all([
    getInstructorCourses(user.id),
    getInstructorCohorts(user.id),
  ]);

  if (courses.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          New assignment
        </h1>
        <EmptyState
          title="No courses yet"
          description="Create a course first — assignments belong to a course."
          action={
            <Link
              href="/instructor/courses/new"
              className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
            >
              Create your first course →
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          New assignment
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Create an assignment students can submit to.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignment details</CardTitle>
          <CardDescription>You can edit everything later.</CardDescription>
        </CardHeader>
        <CardContent>
          <AssignmentCreateForm
            courses={courses.map((c) => ({ id: c.id, label: c.title }))}
            cohorts={cohorts.map((c) => ({ id: c.id, label: c.name }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
