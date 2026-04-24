import Link from "next/link";
import { notFound } from "next/navigation";

import { StudentSubmissionForm } from "@/components/assignments/student-submission-form";
import { SubmissionFileButton } from "@/components/assignments/submission-file-button";
import { SubmissionStatusBadge } from "@/components/assignments/submission-status-badge";
import { Markdown } from "@/components/markdown";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUser } from "@/lib/auth/user";
import {
  getAssignmentById,
  getMySubmissionsForAssignment,
} from "@/lib/data/assignments";
import { getInheritedUnlockTime } from "@/lib/data/drip";
import { canAccessCourseContent } from "@/lib/data/enrolments";
import { formatDateTime } from "@/lib/format";

type Params = Promise<{ id: string }>;

export const metadata = {
  title: "Assignment",
};

export default async function StudentAssignmentDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const user = await requireUser();

  const assignment = await getAssignmentById(id);
  if (!assignment) notFound();

  const canAccess = await canAccessCourseContent(
    user.id,
    assignment.course_id,
  );
  if (!canAccess) notFound();

  const unlockAt = await getInheritedUnlockTime(user.id, assignment.lesson_id);
  if (unlockAt) {
    return <LockedAssignment title={assignment.title} unlockAt={unlockAt} />;
  }

  const submissions = await getMySubmissionsForAssignment(user.id, id);
  const draft = submissions.find((s) => s.status === "draft") ?? null;
  const latestFinal = submissions.find((s) => s.status !== "draft") ?? null;
  const currentSubmission = draft ?? latestFinal;
  const history = latestFinal ? submissions : [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <Link
          href="/dashboard/assignments"
          className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← All assignments
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          {assignment.title}
        </h1>
        {assignment.due_at && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Due {formatDateTime(assignment.due_at)}
          </p>
        )}
      </div>

      {assignment.instructions && (
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <Markdown className="text-sm">{assignment.instructions}</Markdown>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your submission</CardTitle>
          <CardDescription>
            {assignment.allow_multiple_submissions
              ? "You can submit multiple times."
              : "You get one submission for this assignment."}
            {assignment.allow_late_submissions
              ? " Late submissions are allowed."
              : " Late submissions are not allowed."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StudentSubmissionForm
            assignment={assignment}
            currentSubmission={currentSubmission}
          />
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Submission history</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-black/5 dark:divide-white/5">
              {history.map((sub) => (
                <li
                  key={sub.id}
                  className="space-y-2 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {sub.submitted_at
                        ? formatDateTime(sub.submitted_at)
                        : "Not submitted"}
                    </p>
                    <SubmissionStatusBadge status={sub.status} />
                  </div>
                  {sub.feedback && (
                    <div>
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        Instructor feedback
                      </p>
                      <p className="mt-1 whitespace-pre-wrap rounded-md bg-zinc-50 p-3 text-sm text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                        {sub.feedback}
                      </p>
                    </div>
                  )}
                  {sub.score != null && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Score:{" "}
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">
                        {sub.score}
                        {assignment.max_score != null &&
                          ` / ${assignment.max_score}`}
                      </span>
                    </p>
                  )}
                  {sub.storage_path && (
                    <SubmissionFileButton submissionId={sub.id} />
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LockedAssignment({
  title,
  unlockAt,
}: {
  title: string;
  unlockAt: Date;
}) {
  const when = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  }).format(unlockAt);
  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-xl border border-dashed border-black/10 bg-white p-8 text-center dark:border-white/10 dark:bg-zinc-950">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          This assignment unlocks on <strong>{when}</strong>.
        </p>
      </div>
    </div>
  );
}
