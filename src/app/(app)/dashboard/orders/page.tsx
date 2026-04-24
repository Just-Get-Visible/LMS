import Link from "next/link";

import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/user";
import { getMyOrders } from "@/lib/data/orders";
import { formatDateTime, formatPrice } from "@/lib/format";

export const metadata = {
  title: "Orders",
};

export default async function StudentOrdersPage() {
  const user = await requireUser();
  const items = await getMyOrders(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Your purchase history.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Once you buy a course, your receipts will appear here."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All orders</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-black/5 dark:divide-white/5">
              {items.map(({ order, course, cohort }) => (
                <li key={order.id}>
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:underline"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-sm font-medium">
                        {course?.title ?? cohort?.name ?? "Order"}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {order.order_number} ·{" "}
                        {formatDateTime(order.created_at)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <OrderStatusBadge status={order.payment_status} />
                      <span className="text-sm font-medium">
                        {formatPrice(
                          order.total_amount,
                          order.currency_code,
                          false,
                        )}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
