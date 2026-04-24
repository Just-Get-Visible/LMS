import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types";

export async function getProfileById(
  userId: string,
): Promise<Tables<"profiles"> | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return data;
}
