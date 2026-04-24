import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { InstructorCourseSummary } from "@/lib/data/instructor";
import { formatDeliveryType } from "@/lib/format";

export function InstructorCoursesWidget({
  items,
}: {
  items: InstructorCourseSummary[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Your courses</CardTitle>
        <div className="flex items-center gap-2">
          <Link href="/instructor/courses">
            <Button variant="ghost" size="sm">
              Manage
            </Button>
          </Link>
          <Link href="/instructor/courses/new">
            <Button size="sm">New</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            You haven&apos;t created any courses yet.{" "}
            <Link
              href="/instructor/courses/new"
              className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
            >
              Create your first →
            </Link>
          </p>
        ) : (
          <ul className="divide-y divide-black/5 dark:divide-white/5">
            {items.slice(0, 5).map((course) => (
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
        )}
      </CardContent>
    </Card>
  );
}
