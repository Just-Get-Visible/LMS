import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types";

export async function getLessonById(
  lessonId: string,
): Promise<Tables<"lessons"> | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .maybeSingle();
  return data;
}

export async function getLessonsForCourse(
  courseId: string,
): Promise<Tables<"lessons">[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true });
  return data ?? [];
}
