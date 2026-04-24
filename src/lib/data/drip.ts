import { isAdmin } from "@/lib/auth/roles";
import { isCourseInstructor } from "@/lib/data/enrolments";
import { createClient } from "@/lib/supabase/server";

// Locked entries map a lesson id to the time it becomes available.
export type LessonUnlocks = Map<string, Date>;

async function shouldBypassDrip(
  userId: string,
  courseId: string,
): Promise<boolean> {
  if (await isCourseInstructor(userId, courseId)) return true;
  return isAdmin(userId);
}

// Anchor for relative drip windows. Cohort start beats cohort enrolment beats
// course enrolment — so a 6-week cohort drips relative to its start date, not
// to whenever each student happened to register.
async function getDripAnchor(
  userId: string,
  courseId: string,
): Promise<Date | null> {
  const supabase = await createClient();

  const { data: cohortIds } = await supabase
    .from("cohorts")
    .select("id, starts_at")
    .eq("course_id", courseId);

  if (cohortIds && cohortIds.length > 0) {
    const { data: cohortEnrol } = await supabase
      .from("cohort_enrolments")
      .select("cohort_id, enrolled_at")
      .eq("user_id", userId)
      .in(
        "cohort_id",
        cohortIds.map((c) => c.id),
      )
      .in("status", ["active", "completed"])
      .order("enrolled_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (cohortEnrol) {
      const cohort = cohortIds.find((c) => c.id === cohortEnrol.cohort_id);
      const startStr = cohort?.starts_at ?? cohortEnrol.enrolled_at;
      if (startStr) return new Date(startStr);
    }
  }

  const { data: courseEnrol } = await supabase
    .from("course_enrolments")
    .select("enrolled_at")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .in("status", ["active", "completed"])
    .order("enrolled_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return courseEnrol?.enrolled_at ? new Date(courseEnrol.enrolled_at) : null;
}

function effectiveUnlock(
  anchor: Date | null,
  lessonUnlockAt: string | null,
  lessonDripDays: number | null,
  moduleUnlockAt: string | null,
  moduleDripDays: number | null,
): Date | null {
  const candidates: Date[] = [];

  if (lessonUnlockAt) candidates.push(new Date(lessonUnlockAt));
  if (moduleUnlockAt) candidates.push(new Date(moduleUnlockAt));

  if (anchor) {
    if (lessonDripDays && lessonDripDays > 0) {
      candidates.push(
        new Date(anchor.getTime() + lessonDripDays * 86_400_000),
      );
    }
    if (moduleDripDays && moduleDripDays > 0) {
      candidates.push(
        new Date(anchor.getTime() + moduleDripDays * 86_400_000),
      );
    }
  }

  if (candidates.length === 0) return null;
  return new Date(Math.max(...candidates.map((d) => d.getTime())));
}

export async function getLessonUnlocks(
  userId: string,
  courseId: string,
): Promise<LessonUnlocks> {
  const locked: LessonUnlocks = new Map();

  if (await shouldBypassDrip(userId, courseId)) return locked;

  const anchor = await getDripAnchor(userId, courseId);

  const supabase = await createClient();
  const [lessonsRes, modulesRes] = await Promise.all([
    supabase
      .from("lessons")
      .select("id, module_id, is_preview, unlock_at, drip_days")
      .eq("course_id", courseId),
    supabase
      .from("course_modules")
      .select("id, unlock_at, drip_days")
      .eq("course_id", courseId),
  ]);

  const moduleMap = new Map(
    (modulesRes.data ?? []).map((m) => [m.id, m] as const),
  );

  const now = Date.now();

  for (const lesson of lessonsRes.data ?? []) {
    if (lesson.is_preview) continue;
    const mod = lesson.module_id ? moduleMap.get(lesson.module_id) : null;
    const unlock = effectiveUnlock(
      anchor,
      lesson.unlock_at,
      lesson.drip_days,
      mod?.unlock_at ?? null,
      mod?.drip_days ?? null,
    );
    if (unlock && unlock.getTime() > now) {
      locked.set(lesson.id, unlock);
    }
  }

  return locked;
}

// For quizzes/assignments tied to a lesson — they inherit the lesson's
// drip. Course-scoped items (lesson_id null) are never drip-locked.
export async function getInheritedUnlockTime(
  userId: string,
  lessonId: string | null,
): Promise<Date | null> {
  if (!lessonId) return null;
  return getLessonUnlockTime(userId, lessonId);
}

// Single-lesson check used by the lesson page gate and the
// markLessonComplete action. Returns the unlock time if locked, else null.
export async function getLessonUnlockTime(
  userId: string,
  lessonId: string,
): Promise<Date | null> {
  const supabase = await createClient();
  const { data: lesson } = await supabase
    .from("lessons")
    .select(
      "course_id, module_id, is_preview, unlock_at, drip_days",
    )
    .eq("id", lessonId)
    .maybeSingle();

  if (!lesson) return null;
  if (lesson.is_preview) return null;
  if (await shouldBypassDrip(userId, lesson.course_id)) return null;

  const anchor = await getDripAnchor(userId, lesson.course_id);

  const mod = lesson.module_id
    ? (
        await supabase
          .from("course_modules")
          .select("unlock_at, drip_days")
          .eq("id", lesson.module_id)
          .maybeSingle()
      ).data
    : null;

  const unlock = effectiveUnlock(
    anchor,
    lesson.unlock_at,
    lesson.drip_days,
    mod?.unlock_at ?? null,
    mod?.drip_days ?? null,
  );

  if (!unlock || unlock.getTime() <= Date.now()) return null;
  return unlock;
}
