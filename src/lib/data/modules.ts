import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types";

export async function getModulesForCourse(
  courseId: string,
): Promise<Tables<"course_modules">[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("course_modules")
    .select("*")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getModuleById(
  moduleId: string,
): Promise<Tables<"course_modules"> | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("course_modules")
    .select("*")
    .eq("id", moduleId)
    .maybeSingle();
  return data;
}
