"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdmin, requireInstructor } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";
import { isCourseInstructor } from "@/lib/data/enrolments";
import { getAssignmentById } from "@/lib/data/assignments";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/types";

export type AssignmentFieldErrors = Partial<
  Record<"title" | "course_id", string>
>;

export type AssignmentActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | {
      status: "error";
      message: string;
      fieldErrors?: AssignmentFieldErrors;
    };

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

function parseDateTimeLocal(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string" || v.trim() === "") return null;
  const date = new Date(v);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

async function assertCanManageAssignment(
  userId: string,
  courseId: string,
) {
  const ok =
    (await isCourseInstructor(userId, courseId)) || (await isAdmin(userId));
  if (!ok) throw new Error("You don't have permission to manage this assignment.");
}

export async function createAssignmentAction(
  _prev: AssignmentActionState,
  formData: FormData,
): Promise<AssignmentActionState> {
  const user = await requireUser();
  await requireInstructor(user.id);

  const title = nullableString(formData.get("title"));
  const courseId = nullableString(formData.get("course_id"));
  const cohortId = nullableString(formData.get("cohort_id"));

  const fieldErrors: AssignmentFieldErrors = {};
  if (!title) fieldErrors.title = "Title is required.";
  if (!courseId) fieldErrors.course_id = "Course is required.";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  await assertCanManageAssignment(user.id, courseId!);

  const insert: TablesInsert<"assignments"> = {
    course_id: courseId!,
    cohort_id: cohortId,
    title: title!,
    instructions: nullableString(formData.get("instructions")),
    due_at: parseDateTimeLocal(formData.get("due_at")),
    max_score: nullableNumber(formData.get("max_score")),
    passing_score: nullableNumber(formData.get("passing_score")),
    allow_late_submissions: bool(formData.get("allow_late_submissions")),
    allow_multiple_submissions: bool(formData.get("allow_multiple_submissions")),
    created_by: user.id,
  };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assignments")
    .insert(insert)
    .select("id")
    .single();

  if (error) return { status: "error", message: error.message };

  revalidatePath("/instructor/assignments");
  redirect(`/instructor/assignments/${data.id}`);
}

export async function updateAssignmentAction(
  _prev: AssignmentActionState,
  formData: FormData,
): Promise<AssignmentActionState> {
  const id = nullableString(formData.get("assignment_id"));
  if (!id) return { status: "error", message: "Missing assignment id." };

  const user = await requireUser();
  const existing = await getAssignmentById(id);
  if (!existing) return { status: "error", message: "Assignment not found." };

  await assertCanManageAssignment(user.id, existing.course_id);

  const title = nullableString(formData.get("title"));
  if (!title) {
    return {
      status: "error",
      message: "Title is required.",
      fieldErrors: { title: "Title is required." },
    };
  }

  const update: TablesUpdate<"assignments"> = {
    title,
    instructions: nullableString(formData.get("instructions")),
    due_at: parseDateTimeLocal(formData.get("due_at")),
    max_score: nullableNumber(formData.get("max_score")),
    passing_score: nullableNumber(formData.get("passing_score")),
    allow_late_submissions: bool(formData.get("allow_late_submissions")),
    allow_multiple_submissions: bool(formData.get("allow_multiple_submissions")),
  };

  const supabase = await createClient();
  const { error } = await supabase
    .from("assignments")
    .update(update)
    .eq("id", id);

  if (error) return { status: "error", message: error.message };

  revalidatePath(`/instructor/assignments/${id}`);
  revalidatePath(`/dashboard/assignments/${id}`);
  revalidatePath("/instructor/assignments");
  return { status: "success", message: "Assignment saved." };
}

export async function deleteAssignmentAction(id: string): Promise<void> {
  const user = await requireUser();
  const existing = await getAssignmentById(id);
  if (!existing) return;
  await assertCanManageAssignment(user.id, existing.course_id);

  const supabase = await createClient();
  await supabase.from("assignments").delete().eq("id", id);

  revalidatePath("/instructor/assignments");
  redirect("/instructor/assignments");
}
