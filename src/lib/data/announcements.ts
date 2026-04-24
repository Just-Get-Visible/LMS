import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types";

export async function getInstructorAnnouncements(
  userId: string,
): Promise<Tables<"announcements">[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .eq("created_by", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAnnouncementById(
  id: string,
): Promise<Tables<"announcements"> | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function getStudentAnnouncements(): Promise<
  Tables<"announcements">[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false });
  return data ?? [];
}

export async function getAnnouncementsForCohort(
  cohortId: string,
): Promise<Tables<"announcements">[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .eq("cohort_id", cohortId)
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false });
  return data ?? [];
}

export async function getAnnouncementsForCourse(
  courseId: string,
): Promise<Tables<"announcements">[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .eq("course_id", courseId)
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false });
  return data ?? [];
}
