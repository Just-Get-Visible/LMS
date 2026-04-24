import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types";

type CourseRef = Pick<Tables<"courses">, "id" | "slug" | "title">;
type CohortRef = Pick<Tables<"cohorts">, "id" | "slug" | "name">;

export type OrderWithItem = {
  order: Tables<"orders">;
  course: CourseRef | null;
  cohort: CohortRef | null;
};

// Back-compat alias for any caller still on the old name.
export type OrderWithCourse = OrderWithItem;

async function attachItems(
  orders: Tables<"orders">[],
): Promise<OrderWithItem[]> {
  if (orders.length === 0) return [];
  const supabase = await createClient();

  const courseIds = [
    ...new Set(
      orders.map((o) => o.course_id).filter((id): id is string => !!id),
    ),
  ];
  const cohortIds = [
    ...new Set(
      orders.map((o) => o.cohort_id).filter((id): id is string => !!id),
    ),
  ];

  const [coursesRes, cohortsRes] = await Promise.all([
    courseIds.length
      ? supabase.from("courses").select("id, slug, title").in("id", courseIds)
      : Promise.resolve({ data: [] as CourseRef[] }),
    cohortIds.length
      ? supabase.from("cohorts").select("id, slug, name").in("id", cohortIds)
      : Promise.resolve({ data: [] as CohortRef[] }),
  ]);

  const courseMap = new Map((coursesRes.data ?? []).map((c) => [c.id, c]));
  const cohortMap = new Map((cohortsRes.data ?? []).map((c) => [c.id, c]));

  return orders.map((order) => ({
    order,
    course: order.course_id ? courseMap.get(order.course_id) ?? null : null,
    cohort: order.cohort_id ? cohortMap.get(order.cohort_id) ?? null : null,
  }));
}

export async function getMyOrders(
  userId: string,
): Promise<OrderWithItem[]> {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return attachItems(orders ?? []);
}

export async function getOrderById(
  id: string,
): Promise<Tables<"orders"> | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function listOrders(): Promise<OrderWithItem[]> {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  return attachItems(orders ?? []);
}
