import Link from "next/link";
import { notFound } from "next/navigation";

import { QuizResults } from "@/components/quizzes/quiz-results";
import { QuizTakeForm } from "@/components/quizzes/quiz-take-form";
import { requireUser } from "@/lib/auth/user";
import { canAccessCourseContent } from "@/lib/data/enrolments";
import {
  getAttemptById,
  getQuizById,
  getQuizQuestionsWithOptions,
} from "@/lib/data/quizzes";

type Params = Promise<{ id: string; attemptId: string }>;

export const metadata = {
  title: "Quiz attempt",
};

export default async function QuizAttemptPage({
  params,
}: {
  params: Params;
}) {
  const { id, attemptId } = await params;
  const user = await requireUser();

  const quiz = await getQuizById(id);
  if (!quiz) notFound();

  const canAccess = await canAccessCourseContent(user.id, quiz.course_id);
  if (!canAccess) notFound();

  const attempt = await getAttemptById(attemptId);
  if (
    !attempt ||
    attempt.user_id !== user.id ||
    attempt.quiz_id !== id
  ) {
    notFound();
  }

  const entries = await getQuizQuestionsWithOptions(id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/dashboard/quizzes/${id}`}
          className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← Back to quiz
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {quiz.title}
        </h1>
      </div>

      {attempt.submitted_at ? (
        <QuizResults quiz={quiz} attempt={attempt} entries={entries} />
      ) : entries.length === 0 ? (
        <p className="rounded-md bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
          This quiz has no questions yet.
        </p>
      ) : (
        <QuizTakeForm
          quiz={quiz}
          attempt={attempt}
          entries={entries}
        />
      )}
    </div>
  );
}
