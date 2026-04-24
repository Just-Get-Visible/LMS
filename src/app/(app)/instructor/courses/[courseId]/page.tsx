import Link from "next/link";
import { notFound } from "next/navigation";

import type { LandingPageData } from "@/components/courses/course-landing-page";
import { CourseActionsBar } from "@/components/instructor/course-actions-bar";
import { CourseAnalyticsCard } from "@/components/instructor/course-analytics-card";
import { CourseEditForm } from "@/components/instructor/course-form";
import { CourseRoster } from "@/components/instructor/course-roster";
import { LandingPageEditor } from "@/components/instructor/landing-page-editor";
import { ModuleListEditor } from "@/components/instructor/module-list-editor";
import { AddResourceForm } from "@/components/resources/add-resource-form";
import { InstructorResourceList } from "@/components/resources/instructor-resource-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isAdmin } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";
import { getCourseStudents } from "@/lib/data/courses";
import { isCourseInstructor } from "@/lib/data/enrolments";
import { getCourseAnalytics } from "@/lib/data/instructor";
import { getLessonsForCourse } from "@/lib/data/lessons";
import { getModulesForCourse } from "@/lib/data/modules";
import { getCourseLevelResources } from "@/lib/data/resources";
import { createClient } from "@/lib/supabase/server";

type Params = Promise<{ courseId: string }>;

export const metadata = {
  title: "Edit course · Instructor",
};

export default async function InstructorCoursePage({
  params,
}: {
  params: Params;
}) {
  const { courseId } = await params;
  const user = await requireUser();

  const canEdit =
    (await isCourseInstructor(user.id, courseId)) || (await isAdmin(user.id));
  if (!canEdit) notFound();

  const supabase = await createClient();
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .maybeSingle();

  if (!course) notFound();

  const [modules, lessons, courseResources, analytics, students] =
    await Promise.all([
      getModulesForCourse(courseId),
      getLessonsForCourse(courseId),
      getCourseLevelResources(courseId),
      getCourseAnalytics(courseId),
      getCourseStudents(courseId),
    ]);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/instructor/courses"
            className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            ← All courses
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {course.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
              {course.slug}
            </code>
          </p>
        </div>
        <Link
          href={`/courses/${course.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          View public page →
        </Link>
      </div>

      <CourseActionsBar course={course} />

      <CourseAnalyticsCard analytics={analytics} />

      <Card>
        <CardHeader>
          <CardTitle>Course details</CardTitle>
        </CardHeader>
        <CardContent>
          <CourseEditForm course={course} />
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Curriculum</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Organise your course into modules and lessons. Drag-free reorder
            with the arrow buttons.
          </p>
        </div>
        <ModuleListEditor
          courseId={courseId}
          modules={modules}
          lessons={lessons}
        />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Students ({students.length})
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Add students by email and manage their enrolment. Admin adds
            bypass payment.
          </p>
        </div>
        <CourseRoster courseId={courseId} students={students} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Course resources
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Resources attached to the course (not a specific lesson).
          </p>
        </div>
        <InstructorResourceList resources={courseResources} />
        <Card>
          <CardHeader>
            <CardTitle>Add resource</CardTitle>
            <CardDescription>
              Upload a file or link to an external URL.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddResourceForm courseId={courseId} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Launch landing page
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Build the marketing-style landing page for this course. When
            published, it replaces the catalog view at the public URL.
          </p>
        </div>
        <LandingPageEditor
          courseId={courseId}
          courseSlug={course.slug}
          initial={
            ((course as unknown as {
              landing_page: LandingPageData | null;
            }).landing_page) ?? null
          }
        />
      </section>
    </div>
  );
}
