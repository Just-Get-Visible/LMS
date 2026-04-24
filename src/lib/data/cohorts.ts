import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types";

type CohortSummary = Pick<
  Tables<"cohorts">,
  "id" | "name" | "slug" | "status" | "starts_at" | "ends_at" | "course_id"
>;

type CourseRef = Pick<Tables<"courses">, "id" | "title" | "slug">;

export type ActiveCohortItem = {
  enrolment: Tables<"cohort_enrolments">;
  cohort: CohortSummary;
  course: CourseRef | null;
};

export async function getActiveCohortsForUser(
  userId: string,
): Promise<ActiveCohortItem[]> {
  const supabase = await createClient();
  const { data: enrolments } = await supabase
    .from("cohort_enrolments")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["active", "completed"])
    .order("enrolled_at", { ascending: false });

  if (!enrolments || enrolments.length === 0) return [];

  const cohortIds = enrolments.map((e) => e.cohort_id);

  const { data: cohorts } = await supabase
    .from("cohorts")
    .select("id, name, slug, status, starts_at, ends_at, course_id")
    .in("id", cohortIds);

  if (!cohorts || cohorts.length === 0) return [];

  const courseIds = [...new Set(cohorts.map((c) => c.course_id))];
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, slug")
    .in("id", courseIds);

  const cohortMap = new Map(cohorts.map((c) => [c.id, c]));
  const courseMap = new Map((courses ?? []).map((c) => [c.id, c]));

  return enrolments
    .map((enrolment) => {
      const cohort = cohortMap.get(enrolment.cohort_id);
      if (!cohort) return null;
      return {
        enrolment,
        cohort,
        course: courseMap.get(cohort.course_id) ?? null,
      };
    })
    .filter((item): item is ActiveCohortItem => item !== null);
}

export async function getCohortById(
  cohortId: string,
): Promise<Tables<"cohorts"> | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cohorts")
    .select("*")
    .eq("id", cohortId)
    .maybeSingle();
  return data;
}

export async function getCohortBySlug(
  slug: string,
): Promise<Tables<"cohorts"> | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cohorts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

export async function getPublicCohortsForCourse(
  courseId: string,
): Promise<Tables<"cohorts">[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cohorts")
    .select("*")
    .eq("course_id", courseId)
    .in("status", ["open", "running"])
    .order("starts_at", { ascending: true, nullsFirst: false });
  return data ?? [];
}

export type PublicCohortListItem = {
  cohort: Tables<"cohorts">;
  course: Pick<Tables<"courses">, "id" | "title" | "slug"> | null;
};

export async function listPublicCohorts(): Promise<PublicCohortListItem[]> {
  const supabase = await createClient();
  const { data: cohorts } = await supabase
    .from("cohorts")
    .select("*")
    .in("status", ["open", "running"])
    .order("starts_at", { ascending: true, nullsFirst: false });

  if (!cohorts || cohorts.length === 0) return [];

  const courseIds = [...new Set(cohorts.map((c) => c.course_id))];
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, slug, visibility")
    .in("id", courseIds);

  // Restrict to cohorts whose parent course is public — defence-in-depth on
  // top of the existing cohorts SELECT RLS policy.
  const publicCourseMap = new Map(
    (courses ?? [])
      .filter((c) => c.visibility === "public")
      .map((c) => [c.id, { id: c.id, title: c.title, slug: c.slug }]),
  );

  return cohorts
    .filter((c) => publicCourseMap.has(c.course_id))
    .map((cohort) => ({
      cohort,
      course: publicCourseMap.get(cohort.course_id) ?? null,
    }));
}

export type InstructorCohortSummary = Pick<
  Tables<"cohorts">,
  | "id"
  | "name"
  | "slug"
  | "status"
  | "starts_at"
  | "ends_at"
  | "course_id"
  | "capacity"
>;

export async function getInstructorCohorts(
  userId: string,
): Promise<InstructorCohortSummary[]> {
  const supabase = await createClient();
  const { data: ci } = await supabase
    .from("cohort_instructors")
    .select("cohort_id")
    .eq("user_id", userId);

  const cohortIds = ci?.map((row) => row.cohort_id) ?? [];
  if (cohortIds.length === 0) return [];

  const { data } = await supabase
    .from("cohorts")
    .select(
      "id, name, slug, status, starts_at, ends_at, course_id, capacity",
    )
    .in("id", cohortIds)
    .order("starts_at", { ascending: false, nullsFirst: false });

  return data ?? [];
}

type ProfileRef = Pick<
  Tables<"profiles">,
  "id" | "full_name" | "first_name" | "last_name" | "email" | "avatar_url"
>;

export type CohortStudentItem = {
  enrolment: Tables<"cohort_enrolments">;
  profile: ProfileRef | null;
};

export async function getCohortStudents(
  cohortId: string,
): Promise<CohortStudentItem[]> {
  const supabase = await createClient();
  const { data: enrolments } = await supabase
    .from("cohort_enrolments")
    .select("*")
    .eq("cohort_id", cohortId)
    .order("enrolled_at", { ascending: false });

  if (!enrolments || enrolments.length === 0) return [];

  const userIds = [...new Set(enrolments.map((e) => e.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, first_name, last_name, email, avatar_url")
    .in("id", userIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p]),
  );

  return enrolments.map((enrolment) => ({
    enrolment,
    profile: profileMap.get(enrolment.user_id) ?? null,
  }));
}

export type CohortInstructorItem = {
  link: Tables<"cohort_instructors">;
  profile: ProfileRef | null;
};

export async function getCohortInstructors(
  cohortId: string,
): Promise<CohortInstructorItem[]> {
  const supabase = await createClient();
  const { data: links } = await supabase
    .from("cohort_instructors")
    .select("*")
    .eq("cohort_id", cohortId)
    .order("created_at", { ascending: true });

  if (!links || links.length === 0) return [];

  const userIds = [...new Set(links.map((l) => l.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, first_name, last_name, email, avatar_url")
    .in("id", userIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p]),
  );

  return links.map((link) => ({
    link,
    profile: profileMap.get(link.user_id) ?? null,
  }));
}
