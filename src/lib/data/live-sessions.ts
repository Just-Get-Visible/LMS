import { createClient } from "@/lib/supabase/server";
import { getInstructorCourseIds } from "@/lib/data/instructor";
import type { Tables } from "@/types";

export async function getUpcomingLiveSessionsForUser(
  limit = 5,
): Promise<Tables<"live_sessions">[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("live_sessions")
    .select("*")
    .gte("scheduled_start_at", new Date().toISOString())
    .order("scheduled_start_at", { ascending: true })
    .limit(limit);
  return data ?? [];
}

export async function getCohortSessions(
  cohortId: string,
): Promise<Tables<"live_sessions">[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("live_sessions")
    .select("*")
    .eq("cohort_id", cohortId)
    .order("scheduled_start_at", { ascending: true });
  return data ?? [];
}

export async function getSessionById(
  sessionId: string,
): Promise<Tables<"live_sessions"> | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("live_sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle();
  return data;
}

export async function getStudentSessions(
  options: { upcoming?: boolean } = {},
): Promise<Tables<"live_sessions">[]> {
  const supabase = await createClient();
  let query = supabase.from("live_sessions").select("*");

  if (options.upcoming) {
    query = query.gte("scheduled_start_at", new Date().toISOString());
  }

  const { data } = await query.order("scheduled_start_at", {
    ascending: !!options.upcoming,
  });
  return data ?? [];
}

export async function getInstructorSessions(
  userId: string,
): Promise<Tables<"live_sessions">[]> {
  const supabase = await createClient();

  const courseIds = await getInstructorCourseIds(userId);
  const { data: cohortLinks } = await supabase
    .from("cohort_instructors")
    .select("cohort_id")
    .eq("user_id", userId);
  const cohortIds = (cohortLinks ?? []).map((c) => c.cohort_id);

  const filters: string[] = [`host_user_id.eq.${userId}`];
  if (courseIds.length > 0) {
    filters.push(`course_id.in.(${courseIds.join(",")})`);
  }
  if (cohortIds.length > 0) {
    filters.push(`cohort_id.in.(${cohortIds.join(",")})`);
  }

  const { data } = await supabase
    .from("live_sessions")
    .select("*")
    .or(filters.join(","))
    .order("scheduled_start_at", { ascending: false });

  return data ?? [];
}
