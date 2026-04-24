import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderAdminActions } from "@/components/admin/order-actions";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getOrderById } from "@/lib/data/orders";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime, formatPrice } from "@/lib/format";

type Params = Promise<{ id: string }>;

export const metadata = {
  title: "Order · Admin",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;

  const order = await getOrderById(id);
  if (!order) notFound();

  const supabase = await createClient();
  const [{ data: course }, { data: cohort }, { data: student }] =
    await Promise.all([
      order.course_id
        ? supabase
            .from("courses")
            .select("id, title, slug")
            .eq("id", order.course_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      order.cohort_id
        ? supabase
            .from("cohorts")
            .select("id, name, slug")
            .eq("id", order.cohort_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("id", order.user_id)
        .maybeSingle(),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/orders"
          className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← All orders
        </Link>
        <div className="mt-2 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {order.order_number}
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {formatDateTime(order.created_at)}
            </p>
          </div>
          <OrderStatusBadge status={order.payment_status} />
        </div>
      </div>

      <OrderAdminActions order={order} />

      <Card>
        <CardHeader>
          <CardTitle>Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium">
            {student?.full_name?.trim() || student?.email || "Customer"}
          </p>
          {student?.email && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {student.email}
            </p>
          )}
          <Link
            href={`/admin/users/${order.user_id}`}
            className="mt-2 inline-block text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Open user →
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Item & pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {course && (
            <p className="text-sm font-medium">{course.title}</p>
          )}
          {cohort && (
            <p className="text-sm font-medium">{cohort.name}</p>
          )}
          {!course && !cohort && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">—</p>
          )}
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
          <CardTitle>Billing & payment</CardTitle>
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
            {order.provider_reference && (
              <Row label="Reference">{order.provider_reference}</Row>
            )}
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
