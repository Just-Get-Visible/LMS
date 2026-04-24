import Link from "next/link";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { EnrolledCourseItem } from "@/lib/data/enrolments";

export function EnrolledCoursesWidget({
  items,
}: {
  items: EnrolledCourseItem[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Your courses</CardTitle>
        <Link
          href="/courses"
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Browse →
        </Link>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            You aren&apos;t enrolled in any courses yet.{" "}
            <Link
              href="/courses"
              className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
            >
              Browse the catalogue →
            </Link>
          </p>
        ) : (
          <ul className="divide-y divide-black/5 dark:divide-white/5">
            {items.map(({ enrolment, course, progress }) => {
              const percent = Number(progress?.progress_percent ?? 0);
              return (
                <li
                  key={enrolment.id}
                  className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="hidden h-12 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-900 sm:block">
                    {course.thumbnail_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={course.thumbnail_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <Link
                      href={`/dashboard/courses/${course.id}`}
                      className="block truncate text-sm font-medium hover:underline"
                    >
                      {course.title}
                    </Link>
                    <ProgressBar percent={percent} />
                  </div>
                  <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                    {progress
                      ? `${progress.completed_lessons_count}/${progress.total_lessons_count}`
                      : "Not started"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  const value = Math.max(0, Math.min(100, percent));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
      <div
        className="h-full bg-zinc-900 transition-[width] dark:bg-zinc-100"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
