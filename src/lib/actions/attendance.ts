"use server";

import { revalidatePath } from "next/cache";

import { isAdmin } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";
import {
  isCohortInstructor,
  isCourseInstructor,
} from "@/lib/data/enrolments";
import { getSessionById } from "@/lib/data/live-sessions";
import { createClient } from "@/lib/supabase/server";
import type { Enums, TablesInsert } from "@/types";

const VALID_STATUS: Enums<"attendance_status">[] = [
  "registered",
  "attended",
  "missed",
  "late",
  "excused",
];

function pickStatus(v: FormDataEntryValue | null): Enums<"attendance_status"> {
  return VALID_STATUS.includes(v as Enums<"attendance_status">)
    ? (v as Enums<"attendance_status">)
    : "registered";
}

function nullableString(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

async function canManageAttendance(
  userId: string,
  sessionId: string,
): Promise<boolean> {
  const session = await getSessionById(sessionId);
  if (!session) return false;
  if (await isAdmin(userId)) return true;
  if (session.host_user_id === userId) return true;
  if (session.cohort_id && (await isCohortInstructor(userId, session.cohort_id)))
    return true;
  if (session.course_id && (await isCourseInstructor(userId, session.course_id)))
    return true;
  return false;
}

export async function setAttendanceAction(
  sessionId: string,
  studentUserId: string,
  formData: FormData,
): Promise<void> {
  const user = await requireUser();
  if (!(await canManageAttendance(user.id, sessionId))) return;

  const status = pickStatus(formData.get("status"));
  const notes = nullableString(formData.get("notes"));

  const insert: TablesInsert<"session_attendance"> = {
    live_session_id: sessionId,
    user_id: studentUserId,
    status,
    notes,
  };

  const supabase = await createClient();
  await supabase
    .from("session_attendance")
    .upsert(insert, { onConflict: "live_session_id,user_id" });

  revalidatePath(`/instructor/sessions/${sessionId}`);
}

// Bulk-set attendance for everyone the instructor hasn't explicitly marked
// yet. Preserves manual per-row edits — only touches rows that are null or
// still in the default "registered" state.
export async function markRemainingAttendanceAction(
  sessionId: string,
  status: Enums<"attendance_status">,
): Promise<void> {
  const user = await requireUser();
  if (!(await canManageAttendance(user.id, sessionId))) return;
  if (!VALID_STATUS.includes(status)) return;

  const session = await getSessionById(sessionId);
  if (!session) return;

  const supabase = await createClient();

  // Pull the roster (cohort or course enrolees).
  let rosterIds: string[] = [];
  if (session.cohort_id) {
    const { data } = await supabase
      .from("cohort_enrolments")
      .select("user_id")
      .eq("cohort_id", session.cohort_id)
      .in("status", ["active", "completed"]);
    rosterIds = (data ?? []).map((r) => r.user_id);
  } else if (session.course_id) {
    const { data } = await supabase
      .from("course_enrolments")
      .select("user_id")
      .eq("course_id", session.course_id)
      .in("status", ["active", "completed"]);
    rosterIds = (data ?? []).map((r) => r.user_id);
  }
  if (rosterIds.length === 0) return;

  // Find which roster members already have a non-default status.
  const { data: existing } = await supabase
    .from("session_attendance")
    .select("user_id, status")
    .eq("live_session_id", sessionId)
    .in("user_id", rosterIds);
  const explicit = new Set(
    (existing ?? [])
      .filter((r) => r.status !== "registered")
      .map((r) => r.user_id),
  );

  const targets = rosterIds.filter((id) => !explicit.has(id));
  if (targets.length === 0) {
    revalidatePath(`/instructor/sessions/${sessionId}`);
    return;
  }

  const rows: TablesInsert<"session_attendance">[] = targets.map((uid) => ({
    live_session_id: sessionId,
    user_id: uid,
    status,
  }));

  await supabase
    .from("session_attendance")
    .upsert(rows, { onConflict: "live_session_id,user_id" });

  revalidatePath(`/instructor/sessions/${sessionId}`);
}
