import type { Enums } from "@/types";

const colors: Record<Enums<"payment_status">, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
  refunded: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
  partially_refunded:
    "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
  cancelled: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

export function OrderStatusBadge({
  status,
}: {
  status: Enums<"payment_status">;
}) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${colors[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
