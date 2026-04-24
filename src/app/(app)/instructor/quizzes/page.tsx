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
import { getInstructorQuizzes } from "@/lib/data/quizzes";

export const metadata = {
  title: "Quizzes · Instructor",
};

export default async function InstructorQuizzesPage() {
  const user = await requireUser();
  const quizzes = await getInstructorQuizzes(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Quizzes</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Multiple-choice quizzes for your courses.
          </p>
        </div>
        <Link href="/instructor/quizzes/new">
          <Button>New quiz</Button>
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <EmptyState
          title="No quizzes yet"
          description="Create your first quiz to test student understanding."
          action={
            <Link href="/instructor/quizzes/new">
              <Button>Create quiz</Button>
            </Link>
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-black/5 dark:divide-white/5">
              {quizzes.map((quiz) => (
                <li
                  key={quiz.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 space-y-1">
                    <Link
                      href={`/instructor/quizzes/${quiz.id}`}
                      className="block truncate text-sm font-medium hover:underline"
                    >
                      {quiz.title}
                    </Link>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {quiz.pass_percent != null && `Pass ${quiz.pass_percent}%`}
                      {quiz.attempts_allowed != null &&
                        ` · ${quiz.attempts_allowed} attempts`}
                    </p>
                  </div>
                  <Link
                    href={`/instructor/quizzes/${quiz.id}`}
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
