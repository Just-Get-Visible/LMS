import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types";

type LessonRef = Pick<Tables<"lessons">, "id" | "title">;
type CourseRef = Pick<Tables<"courses">, "id" | "slug" | "title">;

export type RecentProgressItem = {
  progress: Tables<"lesson_progress">;
  lesson: LessonRef | null;
  course: CourseRef | null;
};

export async function getRecentLessonProgress(
  userId: string,
  limit = 5,
): Promise<RecentProgressItem[]> {
  const supabase = await createClient();
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (!progress || progress.length === 0) return [];

  const lessonIds = [...new Set(progress.map((p) => p.lesson_id))];
  const courseIds = [...new Set(progress.map((p) => p.course_id))];

  const [lessonsRes, coursesRes] = await Promise.all([
    supabase.from("lessons").select("id, title").in("id", lessonIds),
    supabase.from("courses").select("id, slug, title").in("id", courseIds),
  ]);

  const lessonMap = new Map(
    (lessonsRes.data ?? []).map((l) => [l.id, l]),
  );
  const courseMap = new Map(
    (coursesRes.data ?? []).map((c) => [c.id, c]),
  );

  return progress.map((p) => ({
    progress: p,
    lesson: lessonMap.get(p.lesson_id) ?? null,
    course: courseMap.get(p.course_id) ?? null,
  }));
}

export async function getCourseProgressForUser(
  userId: string,
  courseId: string,
): Promise<Tables<"course_progress"> | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("course_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  return data;
}

export async function getLessonProgress(
  userId: string,
  lessonId: string,
): Promise<Tables<"lesson_progress"> | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();
  return data;
}

export async function getCompletedLessonIds(
  userId: string,
  courseId: string,
): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("is_completed", true);
  return (data ?? []).map((row) => row.lesson_id);
}

export async function trackLessonView(
  userId: string,
  courseId: string,
  lessonId: string,
): Promise<void> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  await supabase
    .from("lesson_progress")
    .upsert(
      {
        user_id: userId,
        course_id: courseId,
        lesson_id: lessonId,
        started_at: now,
        last_viewed_at: now,
      },
      { onConflict: "user_id,lesson_id", ignoreDuplicates: true },
    );

  await supabase
    .from("lesson_progress")
    .update({ last_viewed_at: now })
    .eq("user_id", userId)
    .eq("lesson_id", lessonId);
}
