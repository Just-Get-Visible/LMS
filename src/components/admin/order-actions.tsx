import { Button } from "@/components/ui/button";
import {
  markOrderPaidAction,
  refundOrderAction,
} from "@/lib/actions/orders";
import type { Tables } from "@/types";

export function OrderAdminActions({ order }: { order: Tables<"orders"> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {order.payment_status !== "paid" && (
        <form action={markOrderPaidAction.bind(null, order.id)}>
          <Button type="submit" size="sm">
            Mark paid + enrol
          </Button>
        </form>
      )}
      {order.payment_status === "paid" && (
        <form action={refundOrderAction.bind(null, order.id)}>
          <Button type="submit" size="sm" variant="destructive">
            Mark refunded
          </Button>
        </form>
      )}
    </div>
  );
}
