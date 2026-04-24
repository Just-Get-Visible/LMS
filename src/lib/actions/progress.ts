"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/user";
import { maybeIssueCertificate } from "@/lib/data/certificates";
import { getLessonUnlockTime } from "@/lib/data/drip";
import { canAccessCourseContent } from "@/lib/data/enrolments";
import { notifyCertificateIssued } from "@/lib/notifications/fanout";
import { createClient } from "@/lib/supabase/server";

export type ProgressResult = { ok: true } | { ok: false; error: string };

export async function markLessonComplete(
  lessonId: string,
  completed: boolean,
): Promise<ProgressResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in required." };

  const supabase = await createClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, course_id")
    .eq("id", lessonId)
    .maybeSingle();

  if (!lesson) return { ok: false, error: "Lesson not found." };

  const canAccess = await canAccessCourseContent(user.id, lesson.course_id);
  if (!canAccess) return { ok: false, error: "Access denied." };

  if (completed) {
    const unlockAt = await getLessonUnlockTime(user.id, lesson.id);
    if (unlockAt) return { ok: false, error: "This lesson is not yet available." };
  }

  const now = new Date().toISOString();

  const { error: progressError } = await supabase
    .from("lesson_progress")
    .upsert(
      {
        user_id: user.id,
        course_id: lesson.course_id,
        lesson_id: lesson.id,
        is_completed: completed,
        progress_percent: completed ? 100 : 0,
        completed_at: completed ? now : null,
        started_at: now,
        last_viewed_at: now,
      },
      { onConflict: "user_id,lesson_id" },
    );

  if (progressError) return { ok: false, error: progressError.message };

  await recalculateCourseProgress(user.id, lesson.course_id);

  revalidatePath(`/dashboard/courses/${lesson.course_id}`, "layout");
  revalidatePath("/dashboard");

  return { ok: true };
}

async function recalculateCourseProgress(
  userId: string,
  courseId: string,
): Promise<void> {
  const supabase = await createClient();

  const { count: totalCount } = await supabase
    .from("lessons")
    .select("*", { count: "exact", head: true })
    .eq("course_id", courseId)
    .eq("is_published", true);

  const { count: completedCount } = await supabase
    .from("lesson_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("is_completed", true);

  const total = totalCount ?? 0;
  const completed = completedCount ?? 0;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const allDone = total > 0 && completed >= total;
  const now = new Date().toISOString();

  await supabase.from("course_progress").upsert(
    {
      user_id: userId,
      course_id: courseId,
      total_lessons_count: total,
      completed_lessons_count: completed,
      progress_percent: percent,
      last_activity_at: now,
      completed_at: allDone ? now : null,
      started_at: now,
    },
    { onConflict: "user_id,course_id" },
  );

  if (allDone) {
    const certId = await maybeIssueCertificate(userId, courseId);
    if (certId) await notifyCertificateIssued(certId);
    revalidatePath("/dashboard/certificates");
  }
}
