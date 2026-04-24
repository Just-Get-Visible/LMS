import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isAdmin } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";
import { getOrderById } from "@/lib/data/orders";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime, formatPrice } from "@/lib/format";

type Params = Promise<{ id: string }>;

export const metadata = {
  title: "Order",
};

export default async function StudentOrderDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const user = await requireUser();

  const order = await getOrderById(id);
  if (!order) notFound();

  const allowed = order.user_id === user.id || (await isAdmin(user.id));
  if (!allowed) notFound();

  const supabase = await createClient();
  const { data: course } = order.course_id
    ? await supabase
        .from("courses")
        .select("id, slug, title")
        .eq("id", order.course_id)
        .maybeSingle()
    : { data: null };
  const { data: cohort } = order.cohort_id
    ? await supabase
        .from("cohorts")
        .select("id, slug, name")
        .eq("id", order.cohort_id)
        .maybeSingle()
    : { data: null };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/dashboard/orders"
          className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← All orders
        </Link>
        <div className="mt-2 flex items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {order.order_number}
          </h1>
          <OrderStatusBadge status={order.payment_status} />
        </div>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {formatDateTime(order.created_at)}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Item</CardTitle>
        </CardHeader>
        <CardContent>
          {course ? (
            <Link
              href={`/dashboard/courses/${course.id}`}
              className="text-sm font-medium hover:underline"
            >
              {course.title}
            </Link>
          ) : cohort ? (
            <Link
              href={`/dashboard/cohorts/${cohort.id}`}
              className="text-sm font-medium hover:underline"
            >
              {cohort.name}
            </Link>
          ) : (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">—</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            <Row label="Subtotal">
              {formatPrice(order.subtotal_amount, order.currency_code, false)}
            </Row>
            {order.discount_amount > 0 && (
              <Row label="Discount">
                -{formatPrice(order.discount_amount, order.currency_code, false)}
              </Row>
            )}
            {order.tax_amount > 0 && (
              <Row label="Tax">
                {formatPrice(order.tax_amount, order.currency_code, false)}
              </Row>
            )}
            <div className="flex justify-between border-t border-black/10 pt-2 dark:border-white/10">
              <dt className="font-semibold">Total</dt>
              <dd className="text-lg font-semibold">
                {formatPrice(order.total_amount, order.currency_code, false)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Row label="Name">{order.billing_name ?? "—"}</Row>
            <Row label="Email">{order.billing_email ?? "—"}</Row>
            <Row label="Country">{order.billing_country_code ?? "—"}</Row>
            <Row label="Provider">
              <span className="capitalize">
                {order.payment_provider ?? "—"}
              </span>
            </Row>
            {order.paid_at && (
              <Row label="Paid at">{formatDateTime(order.paid_at)}</Row>
            )}
            {order.refunded_at && (
              <Row label="Refunded at">
                {formatDateTime(order.refunded_at)}
              </Row>
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="font-medium text-zinc-800 dark:text-zinc-200">
        {children}
      </dd>
    </div>
  );
}
