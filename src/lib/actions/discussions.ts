"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdmin } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";
import {
  canAccessCohort,
  canAccessCourseContent,
  isCohortInstructor,
  isCourseInstructor,
} from "@/lib/data/enrolments";
import { getThreadById } from "@/lib/data/discussions";
import { notifyDiscussionReply } from "@/lib/notifications/fanout";
import { createClient } from "@/lib/supabase/server";
import type { Enums, TablesInsert } from "@/types";

export type ThreadFieldErrors = Partial<
  Record<"title" | "scope" | "body", string>
>;

export type ThreadActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: ThreadFieldErrors };

export type PostActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

function nullableString(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

async function canManageThread(
  userId: string,
  thread: { course_id: string | null; cohort_id: string | null },
): Promise<boolean> {
  if (await isAdmin(userId)) return true;
  if (thread.cohort_id && (await isCohortInstructor(userId, thread.cohort_id)))
    return true;
  if (thread.course_id && (await isCourseInstructor(userId, thread.course_id)))
    return true;
  return false;
}

export async function createThreadAction(
  _prev: ThreadActionState,
  formData: FormData,
): Promise<ThreadActionState> {
  const user = await requireUser();

  const title = nullableString(formData.get("title"));
  const body = nullableString(formData.get("body"));
  const cohortId = nullableString(formData.get("cohort_id"));
  const courseId = nullableString(formData.get("course_id"));

  const fieldErrors: ThreadFieldErrors = {};
  if (!title) fieldErrors.title = "Title is required.";
  if (!cohortId && !courseId) fieldErrors.scope = "Choose a cohort or course.";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  const canPost = cohortId
    ? await canAccessCohort(user.id, cohortId)
    : await canAccessCourseContent(user.id, courseId!);

  if (!canPost) {
    return {
      status: "error",
      message: "You don't have access to that scope.",
    };
  }

  const scope: Enums<"discussion_scope"> = cohortId ? "cohort" : "course";

  const insert: TablesInsert<"discussion_threads"> = {
    scope,
    cohort_id: cohortId,
    course_id: courseId,
    title: title!,
    body,
    created_by: user.id,
  };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("discussion_threads")
    .insert(insert)
    .select("id")
    .single();

  if (error) return { status: "error", message: error.message };

  revalidatePath("/dashboard/discussions");
  redirect(`/dashboard/discussions/${data.id}`);
}

export async function createPostAction(
  _prev: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const user = await requireUser();

  const threadId = nullableString(formData.get("thread_id"));
  const body = nullableString(formData.get("body"));
  const parentPostId = nullableString(formData.get("parent_post_id"));

  if (!threadId || !body) {
    return { status: "error", message: "Reply text is required." };
  }

  const thread = await getThreadById(threadId);
  if (!thread) {
    return { status: "error", message: "Thread not found." };
  }

  if (thread.is_locked && !(await canManageThread(user.id, thread))) {
    return { status: "error", message: "This thread is locked." };
  }

  // Verify scope access
  const canPost = thread.cohort_id
    ? await canAccessCohort(user.id, thread.cohort_id)
    : thread.course_id
      ? await canAccessCourseContent(user.id, thread.course_id)
      : await isAdmin(user.id);

  if (!canPost) {
    return { status: "error", message: "Access denied." };
  }

  const supabase = await createClient();
  const { data: inserted, error } = await supabase
    .from("discussion_posts")
    .insert({
      thread_id: threadId,
      parent_post_id: parentPostId,
      author_user_id: user.id,
      body,
    })
    .select("id")
    .single();

  if (error) return { status: "error", message: error.message };

  // Bump thread updated_at so it sorts to top of recent activity
  await supabase
    .from("discussion_threads")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", threadId);

  if (inserted?.id) await notifyDiscussionReply(inserted.id);

  revalidatePath(`/dashboard/discussions/${threadId}`);
  return { status: "success", message: "Posted." };
}

export async function setThreadPinAction(
  threadId: string,
  pinned: boolean,
): Promise<void> {
  const user = await requireUser();
  const thread = await getThreadById(threadId);
  if (!thread) return;
  if (!(await canManageThread(user.id, thread))) return;

  const supabase = await createClient();
  await supabase
    .from("discussion_threads")
    .update({ is_pinned: pinned })
    .eq("id", threadId);

  revalidatePath(`/dashboard/discussions/${threadId}`);
  revalidatePath("/dashboard/discussions");
}

export async function setThreadLockAction(
  threadId: string,
  locked: boolean,
): Promise<void> {
  const user = await requireUser();
  const thread = await getThreadById(threadId);
  if (!thread) return;
  if (!(await canManageThread(user.id, thread))) return;

  const supabase = await createClient();
  await supabase
    .from("discussion_threads")
    .update({ is_locked: locked })
    .eq("id", threadId);

  revalidatePath(`/dashboard/discussions/${threadId}`);
}

export async function deleteThreadAction(threadId: string): Promise<void> {
  const user = await requireUser();
  const thread = await getThreadById(threadId);
  if (!thread) return;
  if (!(await canManageThread(user.id, thread))) return;

  const supabase = await createClient();
  await supabase.from("discussion_threads").delete().eq("id", threadId);

  revalidatePath("/dashboard/discussions");
  redirect("/dashboard/discussions");
}
