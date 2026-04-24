"use server";

import { revalidatePath } from "next/cache";

import { isAdmin } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";
import { isCourseInstructor } from "@/lib/data/enrolments";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/types";

export type ModuleFieldErrors = Partial<Record<"title", string>>;

export type ModuleActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: ModuleFieldErrors };

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

async function assertCanEditCourse(userId: string, courseId: string) {
  const ok =
    (await isCourseInstructor(userId, courseId)) || (await isAdmin(userId));
  if (!ok) throw new Error("You don't have permission to edit this course.");
}

export async function createModuleAction(
  _prev: ModuleActionState,
  formData: FormData,
): Promise<ModuleActionState> {
  const courseId = nullableString(formData.get("course_id"));
  if (!courseId) return { status: "error", message: "Missing course id." };

  const user = await requireUser();
  await assertCanEditCourse(user.id, courseId);

  const title = nullableString(formData.get("title"));
  if (!title) {
    return {
      status: "error",
      message: "Title is required.",
      fieldErrors: { title: "Title is required." },
    };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("course_modules")
    .select("sort_order")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  const insert: TablesInsert<"course_modules"> = {
    course_id: courseId,
    title,
    description: nullableString(formData.get("description")),
    sort_order: nextOrder,
    is_published: false,
  };

  const { error } = await supabase.from("course_modules").insert(insert);
  if (error) return { status: "error", message: error.message };

  revalidatePath(`/instructor/courses/${courseId}`);
  return { status: "success", message: "Module created." };
}

export async function updateModuleAction(
  _prev: ModuleActionState,
  formData: FormData,
): Promise<ModuleActionState> {
  const moduleId = nullableString(formData.get("module_id"));
  const courseId = nullableString(formData.get("course_id"));
  if (!moduleId || !courseId) {
    return { status: "error", message: "Missing module or course id." };
  }

  const user = await requireUser();
  await assertCanEditCourse(user.id, courseId);

  const title = nullableString(formData.get("title"));
  if (!title) {
    return {
      status: "error",
      message: "Title is required.",
      fieldErrors: { title: "Title is required." },
    };
  }

  const update: TablesUpdate<"course_modules"> = {
    title,
    description: nullableString(formData.get("description")),
    is_published: bool(formData.get("is_published")),
    drip_days: nullableNumber(formData.get("drip_days")),
    estimated_duration_minutes: nullableNumber(
      formData.get("estimated_duration_minutes"),
    ),
  };

  const supabase = await createClient();
  const { error } = await supabase
    .from("course_modules")
    .update(update)
    .eq("id", moduleId);

  if (error) return { status: "error", message: error.message };

  revalidatePath(`/instructor/courses/${courseId}`);
  return { status: "success", message: "Module saved." };
}

export async function deleteModuleAction(
  courseId: string,
  moduleId: string,
): Promise<void> {
  const user = await requireUser();
  await assertCanEditCourse(user.id, courseId);

  const supabase = await createClient();
  await supabase.from("course_modules").delete().eq("id", moduleId);

  revalidatePath(`/instructor/courses/${courseId}`);
}

export async function moveModuleAction(
  courseId: string,
  moduleId: string,
  direction: "up" | "down",
): Promise<void> {
  const user = await requireUser();
  await assertCanEditCourse(user.id, courseId);

  const supabase = await createClient();
  const { data: modules } = await supabase
    .from("course_modules")
    .select("id, sort_order")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true });

  if (!modules) return;

  const idx = modules.findIndex((m) => m.id === moduleId);
  if (idx < 0) return;

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= modules.length) return;

  const current = modules[idx];
  const target = modules[swapIdx];

  await supabase
    .from("course_modules")
    .update({ sort_order: target.sort_order })
    .eq("id", current.id);
  await supabase
    .from("course_modules")
    .update({ sort_order: current.sort_order })
    .eq("id", target.id);

  revalidatePath(`/instructor/courses/${courseId}`);
}
