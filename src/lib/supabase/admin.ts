import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

let adminClient: SupabaseClient<Database> | null = null;

/**
 * Service-role Supabase client. Bypasses RLS — only use from server-only
 * code paths that need to perform privileged writes (webhooks, scheduled
 * jobs). NEVER import into client components.
 */
export function getAdminSupabase(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for the admin client.",
    );
  }
  if (!adminClient) {
    adminClient = createClient<Database>(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return adminClient;
}
