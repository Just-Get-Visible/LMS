import Link from "next/link";

import { AnnouncementCreateForm } from "@/components/announcements/announcement-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/user";
import { getInstructorCohorts } from "@/lib/data/cohorts";
import { getInstructorCourses } from "@/lib/data/instructor";

export const metadata = {
  title: "New announcement · Instructor",
};

export default async function NewAnnouncementPage() {
  const user = await requireUser();
  const [courses, cohorts] = await Promise.all([
    getInstructorCourses(user.id),
    getInstructorCohorts(user.id),
  ]);

  if (courses.length === 0 && cohorts.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          New announcement
        </h1>
        <EmptyState
          title="Nothing to post to"
          description="Create a course or cohort first — announcements scope to one of them."
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
          New announcement
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Drafts are saved unpublished. Publish to make visible to students.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compose</CardTitle>
        </CardHeader>
        <CardContent>
          <AnnouncementCreateForm
            cohorts={cohorts.map((c) => ({ id: c.id, label: c.name }))}
            courses={courses.map((c) => ({ id: c.id, label: c.title }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
