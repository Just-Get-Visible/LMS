import { redirect } from "next/navigation";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types";

export type AppRole = Enums<"app_role">;

export const getUserRoles = cache(async (userId: string): Promise<AppRole[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  return data?.map((row) => row.role) ?? [];
});

export async function hasRole(
  userId: string,
  role: AppRole,
): Promise<boolean> {
  const roles = await getUserRoles(userId);
  return roles.includes(role);
}

export async function isAdmin(userId: string): Promise<boolean> {
  return hasRole(userId, "admin");
}

export async function isInstructor(userId: string): Promise<boolean> {
  const roles = await getUserRoles(userId);
  return roles.includes("instructor") || roles.includes("admin");
}

export async function isStudent(userId: string): Promise<boolean> {
  return hasRole(userId, "student");
}

export async function requireRole(
  userId: string,
  role: AppRole | AppRole[],
): Promise<void> {
  const wanted = Array.isArray(role) ? role : [role];
  const roles = await getUserRoles(userId);
  const ok = roles.some((r) => wanted.includes(r));
  if (!ok) redirect("/unauthorized");
}

export async function requireAdmin(userId: string): Promise<void> {
  return requireRole(userId, "admin");
}

export async function requireInstructor(userId: string): Promise<void> {
  return requireRole(userId, ["instructor", "admin"]);
}
