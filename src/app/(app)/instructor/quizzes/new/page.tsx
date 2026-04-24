import Link from "next/link";

import { QuizCreateForm } from "@/components/quizzes/quiz-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/user";
import { getInstructorCourses } from "@/lib/data/instructor";

export const metadata = {
  title: "New quiz · Instructor",
};

export default async function NewQuizPage() {
  const user = await requireUser();
  const courses = await getInstructorCourses(user.id);

  if (courses.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">New quiz</h1>
        <EmptyState
          title="No courses yet"
          description="Create a course first — quizzes belong to a course."
          action={
            <Link
              href="/instructor/courses/new"
              className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
            >
              Create your first course →
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New quiz</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Add the basics now — you&apos;ll add questions on the next screen.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz details</CardTitle>
          <CardDescription>You can edit everything later.</CardDescription>
        </CardHeader>
        <CardContent>
          <QuizCreateForm
            courses={courses.map((c) => ({ id: c.id, label: c.title }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
