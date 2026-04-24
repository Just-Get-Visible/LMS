import Link from "next/link";

import { ThreadCreateForm } from "@/components/discussions/thread-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/user";
import { getActiveCohortsForUser } from "@/lib/data/cohorts";
import { getEnrolledCoursesForUser } from "@/lib/data/enrolments";

export const metadata = {
  title: "New thread",
};

export default async function NewThreadPage() {
  const user = await requireUser();
  const [enrolledCourses, activeCohorts] = await Promise.all([
    getEnrolledCoursesForUser(user.id),
    getActiveCohortsForUser(user.id),
  ]);

  if (enrolledCourses.length === 0 && activeCohorts.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">New thread</h1>
        <EmptyState
          title="Nothing to post in"
          description="Enrol in a course or cohort first."
          action={
            <Link
              href="/courses"
              className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
            >
              Browse courses →
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New thread</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Start a discussion in one of your courses or cohorts.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Thread details</CardTitle>
        </CardHeader>
        <CardContent>
          <ThreadCreateForm
            cohorts={activeCohorts.map((c) => ({
              id: c.cohort.id,
              label: c.cohort.name,
            }))}
            courses={enrolledCourses.map((c) => ({
              id: c.course.id,
              label: c.course.title,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
