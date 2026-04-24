import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/user";
import { getInstructorCourses } from "@/lib/data/instructor";
import { formatDeliveryType } from "@/lib/format";

export const metadata = {
  title: "Courses · Instructor",
};

export default async function InstructorCoursesPage() {
  const user = await requireUser();
  const courses = await getInstructorCourses(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Courses</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            All courses you instruct.
          </p>
        </div>
        <Link href="/instructor/courses/new">
          <Button>New course</Button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          title="No courses yet"
          description="Create your first course to start adding modules and lessons."
          action={
            <Link href="/instructor/courses/new">
              <Button>Create course</Button>
            </Link>
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your courses</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-black/5 dark:divide-white/5">
              {courses.map((course) => (
                <li
                  key={course.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 space-y-1">
                    <Link
                      href={`/instructor/courses/${course.id}`}
                      className="block truncate text-sm font-medium hover:underline"
                    >
                      {course.title}
                    </Link>
                    <p className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="capitalize">{course.visibility}</span>
                      <span>·</span>
                      <span>{formatDeliveryType(course.delivery_type)}</span>
                    </p>
                  </div>
                  <Link
                    href={`/instructor/courses/${course.id}`}
                    className="shrink-0 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    Edit →
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
