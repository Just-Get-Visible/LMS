import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { listCoupons } from "@/lib/data/coupons";
import { formatPrice } from "@/lib/format";

export const metadata = {
  title: "Coupons · Admin",
};

export default async function AdminCouponsPage() {
  const coupons = await listCoupons();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Coupons</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Discount codes for checkout.
          </p>
        </div>
        <Link href="/admin/coupons/new">
          <Button>New coupon</Button>
        </Link>
      </div>

      {coupons.length === 0 ? (
        <EmptyState
          title="No coupons yet"
          description="Create a coupon to offer discounts."
          action={
            <Link href="/admin/coupons/new">
              <Button>Create coupon</Button>
            </Link>
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All coupons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-md border border-black/10 dark:border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-2 font-medium">Code</th>
                    <th className="px-4 py-2 font-medium">Type</th>
                    <th className="px-4 py-2 font-medium">Value</th>
                    <th className="px-4 py-2 font-medium">Uses</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {coupons.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-3 font-mono font-medium">
                        {c.code}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="capitalize">
                          {c.coupon_type.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {c.coupon_type === "percentage"
                          ? `${c.value_amount}%`
                          : formatPrice(
                              c.value_amount,
                              c.currency_code,
                              false,
                            )}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">
                        {c.used_count}
                        {c.max_uses != null && ` / ${c.max_uses}`}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {c.is_active ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/coupons/${c.id}`}
                          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                        >
                          Edit →
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
