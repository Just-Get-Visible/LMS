import { createClient } from "@/lib/supabase/server";
import type { Enums, Tables } from "@/types";

export type AdminStats = {
  totalUsers: number;
  totalCourses: number;
  totalCohorts: number;
  activeEnrolments: number;
  paidOrders: number;
  roleCounts: Partial<Record<Enums<"app_role">, number>>;
  // Revenue, summed per currency. Map preserves order of first sighting.
  revenueByCurrency: Record<string, number>;
  revenueLast30d: Record<string, number>;
  revenuePrior30d: Record<string, number>;
  signupsLast30d: number;
  signupsPrior30d: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();
  const now = Date.now();
  const day = 86_400_000;
  const last30Start = new Date(now - 30 * day).toISOString();
  const prior30Start = new Date(now - 60 * day).toISOString();

  const [
    usersRes,
    coursesRes,
    cohortsRes,
    enrolmentsRes,
    ordersRes,
    rolesRes,
    paidOrdersRes,
    signupsLast30Res,
    signupsPrior30Res,
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("courses")
      .select("*", { count: "exact", head: true })
      .is("archived_at", null),
    supabase.from("cohorts").select("*", { count: "exact", head: true }),
    supabase
      .from("course_enrolments")
      .select("*", { count: "exact", head: true })
      .in("status", ["active", "completed"]),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("payment_status", "paid"),
    supabase.from("user_roles").select("role"),
    supabase
      .from("orders")
      .select("total_amount, currency_code, paid_at")
      .eq("payment_status", "paid")
      .not("paid_at", "is", null),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", last30Start),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", prior30Start)
      .lt("created_at", last30Start),
  ]);

  const roleCounts: Partial<Record<Enums<"app_role">, number>> = {};
  for (const row of rolesRes.data ?? []) {
    roleCounts[row.role] = (roleCounts[row.role] ?? 0) + 1;
  }

  const revenueByCurrency: Record<string, number> = {};
  const revenueLast30d: Record<string, number> = {};
  const revenuePrior30d: Record<string, number> = {};
  for (const order of paidOrdersRes.data ?? []) {
    const code = order.currency_code ?? "GBP";
    const amount = order.total_amount ?? 0;
    revenueByCurrency[code] = (revenueByCurrency[code] ?? 0) + amount;
    if (order.paid_at && order.paid_at >= last30Start) {
      revenueLast30d[code] = (revenueLast30d[code] ?? 0) + amount;
    } else if (
      order.paid_at &&
      order.paid_at >= prior30Start &&
      order.paid_at < last30Start
    ) {
      revenuePrior30d[code] = (revenuePrior30d[code] ?? 0) + amount;
    }
  }

  return {
    totalUsers: usersRes.count ?? 0,
    totalCourses: coursesRes.count ?? 0,
    totalCohorts: cohortsRes.count ?? 0,
    activeEnrolments: enrolmentsRes.count ?? 0,
    paidOrders: ordersRes.count ?? 0,
    roleCounts,
    revenueByCurrency,
    revenueLast30d,
    revenuePrior30d,
    signupsLast30d: signupsLast30Res.count ?? 0,
    signupsPrior30d: signupsPrior30Res.count ?? 0,
  };
}

export async function getRecentSignups(
  limit = 10,
): Promise<
  Pick<Tables<"profiles">, "id" | "full_name" | "email" | "created_at">[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getRecentOrders(
  limit = 10,
): Promise<Tables<"orders">[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
