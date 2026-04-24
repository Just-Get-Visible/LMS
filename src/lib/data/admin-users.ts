import { createClient } from "@/lib/supabase/server";
import type { Enums, Tables } from "@/types";

export type UserListItem = Pick<
  Tables<"profiles">,
  | "id"
  | "full_name"
  | "first_name"
  | "last_name"
  | "email"
  | "is_active"
  | "created_at"
  | "last_seen_at"
>;

export async function listUsers(filters?: {
  search?: string;
}): Promise<UserListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select(
      "id, full_name, first_name, last_name, email, is_active, created_at, last_seen_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (filters?.search) {
    // Strict allowlist — input is interpolated into a PostgREST .or() filter,
    // so commas and parens (separators) need to be stripped, not just LIKE wildcards.
    const term = filters.search.replace(/[^a-zA-Z0-9@.\s_-]/g, "").trim();
    if (term.length > 0) {
      query = query.or(
        `email.ilike.%${term}%,full_name.ilike.%${term}%`,
      );
    }
  }

  const { data } = await query;
  return data ?? [];
}

export type UserDetails = {
  profile: Tables<"profiles">;
  roles: Enums<"app_role">[];
};

export async function getUserDetails(
  userId: string,
): Promise<UserDetails | null> {
  const supabase = await createClient();
  const [profileRes, rolesRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
  ]);

  if (!profileRes.data) return null;
  return {
    profile: profileRes.data,
    roles: (rolesRes.data ?? []).map((r) => r.role),
  };
}
