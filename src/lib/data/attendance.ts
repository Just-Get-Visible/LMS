import { createClient } from "@/lib/supabase/server";
import { getSessionById } from "@/lib/data/live-sessions";
import type { Tables } from "@/types";

type ProfileRef = Pick<
  Tables<"profiles">,
  "id" | "full_name" | "first_name" | "last_name" | "email" | "avatar_url"
>;

export type AttendanceRow = {
  userId: string;
  profile: ProfileRef | null;
  attendance: Tables<"session_attendance"> | null;
};

export async function getSessionAttendanceRoster(
  sessionId: string,
): Promise<AttendanceRow[]> {
  const session = await getSessionById(sessionId);
  if (!session) return [];

  const supabase = await createClient();

  let userIds: string[] = [];
  if (session.cohort_id) {
    const { data } = await supabase
      .from("cohort_enrolments")
      .select("user_id")
      .eq("cohort_id", session.cohort_id)
      .in("status", ["active", "completed"]);
    userIds = (data ?? []).map((r) => r.user_id);
  } else if (session.course_id) {
    const { data } = await supabase
      .from("course_enrolments")
      .select("user_id")
      .eq("course_id", session.course_id)
      .in("status", ["active", "completed"]);
    userIds = (data ?? []).map((r) => r.user_id);
  }

  const { data: attendanceRows } = await supabase
    .from("session_attendance")
    .select("*")
    .eq("live_session_id", sessionId);

  const attendanceUserIds = (attendanceRows ?? []).map((r) => r.user_id);
  const allUserIds = [...new Set([...userIds, ...attendanceUserIds])];

  if (allUserIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, first_name, last_name, email, avatar_url")
    .in("id", allUserIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p]),
  );
  const attendanceMap = new Map(
    (attendanceRows ?? []).map((a) => [a.user_id, a]),
  );

  return allUserIds
    .map((userId) => ({
      userId,
      profile: profileMap.get(userId) ?? null,
      attendance: attendanceMap.get(userId) ?? null,
    }))
    .sort((a, b) => {
      const an =
        a.profile?.full_name?.trim() || a.profile?.email || a.userId;
      const bn =
        b.profile?.full_name?.trim() || b.profile?.email || b.userId;
      return an.localeCompare(bn);
    });
}

export async function getMyAttendanceForSession(
  userId: string,
  sessionId: string,
): Promise<Tables<"session_attendance"> | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("session_attendance")
    .select("*")
    .eq("live_session_id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}
