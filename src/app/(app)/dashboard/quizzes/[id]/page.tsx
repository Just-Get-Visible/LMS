import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { startAttemptAction } from "@/lib/actions/quiz-attempts";
import { requireUser } from "@/lib/auth/user";
import { getInheritedUnlockTime } from "@/lib/data/drip";
import { canAccessCourseContent } from "@/lib/data/enrolments";
import { getQuizById, getStudentAttempts } from "@/lib/data/quizzes";
import { formatDateTime } from "@/lib/format";

type Params = Promise<{ id: string }>;

export const metadata = {
  title: "Quiz",
};

export default async function StudentQuizStartPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const user = await requireUser();

  const quiz = await getQuizById(id);
  if (!quiz) notFound();

  const canAccess = await canAccessCourseContent(user.id, quiz.course_id);
  if (!canAccess) notFound();

  const unlockAt = await getInheritedUnlockTime(user.id, quiz.lesson_id);
  if (unlockAt) return <LockedPanel title={quiz.title} unlockAt={unlockAt} />;

  const attempts = await getStudentAttempts(user.id, id);
  const submittedAttempts = attempts.filter((a) => a.submitted_at);
  const inProgress = attempts.find((a) => !a.submitted_at);

  const limitReached =
    quiz.attempts_allowed != null &&
    submittedAttempts.length >= quiz.attempts_allowed;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/dashboard/quizzes"
          className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← All quizzes
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {quiz.title}
        </h1>
        {quiz.description && (
          <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
            {quiz.description}
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz info</CardTitle>
          <CardDescription>Read these before you start.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <Stat
              label="Time limit"
              value={
                quiz.time_limit_minutes
                  ? `${quiz.time_limit_minutes} min`
                  : "None"
              }
            />
            <Stat
              label="Pass mark"
              value={
                quiz.pass_percent != null ? `${quiz.pass_percent}%` : "—"
              }
            />
            <Stat
              label="Attempts"
              value={
                quiz.attempts_allowed != null
                  ? `${submittedAttempts.length} / ${quiz.attempts_allowed}`
                  : `${submittedAttempts.length} taken`
              }
            />
          </dl>

          {inProgress ? (
            <Link
              href={`/dashboard/quizzes/${quiz.id}/attempts/${inProgress.id}`}
              className="block"
            >
              <Button>Resume attempt</Button>
            </Link>
          ) : limitReached ? (
            <p className="rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              You&apos;ve used all your attempts.
            </p>
          ) : (
            <form action={startAttemptAction.bind(null, quiz.id)}>
              <Button type="submit">Start attempt</Button>
            </form>
          )}
        </CardContent>
      </Card>

      {submittedAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Past attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-black/5 dark:divide-white/5">
              {submittedAttempts.map((attempt) => (
                <li key={attempt.id}>
                  <Link
                    href={`/dashboard/quizzes/${quiz.id}/attempts/${attempt.id}`}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:underline"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-medium">
                        {attempt.score_percent ?? 0}% ·{" "}
                        {attempt.passed === true
                          ? "Passed"
                          : attempt.passed === false
                            ? "Did not pass"
                            : "—"}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {formatDateTime(attempt.submitted_at)}
                      </p>
                    </div>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      View →
                    </span>
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

function LockedPanel({
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
          This quiz unlocks on <strong>{when}</strong>.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}
