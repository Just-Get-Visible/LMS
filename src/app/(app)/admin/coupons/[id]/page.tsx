import Link from "next/link";
import { notFound } from "next/navigation";

import { CouponEditForm } from "@/components/coupons/coupon-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  deleteCouponAction,
  setCouponActiveAction,
} from "@/lib/actions/coupons";
import { getCouponById } from "@/lib/data/coupons";

type Params = Promise<{ id: string }>;

export const metadata = {
  title: "Coupon · Admin",
};

export default async function AdminCouponDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const coupon = await getCouponById(id);
  if (!coupon) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/admin/coupons"
          className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← All coupons
        </Link>
        <div className="mt-2 flex items-start justify-between gap-3">
          <h1 className="font-mono text-2xl font-semibold tracking-tight">
            {coupon.code}
          </h1>
          <div className="flex items-center gap-2">
            <form
              action={setCouponActiveAction.bind(
                null,
                coupon.id,
                !coupon.is_active,
              )}
            >
              <Button type="submit" size="sm" variant="ghost">
                {coupon.is_active ? "Deactivate" : "Activate"}
              </Button>
            </form>
            <form action={deleteCouponAction.bind(null, coupon.id)}>
              <Button type="submit" size="sm" variant="destructive">
                Delete
              </Button>
            </form>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coupon details</CardTitle>
        </CardHeader>
        <CardContent>
          <CouponEditForm coupon={coupon} />
        </CardContent>
      </Card>
    </div>
  );
}
