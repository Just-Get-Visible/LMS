"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdmin, requireInstructor } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";
import {
  isCohortInstructor,
  isCourseInstructor,
} from "@/lib/data/enrolments";
import { notifyAnnouncementPublished } from "@/lib/notifications/fanout";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/types";

export type AnnouncementFieldErrors = Partial<
  Record<"title" | "body" | "scope", string>
>;

export type AnnouncementActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | {
      status: "error";
      message: string;
      fieldErrors?: AnnouncementFieldErrors;
    };

function nullableString(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

function bool(v: FormDataEntryValue | null): boolean {
  return v === "on" || v === "true";
}

async function canCreateAnnouncementForScope(
  userId: string,
  cohortId: string | null,
  courseId: string | null,
): Promise<boolean> {
  if (await isAdmin(userId)) return true;
  if (cohortId && (await isCohortInstructor(userId, cohortId))) return true;
  if (courseId && (await isCourseInstructor(userId, courseId))) return true;
  return false;
}

async function getOwnAnnouncementOrNull(
  id: string,
  userId: string,
): Promise<{ created_by: string | null; cohort_id: string | null; course_id: string | null } | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("announcements")
    .select("created_by, cohort_id, course_id")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  if (data.created_by !== userId && !(await isAdmin(userId))) return null;
  return data;
}

export async function createAnnouncementAction(
  _prev: AnnouncementActionState,
  formData: FormData,
): Promise<AnnouncementActionState> {
  const user = await requireUser();
  await requireInstructor(user.id);

  const title = nullableString(formData.get("title"));
  const body = nullableString(formData.get("body"));
  const cohortId = nullableString(formData.get("cohort_id"));
  const courseId = nullableString(formData.get("course_id"));
  const publish = bool(formData.get("is_published"));

  const fieldErrors: AnnouncementFieldErrors = {};
  if (!title) fieldErrors.title = "Title is required.";
  if (!body) fieldErrors.body = "Body is required.";
  if (!cohortId && !courseId)
    fieldErrors.scope = "Choose a cohort or course.";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  if (!(await canCreateAnnouncementForScope(user.id, cohortId, courseId))) {
    return {
      status: "error",
      message: "You don't have permission to post for that cohort or course.",
    };
  }

  const insert: TablesInsert<"announcements"> = {
    title: title!,
    body: body!,
    cohort_id: cohortId,
    course_id: courseId,
    is_published: publish,
    published_at: publish ? new Date().toISOString() : null,
    created_by: user.id,
  };

  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("announcements")
    .insert(insert)
    .select("id")
    .single();

  if (error) return { status: "error", message: error.message };

  if (publish) {
    await notifyAnnouncementPublished(row.id);
  }

  revalidatePath("/instructor/announcements");
  if (cohortId) revalidatePath(`/dashboard/cohorts/${cohortId}`);
  redirect(`/instructor/announcements/${row.id}`);
}

export async function updateAnnouncementAction(
  _prev: AnnouncementActionState,
  formData: FormData,
): Promise<AnnouncementActionState> {
  const id = nullableString(formData.get("announcement_id"));
  if (!id) return { status: "error", message: "Missing announcement id." };

  const user = await requireUser();
  const existing = await getOwnAnnouncementOrNull(id, user.id);
  if (!existing) {
    return { status: "error", message: "Not found or no permission." };
  }

  const title = nullableString(formData.get("title"));
  const body = nullableString(formData.get("body"));

  const fieldErrors: AnnouncementFieldErrors = {};
  if (!title) fieldErrors.title = "Title is required.";
  if (!body) fieldErrors.body = "Body is required.";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  const update: TablesUpdate<"announcements"> = {
    title: title!,
    body: body!,
  };

  const supabase = await createClient();
  const { error } = await supabase
    .from("announcements")
    .update(update)
    .eq("id", id);

  if (error) return { status: "error", message: error.message };

  revalidatePath(`/instructor/announcements/${id}`);
  revalidatePath("/instructor/announcements");
  if (existing.cohort_id)
    revalidatePath(`/dashboard/cohorts/${existing.cohort_id}`);
  revalidatePath("/dashboard/announcements");
  return { status: "success", message: "Announcement saved." };
}

export async function setAnnouncementPublishAction(
  id: string,
  publish: boolean,
): Promise<void> {
  const user = await requireUser();
  const existing = await getOwnAnnouncementOrNull(id, user.id);
  if (!existing) return;

  const supabase = await createClient();
  await supabase
    .from("announcements")
    .update({
      is_published: publish,
      published_at: publish ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (publish) {
    await notifyAnnouncementPublished(id);
  }

  revalidatePath(`/instructor/announcements/${id}`);
  revalidatePath("/instructor/announcements");
  if (existing.cohort_id)
    revalidatePath(`/dashboard/cohorts/${existing.cohort_id}`);
  revalidatePath("/dashboard/announcements");
}

export async function deleteAnnouncementAction(id: string): Promise<void> {
  const user = await requireUser();
  const existing = await getOwnAnnouncementOrNull(id, user.id);
  if (!existing) return;

  const supabase = await createClient();
  await supabase.from("announcements").delete().eq("id", id);

  revalidatePath("/instructor/announcements");
  if (existing.cohort_id)
    revalidatePath(`/dashboard/cohorts/${existing.cohort_id}`);
  redirect("/instructor/announcements");
}
