import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/user";
import { getCourseCurriculum } from "@/lib/data/courses";
import { createClient } from "@/lib/supabase/server";

type Params = Promise<{ courseId: string }>;

export default async function CourseLearningOverviewPage({
  params,
}: {
  params: Params;
}) {
  const { courseId } = await params;
  const user = await requireUser();
  const sections = await getCourseCurriculum(courseId);

  const curriculumLessonIds = new Set(
    sections.flatMap((s) => s.lessons.map((l) => l.id)),
  );
  if (curriculumLessonIds.size === 0) {
    return (
      <div className="rounded-xl border border-dashed border-black/10 bg-white p-8 text-center text-sm text-zinc-600 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-400">
        This course doesn&apos;t have any published lessons yet.
      </div>
    );
  }

  // Pick up where the student left off. Skip any progress rows pointing
  // at lessons the instructor has since deleted or unpublished.
  const supabase = await createClient();
  const { data: recent } = await supabase
    .from("lesson_progress")
    .select("lesson_id, last_viewed_at")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .not("last_viewed_at", "is", null)
    .order("last_viewed_at", { ascending: false })
    .limit(10);

  const resumeId = (recent ?? []).find((r) =>
    curriculumLessonIds.has(r.lesson_id),
  )?.lesson_id;

  const target =
    resumeId ??
    sections.find((s) => s.lessons.length > 0)!.lessons[0].id;

  redirect(`/dashboard/courses/${courseId}/lessons/${target}`);
}
