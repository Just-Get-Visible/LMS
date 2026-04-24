import Link from "next/link";

import { AdminStatsGrid } from "@/components/admin/admin-stats-grid";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getAdminStats,
  getRecentOrders,
  getRecentSignups,
} from "@/lib/data/admin";
import { formatDateTime, formatPrice } from "@/lib/format";

export const metadata = {
  title: "Admin",
};

export default async function AdminDashboardPage() {
  const [stats, signups, orders] = await Promise.all([
    getAdminStats(),
    getRecentSignups(8),
    getRecentOrders(8),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Admin
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Platform-wide overview and management.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/admin/users">
          <Button variant="outline" size="sm">
            Users
          </Button>
        </Link>
        <Link href="/instructor/courses">
          <Button variant="outline" size="sm">
            Courses
          </Button>
        </Link>
        <Link href="/instructor/cohorts">
          <Button variant="outline" size="sm">
            Cohorts
          </Button>
        </Link>
      </div>

      <AdminStatsGrid stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent signups</CardTitle>
            <CardDescription>Latest users to join.</CardDescription>
          </CardHeader>
          <CardContent>
            {signups.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No signups yet.
              </p>
            ) : (
              <ul className="divide-y divide-black/5 dark:divide-white/5">
                {signups.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <Link
                        href={`/admin/users/${s.id}`}
                        className="block truncate text-sm font-medium hover:underline"
                      >
                        {s.full_name?.trim() || s.email || "User"}
                      </Link>
                      {s.email && s.full_name?.trim() && (
                        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                          {s.email}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                      {formatDateTime(s.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>Latest order activity.</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No orders yet.
              </p>
            ) : (
              <ul className="divide-y divide-black/5 dark:divide-white/5">
                {orders.map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate text-sm font-medium">
                        {o.order_number}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="capitalize">{o.payment_status}</span>
                        {" · "}
                        {formatDateTime(o.created_at)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-medium">
                      {formatPrice(o.total_amount, o.currency_code, false)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
