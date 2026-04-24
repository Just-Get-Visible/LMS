import Link from "next/link";

import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { listOrders } from "@/lib/data/orders";
import { formatDateTime, formatPrice } from "@/lib/format";

export const metadata = {
  title: "Orders · Admin",
};

export default async function AdminOrdersPage() {
  const items = await listOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {items.length} order{items.length === 1 ? "" : "s"} shown.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Orders will appear here as students check out."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-md border border-black/10 dark:border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-2 font-medium">Order</th>
                    <th className="px-4 py-2 font-medium">Item</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium">Total</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {items.map(({ order, course, cohort }) => (
                    <tr key={order.id}>
                      <td className="px-4 py-3">
                        <p className="font-medium">{order.order_number}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {formatDateTime(order.created_at)}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-700 dark:text-zinc-300">
                        {course?.title ?? cohort?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.payment_status} />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {formatPrice(
                          order.total_amount,
                          order.currency_code,
                          false,
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
