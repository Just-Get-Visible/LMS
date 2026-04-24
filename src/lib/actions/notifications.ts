"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";

export async function markNotificationReadAction(
  notificationId: string,
  read: boolean,
): Promise<void> {
  const user = await requireUser();

  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({
      is_read: read,
      read_at: read ? new Date().toISOString() : null,
    })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/notifications");
  revalidatePath("/", "layout");
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const user = await requireUser();

  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("is_read", false);

  revalidatePath("/dashboard/notifications");
  revalidatePath("/", "layout");
}
