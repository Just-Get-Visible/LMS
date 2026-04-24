import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatDeliveryType,
  formatDuration,
  formatPrice,
} from "@/lib/format";
import type { Tables } from "@/types";

interface CourseSidebarProps {
  course: Tables<"courses">;
  hasAccess: boolean;
  isAuthenticated: boolean;
}

export function CourseSidebar({
  course,
  hasAccess,
  isAuthenticated,
}: CourseSidebarProps) {
  const duration = formatDuration(course.estimated_duration_hours);

  return (
    <Card>
      <CardContent className="space-y-5 pt-6">
        <div className="text-3xl font-semibold tracking-tight">
          {formatPrice(
            course.price_amount,
            course.currency_code,
            course.is_free,
          )}
        </div>

        {hasAccess ? (
          <div className="space-y-3">
            <div className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              You have access to this course.
            </div>
            <Link href="/dashboard" className="block">
              <Button className="w-full">Go to dashboard</Button>
            </Link>
          </div>
        ) : isAuthenticated ? (
          <Link href={`/courses/${course.slug}/checkout`} className="block">
            <Button className="w-full">
              {course.is_free || !course.price_amount ? "Enrol now" : "Buy course"}
            </Button>
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
          <Row label="Delivery">{formatDeliveryType(course.delivery_type)}</Row>
          {course.difficulty_level && (
            <Row label="Level" capitalize>
              {course.difficulty_level}
            </Row>
          )}
          {duration && <Row label="Duration">{duration}</Row>}
          {course.certificate_enabled && (
            <Row label="Certificate">Included</Row>
          )}
        </dl>
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  children,
  capitalize,
}: {
  label: string;
  children: ReactNode;
  capitalize?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd
        className={`text-right font-medium ${capitalize ? "capitalize" : ""}`}
      >
        {children}
      </dd>
    </div>
  );
}
