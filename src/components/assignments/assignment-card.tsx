import Link from "next/link";

import { SubmissionStatusBadge } from "@/components/assignments/submission-status-badge";
import type { StudentAssignmentItem } from "@/lib/data/assignments";
import { formatDateTime } from "@/lib/format";

export function AssignmentCard({ item }: { item: StudentAssignmentItem }) {
  const { assignment, submission } = item;
  const overdue =
    !!assignment.due_at && new Date(assignment.due_at) < new Date();

  return (
    <Link
      href={`/dashboard/assignments/${assignment.id}`}
      className="block rounded-xl border border-black/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-white/10 dark:bg-zinc-950"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="truncate font-medium tracking-tight">
            {assignment.title}
          </h3>
          {assignment.due_at && (
            <p
              className={`text-xs ${
                overdue && !submission
                  ? "text-red-600 dark:text-red-400"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              Due {formatDateTime(assignment.due_at)}
            </p>
          )}
        </div>
        {submission ? (
          <SubmissionStatusBadge status={submission.status} />
        ) : (
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            Not started
          </span>
        )}
      </div>
      {submission?.score != null && (
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Score:{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {submission.score}
            {assignment.max_score != null && ` / ${assignment.max_score}`}
          </span>
        </p>
      )}
    </Link>
  );
}
