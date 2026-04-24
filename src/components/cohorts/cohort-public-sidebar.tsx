import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime, formatPrice } from "@/lib/format";
import type { Tables } from "@/types";

interface Props {
  cohort: Tables<"cohorts">;
  hasAccess: boolean;
  isAuthenticated: boolean;
}

export function CohortPublicSidebar({
  cohort,
  hasAccess,
  isAuthenticated,
}: Props) {
  const enrolmentClosed =
    !!cohort.enrolment_closes_at &&
    new Date(cohort.enrolment_closes_at) < new Date();
  const cancelled = cohort.status === "cancelled";
  const completed = cohort.status === "completed";
  const canBuy = !enrolmentClosed && !cancelled && !completed;

  return (
    <Card>
      <CardContent className="space-y-5 pt-6">
        <div className="text-3xl font-semibold tracking-tight">
          {formatPrice(
            cohort.price_amount,
            cohort.currency_code,
            cohort.price_amount === 0,
          )}
        </div>

        {hasAccess ? (
          <div className="space-y-3">
            <div className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              You&apos;re in this cohort.
            </div>
            <Link href={`/dashboard/cohorts/${cohort.id}`} className="block">
              <Button className="w-full">Open cohort</Button>
            </Link>
          </div>
        ) : !canBuy ? (
          <Button className="w-full" disabled>
            {cancelled
              ? "Cancelled"
              : completed
                ? "Cohort finished"
                : "Enrolment closed"}
          </Button>
        ) : isAuthenticated ? (
          <Link href={`/cohorts/${cohort.slug}/checkout`} className="block">
            <Button className="w-full">Buy cohort</Button>
          </Link>
        ) : (
          <div className="space-y-2">
            <Link href="/login" className="block">
              <Button className="w-full">Sign in to enrol</Button>
            </Link>
            <Link href="/signup" className="block">
              <Button variant="outline" className="w-full">
                Create account
              </Button>
            </Link>
          </div>
        )}

        <dl className="space-y-3 border-t border-black/5 pt-4 text-sm dark:border-white/5">
          {cohort.starts_at && (
            <Row label="Starts">{formatDateTime(cohort.starts_at)}</Row>
          )}
          {cohort.ends_at && (
            <Row label="Ends">{formatDateTime(cohort.ends_at)}</Row>
          )}
          {cohort.enrolment_closes_at && (
            <Row label="Enrolment closes">
              {formatDateTime(cohort.enrolment_closes_at)}
            </Row>
          )}
          {cohort.live_session_frequency && (
            <Row label="Sessions">{cohort.live_session_frequency}</Row>
          )}
          {cohort.timezone && <Row label="Timezone">{cohort.timezone}</Row>}
          {cohort.capacity && (
            <Row label="Capacity">{cohort.capacity}</Row>
          )}
        </dl>
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}
