import Link from "next/link";

import { TagChip } from "@/components/courses/tag-chip";
import { Badge } from "@/components/ui/badge";
import type { CourseCardData } from "@/lib/data/courses";
import { formatDeliveryType, formatPrice } from "@/lib/format";

export function CourseCard({ course }: { course: CourseCardData }) {
  const isFree = !!course.is_free || !course.price_amount;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-black/15 dark:border-white/10 dark:bg-zinc-950 dark:hover:border-white/20"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/40 dark:to-brand-800/40">
        {course.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnail_url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-brand-300 dark:text-brand-700">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
              />
            </svg>
          </div>
        )}
        {isFree && (
          <div className="absolute top-3 left-3">
            <Badge variant="accent">Free</Badge>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="neutral">
            {formatDeliveryType(course.delivery_type)}
          </Badge>
          {course.difficulty_level && (
            <Badge variant="outline" className="capitalize">
              {course.difficulty_level}
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold tracking-tight transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-300">
            {course.title}
          </h3>
          {course.subtitle && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {course.subtitle}
            </p>
          )}
        </div>
        {course.short_description && (
          <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
            {course.short_description}
          </p>
        )}
        {course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {course.tags.slice(0, 3).map((tag) => (
              <TagChip key={tag} tag={tag} />
            ))}
            {course.tags.length > 3 && (
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                +{course.tags.length - 3}
              </span>
            )}
          </div>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-semibold text-brand-700 dark:text-brand-200">
            {formatPrice(
              course.price_amount,
              course.currency_code,
              course.is_free,
            )}
          </span>
          <span className="text-xs text-zinc-500 transition-colors group-hover:text-brand-600 dark:text-zinc-400 dark:group-hover:text-brand-300">
            View details →
          </span>
        </div>
      </div>
    </Link>
  );
}
