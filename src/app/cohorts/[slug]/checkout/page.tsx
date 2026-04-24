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
import { getCohortBySlug } from "@/lib/data/cohorts";
import { isEnrolledInCohort } from "@/lib/data/enrolments";

type Params = Promise<{ slug: string }>;

export const metadata = {
  title: "Cohort checkout",
};

export default async function CohortCheckoutPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;

  const cohort = await getCohortBySlug(slug);
  if (!cohort) notFound();

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=/cohorts/${slug}/checkout`);
  }

  const enrolled = await isEnrolledInCohort(user.id, cohort.id);
  if (enrolled) {
    redirect(`/dashboard/cohorts/${cohort.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 space-y-2">
        <Link
          href={`/cohorts/${cohort.slug}`}
          className="text-xs text-zinc-500 hover:text-brand-600 dark:text-zinc-400 dark:hover:text-brand-300"
        >
          ← Back to cohort
        </Link>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Checkout
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">{cohort.name}</p>
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
              kind: "cohort",
              id: cohort.id,
              title: cohort.name,
              price_amount: cohort.price_amount,
              currency_code: cohort.currency_code,
            }}
            defaultEmail={user.email ?? undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}
