import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PendingSubmissionItem } from "@/lib/data/instructor";
import { formatDateTime } from "@/lib/format";

export function InstructorSubmissionsWidget({
  items,
}: {
  items: PendingSubmissionItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Submissions to review</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No submissions waiting for review.
          </p>
        ) : (
          <ul className="divide-y divide-black/5 dark:divide-white/5">
            {items.map(({ submission, assignment, student }) => (
              <li
                key={submission.id}
                className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 space-y-1">
                  <p className="truncate text-sm font-medium">
                    {assignment?.title ?? "Assignment"}
                  </p>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {student?.full_name?.trim() ||
                      student?.email ||
                      "Student"}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                  {formatDateTime(submission.submitted_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
