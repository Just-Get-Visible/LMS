import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types";

export type CourseCardData = Pick<
  Tables<"courses">,
  | "id"
  | "slug"
  | "title"
  | "subtitle"
  | "short_description"
  | "thumbnail_url"
  | "price_amount"
  | "currency_code"
  | "is_free"
  | "delivery_type"
  | "difficulty_level"
  | "tags"
>;

const COURSE_CARD_COLUMNS =
  "id, slug, title, subtitle, short_description, thumbnail_url, price_amount, currency_code, is_free, delivery_type, difficulty_level, tags";

export type CatalogFilters = {
  search?: string;
  delivery?: "self_paced" | "cohort" | "hybrid";
  difficulty?: string;
  pricing?: "free" | "paid";
  tag?: string;
};

export async function listPublicCourses(
  filters?: CatalogFilters,
): Promise<CourseCardData[]> {
  const supabase = await createClient();
  let query = supabase
    .from("courses")
    .select(COURSE_CARD_COLUMNS)
    .eq("visibility", "public")
    .is("archived_at", null)
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false, nullsFirst: false });

  if (filters?.search) {
    const safe = filters.search.replace(/[%_\\]/g, "\\$&");
    query = query.ilike("title", `%${safe}%`);
  }
  if (filters?.delivery) {
    query = query.eq("delivery_type", filters.delivery);
  }
  if (filters?.difficulty) {
    const safe = filters.difficulty.replace(/[^a-zA-Z0-9 _-]/g, "");
    if (safe) query = query.ilike("difficulty_level", safe);
  }
  if (filters?.pricing === "free") {
    query = query.eq("is_free", true);
  } else if (filters?.pricing === "paid") {
    query = query.eq("is_free", false);
  }
  if (filters?.tag) {
    const safe = filters.tag.trim();
    if (safe) query = query.contains("tags", [safe]);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getCourseBySlug(
  slug: string,
): Promise<Tables<"courses"> | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("visibility", "public")
    .is("archived_at", null)
    .maybeSingle();
  return data;
}

export type CourseInstructorSummary = Pick<
  Tables<"profiles">,
  "id" | "full_name" | "first_name" | "last_name" | "avatar_url" | "headline"
>;

export type CourseStudentItem = {
  enrolment: Tables<"course_enrolments">;
  profile: Pick<
    Tables<"profiles">,
    "id" | "full_name" | "first_name" | "last_name" | "email" | "avatar_url"
  > | null;
};

export async function getCourseStudents(
  courseId: string,
): Promise<CourseStudentItem[]> {
  const supabase = await createClient();
  const { data: enrolments } = await supabase
    .from("course_enrolments")
    .select("*")
    .eq("course_id", courseId)
    .order("enrolled_at", { ascending: false });

  if (!enrolments || enrolments.length === 0) return [];

  const userIds = [...new Set(enrolments.map((e) => e.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, first_name, last_name, email, avatar_url")
    .in("id", userIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  return enrolments.map((enrolment) => ({
    enrolment,
    profile: profileMap.get(enrolment.user_id) ?? null,
  }));
}

export async function getCourseInstructor(
  userId: string,
): Promise<CourseInstructorSummary | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, first_name, last_name, avatar_url, headline")
    .eq("id", userId)
    .maybeSingle();
  return data;
}

export type CurriculumSection = {
  module: Tables<"course_modules"> | null;
  lessons: Tables<"lessons">[];
};

export async function getCourseCurriculum(
  courseId: string,
): Promise<CurriculumSection[]> {
  const supabase = await createClient();
  const [modulesResult, lessonsResult] = await Promise.all([
    supabase
      .from("course_modules")
      .select("*")
      .eq("course_id", courseId)
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
  ]);

  const modules = modulesResult.data ?? [];
  const lessons = lessonsResult.data ?? [];

  const lessonsByModule = new Map<string | null, Tables<"lessons">[]>();
  for (const lesson of lessons) {
    const key = lesson.module_id;
    const list = lessonsByModule.get(key) ?? [];
    list.push(lesson);
    lessonsByModule.set(key, list);
  }

  const sections: CurriculumSection[] = modules.map((module) => ({
    module,
    lessons: lessonsByModule.get(module.id) ?? [],
  }));

  const unassigned = lessonsByModule.get(null) ?? [];
  if (unassigned.length > 0) {
    sections.push({ module: null, lessons: unassigned });
  }

  return sections;
}
