import { cache } from "react";

import { isAdmin } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types";

export const isEnrolledInCourse = cache(
  async (userId: string, courseId: string): Promise<boolean> => {
    const supabase = await createClient();
    const { count } = await supabase
      .from("course_enrolments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .in("status", ["active", "completed"]);
    return (count ?? 0) > 0;
  },
);

export const isCourseInstructor = cache(
  async (userId: string, courseId: string): Promise<boolean> => {
    const supabase = await createClient();
    const { count } = await supabase
      .from("course_instructors")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("course_id", courseId);
    return (count ?? 0) > 0;
  },
);

export async function canAccessCourseContent(
  userId: string,
  courseId: string,
): Promise<boolean> {
  if (await isEnrolledInCourse(userId, courseId)) return true;
  if (await isCourseInstructor(userId, courseId)) return true;
  return isAdmin(userId);
}

export const isEnrolledInCohort = cache(
  async (userId: string, cohortId: string): Promise<boolean> => {
    const supabase = await createClient();
    const { count } = await supabase
      .from("cohort_enrolments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("cohort_id", cohortId)
      .in("status", ["active", "completed"]);
    return (count ?? 0) > 0;
  },
);

export const isCohortInstructor = cache(
  async (userId: string, cohortId: string): Promise<boolean> => {
    const supabase = await createClient();
    const { count } = await supabase
      .from("cohort_instructors")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("cohort_id", cohortId);
    return (count ?? 0) > 0;
  },
);

export async function canAccessCohort(
  userId: string,
  cohortId: string,
): Promise<boolean> {
  if (await isEnrolledInCohort(userId, cohortId)) return true;
  if (await isCohortInstructor(userId, cohortId)) return true;
  return isAdmin(userId);
}

type EnrolledCourseSummary = Pick<
  Tables<"courses">,
  | "id"
  | "slug"
  | "title"
  | "subtitle"
  | "thumbnail_url"
  | "delivery_type"
  | "difficulty_level"
>;

export type EnrolledCourseItem = {
  enrolment: Tables<"course_enrolments">;
  course: EnrolledCourseSummary;
  progress: Tables<"course_progress"> | null;
};

export async function getEnrolledCoursesForUser(
  userId: string,
): Promise<EnrolledCourseItem[]> {
  const supabase = await createClient();
  const { data: enrolments } = await supabase
    .from("course_enrolments")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["active", "completed"])
    .order("enrolled_at", { ascending: false });

  if (!enrolments || enrolments.length === 0) return [];

  const courseIds = enrolments.map((e) => e.course_id);

  const [coursesRes, progressRes] = await Promise.all([
    supabase
      .from("courses")
      .select(
        "id, slug, title, subtitle, thumbnail_url, delivery_type, difficulty_level",
      )
      .in("id", courseIds),
    supabase
      .from("course_progress")
      .select("*")
      .eq("user_id", userId)
      .in("course_id", courseIds),
  ]);

  const courseMap = new Map(
    (coursesRes.data ?? []).map((c) => [c.id, c]),
  );
  const progressMap = new Map(
    (progressRes.data ?? []).map((p) => [p.course_id, p]),
  );

  return enrolments
    .map((enrolment) => {
      const course = courseMap.get(enrolment.course_id);
      if (!course) return null;
      return {
        enrolment,
        course,
        progress: progressMap.get(enrolment.course_id) ?? null,
      };
    })
    .filter((item): item is EnrolledCourseItem => item !== null);
}
