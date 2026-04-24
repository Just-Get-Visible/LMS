import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types";

export async function getResourcesForLesson(
  lessonId: string,
): Promise<Tables<"resources">[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("resources")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getResourcesForModule(
  moduleId: string,
): Promise<Tables<"resources">[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("resources")
    .select("*")
    .eq("module_id", moduleId)
    .is("lesson_id", null)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getCourseLevelResources(
  courseId: string,
): Promise<Tables<"resources">[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("resources")
    .select("*")
    .eq("course_id", courseId)
    .is("lesson_id", null)
    .is("module_id", null)
    .order("sort_order", { ascending: true });
  return data ?? [];
}
