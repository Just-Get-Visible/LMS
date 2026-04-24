import Link from "next/link";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RecentProgressItem } from "@/lib/data/progress";

export function RecentProgressWidget({
  items,
}: {
  items: RecentProgressItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Your recent lesson activity will appear here.
          </p>
        ) : (
          <ul className="divide-y divide-black/5 dark:divide-white/5">
            {items.map(({ progress, lesson, course }) => (
              <li
                key={progress.id}
                className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 space-y-1">
                  <p className="truncate text-sm font-medium">
                    {lesson?.title ?? "Lesson"}
                  </p>
                  {course && (
                    <Link
                      href={`/courses/${course.slug}`}
                      className="block truncate text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                    >
                      {course.title}
                    </Link>
                  )}
                </div>
                <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                  {progress.is_completed
                    ? "Completed"
                    : `${Math.round(Number(progress.progress_percent ?? 0))}%`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
