import Link from "next/link";
import { notFound } from "next/navigation";

import { LessonForm } from "@/components/instructor/lesson-form";
import { AddResourceForm } from "@/components/resources/add-resource-form";
import { InstructorResourceList } from "@/components/resources/instructor-resource-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isAdmin } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";
import { isCourseInstructor } from "@/lib/data/enrolments";
import { getLessonById } from "@/lib/data/lessons";
import { getModulesForCourse } from "@/lib/data/modules";
import { getResourcesForLesson } from "@/lib/data/resources";
import { deleteLessonAction } from "@/lib/actions/lessons";

type Params = Promise<{ courseId: string; lessonId: string }>;

export const metadata = {
  title: "Edit lesson · Instructor",
};

export default async function InstructorLessonPage({
  params,
}: {
  params: Params;
}) {
  const { courseId, lessonId } = await params;
  const user = await requireUser();

  const canEdit =
    (await isCourseInstructor(user.id, courseId)) || (await isAdmin(user.id));
  if (!canEdit) notFound();

  const lesson = await getLessonById(lessonId);
  if (!lesson || lesson.course_id !== courseId) notFound();

  const [modules, lessonResources] = await Promise.all([
    getModulesForCourse(courseId),
    getResourcesForLesson(lessonId),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/instructor/courses/${courseId}`}
          className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← Back to course
        </Link>
        <div className="mt-2 flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            {lesson.title}
          </h1>
          <form action={deleteLessonAction.bind(null, courseId, lessonId)}>
            <Button type="submit" variant="destructive" size="sm">
              Delete lesson
            </Button>
          </form>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lesson editor</CardTitle>
        </CardHeader>
        <CardContent>
          <LessonForm lesson={lesson} modules={modules} />
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Lesson resources
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Files and links shown to enrolled students viewing this lesson.
          </p>
        </div>
        <InstructorResourceList resources={lessonResources} />
        <Card>
          <CardHeader>
            <CardTitle>Add resource</CardTitle>
            <CardDescription>
              Upload a file or link to an external URL.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddResourceForm
              courseId={courseId}
              lessonId={lessonId}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
