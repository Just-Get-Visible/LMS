import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CheckoutForm } from "@/components/checkout/checkout-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/user";
import { getCourseBySlug } from "@/lib/data/courses";
import { isEnrolledInCourse } from "@/lib/data/enrolments";

type Params = Promise<{ slug: string }>;

export const metadata = {
  title: "Checkout",
};

export default async function CheckoutPage({ params }: { params: Params }) {
  const { slug } = await params;

  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=/courses/${slug}/checkout`);
  }

  const enrolled = await isEnrolledInCourse(user.id, course.id);
  if (enrolled) {
    redirect(`/dashboard/courses/${course.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 space-y-2">
        <Link
          href={`/courses/${course.slug}`}
          className="text-xs text-zinc-500 hover:text-brand-600 dark:text-zinc-400 dark:hover:text-brand-300"
        >
          ← Back to course
        </Link>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Checkout
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">{course.title}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order details</CardTitle>
          <CardDescription>
            Apply a coupon and review your total before paying.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CheckoutForm
            item={{
              kind: "course",
              id: course.id,
              title: course.title,
              price_amount: course.price_amount,
              currency_code: course.currency_code,
            }}
            defaultEmail={user.email ?? undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}
