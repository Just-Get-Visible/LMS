"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdmin, requireInstructor } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";
import {
  isCohortInstructor,
  isCourseInstructor,
} from "@/lib/data/enrolments";
import { getSessionById } from "@/lib/data/live-sessions";
import { notifyLiveSessionScheduled } from "@/lib/notifications/fanout";
import { createClient } from "@/lib/supabase/server";
import type { Enums, TablesInsert, TablesUpdate } from "@/types";

export type SessionFieldErrors = Partial<
  Record<
    "title" | "scheduled_start_at" | "scheduled_end_at" | "scope",
    string
  >
>;

export type SessionActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: SessionFieldErrors };

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

const VALID_STATUS: Enums<"session_status">[] = [
  "scheduled",
  "live",
  "completed",
  "cancelled",
];

function pickStatus(v: FormDataEntryValue | null): Enums<"session_status"> {
  return VALID_STATUS.includes(v as Enums<"session_status">)
    ? (v as Enums<"session_status">)
    : "scheduled";
}

async function canCreateForScope(
  userId: string,
  cohortId: string | null,
  courseId: string | null,
): Promise<boolean> {
  if (await isAdmin(userId)) return true;
  if (cohortId && (await isCohortInstructor(userId, cohortId))) return true;
  if (courseId && (await isCourseInstructor(userId, courseId))) return true;
  return false;
}

async function canManageSession(
  userId: string,
  session: Pick<
    TablesUpdate<"live_sessions"> & { id: string },
    "host_user_id" | "course_id" | "cohort_id"
  >,
): Promise<boolean> {
  if (await isAdmin(userId)) return true;
  if (session.host_user_id === userId) return true;
  if (session.cohort_id && (await isCohortInstructor(userId, session.cohort_id)))
    return true;
  if (session.course_id && (await isCourseInstructor(userId, session.course_id)))
    return true;
  return false;
}

export async function createSessionAction(
  _prev: SessionActionState,
  formData: FormData,
): Promise<SessionActionState> {
  const user = await requireUser();
  await requireInstructor(user.id);

  const title = nullableString(formData.get("title"));
  const cohortId = nullableString(formData.get("cohort_id"));
  const courseId = nullableString(formData.get("course_id"));
  const scheduledStart = parseDateTimeLocal(formData.get("scheduled_start_at"));
  const scheduledEnd = parseDateTimeLocal(formData.get("scheduled_end_at"));

  const fieldErrors: SessionFieldErrors = {};
  if (!title) fieldErrors.title = "Title is required.";
  if (!scheduledStart)
    fieldErrors.scheduled_start_at = "Start time is required.";
  if (!scheduledEnd) fieldErrors.scheduled_end_at = "End time is required.";
  if (!cohortId && !courseId)
    fieldErrors.scope = "Choose a cohort or course.";
  if (
    scheduledStart &&
    scheduledEnd &&
    new Date(scheduledStart) >= new Date(scheduledEnd)
  ) {
    fieldErrors.scheduled_end_at = "End must be after start.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  if (!(await canCreateForScope(user.id, cohortId, courseId))) {
    return {
      status: "error",
      message: "You don't have permission to add sessions to that cohort or course.",
    };
  }

  const insert: TablesInsert<"live_sessions"> = {
    title: title!,
    description: nullableString(formData.get("description")),
    cohort_id: cohortId,
    course_id: courseId,
    host_user_id: user.id,
    provider: nullableString(formData.get("provider")) ?? "zoom",
    external_meeting_id: nullableString(formData.get("external_meeting_id")),
    join_url: nullableString(formData.get("join_url")),
    replay_url: nullableString(formData.get("replay_url")),
    scheduled_start_at: scheduledStart!,
    scheduled_end_at: scheduledEnd!,
    timezone: nullableString(formData.get("timezone")) ?? "Europe/London",
    is_recorded: bool(formData.get("is_recorded")),
    max_attendees: nullableNumber(formData.get("max_attendees")),
    status: "scheduled",
    created_by: user.id,
  };

  const supabase = await createClient();
  const { data: session, error } = await supabase
    .from("live_sessions")
    .insert(insert)
    .select("id")
    .single();

  if (error) return { status: "error", message: error.message };

  await notifyLiveSessionScheduled(session.id);

  revalidatePath("/instructor/sessions");
  redirect(`/instructor/sessions/${session.id}`);
}

export async function updateSessionAction(
  _prev: SessionActionState,
  formData: FormData,
): Promise<SessionActionState> {
  const sessionId = nullableString(formData.get("session_id"));
  if (!sessionId) return { status: "error", message: "Missing session id." };

  const user = await requireUser();
  const existing = await getSessionById(sessionId);
  if (!existing) return { status: "error", message: "Session not found." };
  if (!(await canManageSession(user.id, existing))) {
    return { status: "error", message: "You can't manage this session." };
  }

  const title = nullableString(formData.get("title"));
  const scheduledStart = parseDateTimeLocal(formData.get("scheduled_start_at"));
  const scheduledEnd = parseDateTimeLocal(formData.get("scheduled_end_at"));

  const fieldErrors: SessionFieldErrors = {};
  if (!title) fieldErrors.title = "Title is required.";
  if (!scheduledStart)
    fieldErrors.scheduled_start_at = "Start time is required.";
  if (!scheduledEnd) fieldErrors.scheduled_end_at = "End time is required.";
  if (
    scheduledStart &&
    scheduledEnd &&
    new Date(scheduledStart) >= new Date(scheduledEnd)
  ) {
    fieldErrors.scheduled_end_at = "End must be after start.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  const update: TablesUpdate<"live_sessions"> = {
    title: title!,
    description: nullableString(formData.get("description")),
    provider: nullableString(formData.get("provider")) ?? "zoom",
    external_meeting_id: nullableString(formData.get("external_meeting_id")),
    join_url: nullableString(formData.get("join_url")),
    replay_url: nullableString(formData.get("replay_url")),
    scheduled_start_at: scheduledStart!,
    scheduled_end_at: scheduledEnd!,
    timezone: nullableString(formData.get("timezone")) ?? "Europe/London",
    is_recorded: bool(formData.get("is_recorded")),
    max_attendees: nullableNumber(formData.get("max_attendees")),
  };

  const supabase = await createClient();
  const { error } = await supabase
    .from("live_sessions")
    .update(update)
    .eq("id", sessionId);

  if (error) return { status: "error", message: error.message };

  revalidatePath(`/instructor/sessions/${sessionId}`);
  revalidatePath("/instructor/sessions");
  revalidatePath("/dashboard/sessions");
  if (existing.cohort_id) {
    revalidatePath(`/dashboard/cohorts/${existing.cohort_id}`);
  }
  return { status: "success", message: "Session saved." };
}

export async function setSessionStatusAction(
  sessionId: string,
  status: Enums<"session_status">,
): Promise<void> {
  const user = await requireUser();
  const existing = await getSessionById(sessionId);
  if (!existing) return;
  if (!(await canManageSession(user.id, existing))) return;

  const supabase = await createClient();
  const update: TablesUpdate<"live_sessions"> = { status };
  if (status === "live") update.actual_start_at = new Date().toISOString();
  if (status === "completed") update.actual_end_at = new Date().toISOString();

  await supabase.from("live_sessions").update(update).eq("id", sessionId);

  revalidatePath(`/instructor/sessions/${sessionId}`);
  revalidatePath("/instructor/sessions");
  revalidatePath("/dashboard/sessions");
}

export async function deleteSessionAction(sessionId: string): Promise<void> {
  const user = await requireUser();
  const existing = await getSessionById(sessionId);
  if (!existing) return;
  if (!(await canManageSession(user.id, existing))) return;

  const supabase = await createClient();
  await supabase.from("live_sessions").delete().eq("id", sessionId);

  revalidatePath("/instructor/sessions");
  redirect("/instructor/sessions");
}
