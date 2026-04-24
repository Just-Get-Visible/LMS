import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types";

export async function getMyNotifications(
  userId: string,
  limit = 50,
): Promise<Tables<"notifications">[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export const getMyUnreadNotificationCount = cache(
  async (userId: string): Promise<number> => {
    const supabase = await createClient();
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    return count ?? 0;
  },
);
