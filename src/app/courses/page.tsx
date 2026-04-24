import { Suspense } from "react";

import { CatalogSearch } from "@/components/courses/catalog-search";
import { CourseCard } from "@/components/courses/course-card";
import { EmptyState } from "@/components/ui/empty-state";
import { listPublicCourses } from "@/lib/data/courses";

export const metadata = {
  title: "Courses",
};

type SearchParams = Promise<{
  q?: string;
  delivery?: string;
  difficulty?: string;
  pricing?: string;
  tag?: string;
}>;

const VALID_DELIVERY = ["self_paced", "cohort", "hybrid"] as const;
const VALID_PRICING = ["free", "paid"] as const;

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const delivery = VALID_DELIVERY.includes(sp.delivery as never)
    ? (sp.delivery as (typeof VALID_DELIVERY)[number])
    : undefined;
  const pricing = VALID_PRICING.includes(sp.pricing as never)
    ? (sp.pricing as (typeof VALID_PRICING)[number])
    : undefined;

  const courses = await listPublicCourses({
    search: sp.q,
    delivery,
    difficulty: sp.difficulty,
    pricing,
    tag: sp.tag,
  });

  const hasFilter = sp.q || delivery || sp.difficulty || pricing || sp.tag;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 space-y-4">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">
            Courses
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Browse self-paced and cohort-based courses.
          </p>
        </div>
        <Suspense
          fallback={
            <div className="h-10 max-w-md rounded-md bg-zinc-100 dark:bg-zinc-900" />
          }
        >
          <CatalogSearch />
        </Suspense>
        {sp.tag && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Showing courses tagged{" "}
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
              {sp.tag}
            </span>
          </p>
        )}
      </div>

      {courses.length === 0 ? (
        <EmptyState
          title={hasFilter ? "No matching courses" : "No courses yet"}
          description={
            hasFilter
              ? "Try a broader search or clear the filters."
              : "New courses will appear here as they're published."
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
