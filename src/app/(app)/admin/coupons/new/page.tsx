import { CouponCreateForm } from "@/components/coupons/coupon-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "New coupon · Admin",
};

export default function NewCouponPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New coupon</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Create a new discount code.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coupon details</CardTitle>
          <CardDescription>
            Codes are uppercased and validated case-insensitively at checkout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CouponCreateForm />
        </CardContent>
      </Card>
    </div>
  );
}
