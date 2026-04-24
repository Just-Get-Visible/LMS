import Link from "next/link";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/user";
import { getStudentQuizzes } from "@/lib/data/quizzes";

export const metadata = {
  title: "Quizzes",
};

export default async function StudentQuizzesPage() {
  const user = await requireUser();
  const quizzes = await getStudentQuizzes(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Quizzes</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Quizzes available across your enrolled courses.
        </p>
      </div>

      {quizzes.length === 0 ? (
        <EmptyState
          title="No quizzes yet"
          description="When an instructor adds a quiz to one of your courses, it will appear here."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-black/5 dark:divide-white/5">
              {quizzes.map((quiz) => (
                <li key={quiz.id}>
                  <Link
                    href={`/dashboard/quizzes/${quiz.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-sm font-medium">
                        {quiz.title}
                      </p>
                      {quiz.pass_percent != null && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Pass mark {quiz.pass_percent}%
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-sm text-zinc-600 dark:text-zinc-400">
                      Open →
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
