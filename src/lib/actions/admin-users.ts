"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types";

const VALID_ROLES: Enums<"app_role">[] = [
  "admin",
  "instructor",
  "student",
  "staff",
];

function pickRole(v: FormDataEntryValue | null): Enums<"app_role"> | null {
  return VALID_ROLES.includes(v as Enums<"app_role">)
    ? (v as Enums<"app_role">)
    : null;
}

export async function assignRoleAction(
  targetUserId: string,
  formData: FormData,
): Promise<void> {
  const user = await requireUser();
  await requireAdmin(user.id);

  const role = pickRole(formData.get("role"));
  if (!role) return;

  const supabase = await createClient();
  await supabase
    .from("user_roles")
    .upsert(
      { user_id: targetUserId, role },
      { onConflict: "user_id,role", ignoreDuplicates: true },
    );

  revalidatePath(`/admin/users/${targetUserId}`);
  revalidatePath("/admin/users");
}

export async function removeRoleAction(
  targetUserId: string,
  role: Enums<"app_role">,
): Promise<void> {
  const user = await requireUser();
  await requireAdmin(user.id);

  const supabase = await createClient();
  await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", targetUserId)
    .eq("role", role);

  revalidatePath(`/admin/users/${targetUserId}`);
  revalidatePath("/admin/users");
}

export async function setUserActiveAction(
  targetUserId: string,
  isActive: boolean,
): Promise<void> {
  const user = await requireUser();
  await requireAdmin(user.id);

  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", targetUserId);

  revalidatePath(`/admin/users/${targetUserId}`);
  revalidatePath("/admin/users");
}

export async function bulkAssignRoleAction(
  userIds: string[],
  formData: FormData,
): Promise<void> {
  if (userIds.length === 0) return;
  const user = await requireUser();
  await requireAdmin(user.id);

  const role = pickRole(formData.get("role"));
  if (!role) return;

  const supabase = await createClient();
  await supabase.from("user_roles").upsert(
    userIds.map((uid) => ({ user_id: uid, role })),
    { onConflict: "user_id,role", ignoreDuplicates: true },
  );

  revalidatePath("/admin/users");
}

export async function bulkRemoveRoleAction(
  userIds: string[],
  formData: FormData,
): Promise<void> {
  if (userIds.length === 0) return;
  const user = await requireUser();
  await requireAdmin(user.id);

  const role = pickRole(formData.get("role"));
  if (!role) return;

  const supabase = await createClient();
  await supabase
    .from("user_roles")
    .delete()
    .in("user_id", userIds)
    .eq("role", role);

  revalidatePath("/admin/users");
}
