import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { LearningSidebar } from "@/components/learning/learning-sidebar";
import { ProgressIndicator } from "@/components/learning/progress-indicator";
import { requireUser } from "@/lib/auth/user";
import { getCourseCurriculum } from "@/lib/data/courses";
import { canAccessCourseContent } from "@/lib/data/enrolments";
import {
  getCompletedLessonIds,
  getCourseProgressForUser,
} from "@/lib/data/progress";
import { createClient } from "@/lib/supabase/server";

type Params = Promise<{ courseId: string }>;

export default async function CourseLearningLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Params;
}) {
  const { courseId } = await params;
  const user = await requireUser();

  const canAccess = await canAccessCourseContent(user.id, courseId);
  if (!canAccess) notFound();

  const supabase = await createClient();
  const { data: course } = await supabase
    .from("courses")
    .select("id, title")
    .eq("id", courseId)
    .maybeSingle();

  if (!course) notFound();

  const [curriculum, completedLessonIds, courseProgress] = await Promise.all([
    getCourseCurriculum(courseId),
    getCompletedLessonIds(user.id, courseId),
    getCourseProgressForUser(user.id, courseId),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <LearningSidebar
        courseId={courseId}
        courseTitle={course.title}
        sections={curriculum}
        completedLessonIds={completedLessonIds}
      />
      <div className="min-w-0 space-y-6">
        <ProgressIndicator progress={courseProgress} />
        {children}
      </div>
    </div>
  );
}
