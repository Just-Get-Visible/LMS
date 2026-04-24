import { notFound } from "next/navigation";

import { LessonCompletionToggle } from "@/components/learning/lesson-completion-toggle";
import {
  LessonNavigationFooter,
  LessonProgressHeader,
} from "@/components/learning/lesson-chrome";
import { LessonViewer } from "@/components/learning/lesson-viewer";
import { ResourceList } from "@/components/resources/resource-list";
import { requireUser } from "@/lib/auth/user";
import { getCourseCurriculum } from "@/lib/data/courses";
import { getLessonUnlockTime } from "@/lib/data/drip";
import { getLessonById } from "@/lib/data/lessons";
import { getLessonProgress, trackLessonView } from "@/lib/data/progress";
import { getResourcesForLesson } from "@/lib/data/resources";
import { createClient } from "@/lib/supabase/server";

type Params = Promise<{ courseId: string; lessonId: string }>;

export default async function LessonPage({ params }: { params: Params }) {
  const { courseId, lessonId } = await params;
  const user = await requireUser();

  const lesson = await getLessonById(lessonId);
  if (!lesson || lesson.course_id !== courseId) notFound();

  const unlockAt = await getLessonUnlockTime(user.id, lessonId);
  if (unlockAt) return <LockedLesson title={lesson.title} unlockAt={unlockAt} />;

  await trackLessonView(user.id, courseId, lessonId);

  const supabase = await createClient();
  const [progress, resources, sections, courseRow, completedRows] =
    await Promise.all([
      getLessonProgress(user.id, lessonId),
      getResourcesForLesson(lessonId),
      getCourseCurriculum(courseId),
      supabase
        .from("courses")
        .select("title")
        .eq("id", courseId)
        .maybeSingle(),
      supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .eq("is_completed", true),
    ]);

  const completedLessonIds = new Set(
    (completedRows.data ?? []).map((r) => r.lesson_id),
  );

  return (
    <div className="space-y-8">
      <LessonProgressHeader
        courseId={courseId}
        courseTitle={courseRow.data?.title ?? "Course"}
        currentLessonId={lessonId}
        sections={sections}
        completedLessonIds={completedLessonIds}
      />

      <LessonViewer lesson={lesson} />

      <LessonCompletionToggle
        lessonId={lesson.id}
        initialCompleted={progress?.is_completed ?? false}
      />

      <ResourceList resources={resources} title="Lesson resources" />

      <LessonNavigationFooter
        courseId={courseId}
        currentLessonId={lessonId}
        sections={sections}
      />
    </div>
  );
}

function LockedLesson({
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
    <div className="rounded-xl border border-dashed border-black/10 bg-white p-8 text-center dark:border-white/10 dark:bg-zinc-950">
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
        This lesson unlocks on <strong>{when}</strong>.
      </p>
    </div>
  );
}
