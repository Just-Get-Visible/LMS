"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdmin } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";
import { isCourseInstructor } from "@/lib/data/enrolments";
import { createClient } from "@/lib/supabase/server";
import type { Enums, TablesInsert, TablesUpdate } from "@/types";

export type LessonFieldErrors = Partial<Record<"title" | "lesson_type", string>>;

export type LessonActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: LessonFieldErrors };

function nullableString(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

function nullableNumber(v: FormDataEntryValue | null): number | null {
  if (typeof v !== "string" || v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function bool(v: FormDataEntryValue | null): boolean {
  return v === "on" || v === "true";
}

const VALID_LESSON_TYPES: Enums<"lesson_type">[] = [
  "video",
  "text",
  "document",
  "live_session",
  "quiz",
  "assignment",
];

function pickLessonType(
  v: FormDataEntryValue | null,
): Enums<"lesson_type"> | null {
  return VALID_LESSON_TYPES.includes(v as Enums<"lesson_type">)
    ? (v as Enums<"lesson_type">)
    : null;
}

async function assertCanEditCourse(userId: string, courseId: string) {
  const ok =
    (await isCourseInstructor(userId, courseId)) || (await isAdmin(userId));
  if (!ok) throw new Error("You don't have permission to edit this course.");
}

export async function createLessonAction(
  _prev: LessonActionState,
  formData: FormData,
): Promise<LessonActionState> {
  const courseId = nullableString(formData.get("course_id"));
  if (!courseId) return { status: "error", message: "Missing course id." };

  const user = await requireUser();
  await assertCanEditCourse(user.id, courseId);

  const title = nullableString(formData.get("title"));
  const lessonType = pickLessonType(formData.get("lesson_type"));
  const moduleId = nullableString(formData.get("module_id"));

  const fieldErrors: LessonFieldErrors = {};
  if (!title) fieldErrors.title = "Title is required.";
  if (!lessonType) fieldErrors.lesson_type = "Lesson type is required.";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  const supabase = await createClient();

  let nextOrder = 0;
  const orderQuery = supabase
    .from("lessons")
    .select("sort_order")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const { data: existing } = moduleId
    ? await orderQuery.eq("module_id", moduleId)
    : await orderQuery.is("module_id", null);
  nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  const insert: TablesInsert<"lessons"> = {
    course_id: courseId,
    module_id: moduleId,
    title: title!,
    lesson_type: lessonType!,
    sort_order: nextOrder,
    is_published: false,
    is_preview: false,
    created_by: user.id,
  };

  const { data: lesson, error } = await supabase
    .from("lessons")
    .insert(insert)
    .select("id")
    .single();

  if (error) return { status: "error", message: error.message };

  revalidatePath(`/instructor/courses/${courseId}`);
  redirect(`/instructor/courses/${courseId}/lessons/${lesson.id}`);
}

export async function updateLessonAction(
  _prev: LessonActionState,
  formData: FormData,
): Promise<LessonActionState> {
  const lessonId = nullableString(formData.get("lesson_id"));
  const courseId = nullableString(formData.get("course_id"));
  if (!lessonId || !courseId) {
    return { status: "error", message: "Missing lesson or course id." };
  }

  const user = await requireUser();
  await assertCanEditCourse(user.id, courseId);

  const title = nullableString(formData.get("title"));
  const lessonType = pickLessonType(formData.get("lesson_type"));

  const fieldErrors: LessonFieldErrors = {};
  if (!title) fieldErrors.title = "Title is required.";
  if (!lessonType) fieldErrors.lesson_type = "Lesson type is required.";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  const update: TablesUpdate<"lessons"> = {
    title: title!,
    lesson_type: lessonType!,
    module_id: nullableString(formData.get("module_id")),
    slug: nullableString(formData.get("slug")),
    summary: nullableString(formData.get("summary")),
    excerpt: nullableString(formData.get("excerpt")),
    content_html: nullableString(formData.get("content_html")),
    video_url: nullableString(formData.get("video_url")),
    video_duration_seconds: nullableNumber(
      formData.get("video_duration_seconds"),
    ),
    transcript: nullableString(formData.get("transcript")),
    is_preview: bool(formData.get("is_preview")),
    is_published: bool(formData.get("is_published")),
    drip_days: nullableNumber(formData.get("drip_days")),
    estimated_duration_minutes: nullableNumber(
      formData.get("estimated_duration_minutes"),
    ),
  };

  const supabase = await createClient();
  const { error } = await supabase
    .from("lessons")
    .update(update)
    .eq("id", lessonId);

  if (error) return { status: "error", message: error.message };

  revalidatePath(`/instructor/courses/${courseId}`);
  revalidatePath(`/instructor/courses/${courseId}/lessons/${lessonId}`);
  revalidatePath(`/dashboard/courses/${courseId}`, "layout");
  return { status: "success", message: "Lesson saved." };
}

export async function deleteLessonAction(
  courseId: string,
  lessonId: string,
): Promise<void> {
  const user = await requireUser();
  await assertCanEditCourse(user.id, courseId);

  const supabase = await createClient();
  await supabase.from("lessons").delete().eq("id", lessonId);

  revalidatePath(`/instructor/courses/${courseId}`);
  redirect(`/instructor/courses/${courseId}`);
}

export async function moveLessonAction(
  courseId: string,
  moduleId: string | null,
  lessonId: string,
  direction: "up" | "down",
): Promise<void> {
  const user = await requireUser();
  await assertCanEditCourse(user.id, courseId);

  const supabase = await createClient();
  const baseQuery = supabase
    .from("lessons")
    .select("id, sort_order")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true });

  const { data: siblings } = moduleId
    ? await baseQuery.eq("module_id", moduleId)
    : await baseQuery.is("module_id", null);

  if (!siblings) return;
  const idx = siblings.findIndex((l) => l.id === lessonId);
  if (idx < 0) return;
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= siblings.length) return;

  const current = siblings[idx];
  const target = siblings[swapIdx];

  await supabase
    .from("lessons")
    .update({ sort_order: target.sort_order })
    .eq("id", current.id);
  await supabase
    .from("lessons")
    .update({ sort_order: current.sort_order })
    .eq("id", target.id);

  revalidatePath(`/instructor/courses/${courseId}`);
}
