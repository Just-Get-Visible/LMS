import Link from "next/link";
import { notFound } from "next/navigation";

import { AddQuestionForm } from "@/components/quizzes/add-question-form";
import { QuestionEditor } from "@/components/quizzes/question-editor";
import { QuizEditForm } from "@/components/quizzes/quiz-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deleteQuizAction } from "@/lib/actions/quizzes";
import { isAdmin } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";
import { isCourseInstructor } from "@/lib/data/enrolments";
import {
  getQuizById,
  getQuizQuestionsWithOptions,
} from "@/lib/data/quizzes";

type Params = Promise<{ id: string }>;

export const metadata = {
  title: "Quiz · Instructor",
};

export default async function InstructorQuizPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const user = await requireUser();

  const quiz = await getQuizById(id);
  if (!quiz) notFound();

  const canManage =
    (await isCourseInstructor(user.id, quiz.course_id)) ||
    (await isAdmin(user.id));
  if (!canManage) notFound();

  const entries = await getQuizQuestionsWithOptions(id);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link
          href="/instructor/quizzes"
          className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← All quizzes
        </Link>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {quiz.title}
          </h1>
          <form action={deleteQuizAction.bind(null, quiz.id)}>
            <Button type="submit" variant="destructive" size="sm">
              Delete
            </Button>
          </form>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz settings</CardTitle>
        </CardHeader>
        <CardContent>
          <QuizEditForm quiz={quiz} />
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Questions</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Add questions, then mark one option as the correct answer.
          </p>
        </div>
        <QuestionEditor quizId={quiz.id} entries={entries} />
        <Card>
          <CardHeader>
            <CardTitle>Add question</CardTitle>
            <CardDescription>
              You&apos;ll add answer options after the question is created.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddQuestionForm quizId={quiz.id} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
