import Link from "next/link";
import { notFound } from "next/navigation";

import { CohortPublicCard } from "@/components/cohorts/cohort-public-card";
import { CourseCurriculum } from "@/components/courses/course-curriculum";
import {
  CourseLandingPage,
  type LandingPageData,
} from "@/components/courses/course-landing-page";
import { CourseSidebar } from "@/components/courses/course-sidebar";
import { TagChip } from "@/components/courses/tag-chip";
import { Markdown } from "@/components/markdown";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth/user";
import { getPublicCohortsForCourse } from "@/lib/data/cohorts";
import {
  getCourseBySlug,
  getCourseCurriculum,
  getCourseInstructor,
} from "@/lib/data/courses";
import { getLessonUnlocks, type LessonUnlocks } from "@/lib/data/drip";
import { canAccessCourseContent } from "@/lib/data/enrolments";
import { formatDeliveryType } from "@/lib/format";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: "Course not found" };

  const description =
    course.short_description ?? course.subtitle ?? undefined;
  const image = course.featured_image_url ?? course.thumbnail_url ?? undefined;

  return {
    title: course.title,
    description,
    openGraph: {
      type: "article",
      title: course.title,
      description,
      url: `/courses/${course.slug}`,
      images: image ? [{ url: image, alt: course.title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: course.title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const user = await getCurrentUser();

  const [curriculum, instructor, hasAccess, openCohorts] = await Promise.all([
    getCourseCurriculum(course.id),
    course.instructor_user_id
      ? getCourseInstructor(course.instructor_user_id)
      : Promise.resolve(null),
    user
      ? canAccessCourseContent(user.id, course.id)
      : Promise.resolve(false),
    course.delivery_type === "self_paced"
      ? Promise.resolve([])
      : getPublicCohortsForCourse(course.id),
  ]);

  const unlocks: LessonUnlocks =
    user && hasAccess
      ? await getLessonUnlocks(user.id, course.id)
      : new Map();

  // Launch landing page takes over when the instructor has authored one
  // and flipped `published`. Falls back to the catalog view otherwise.
  // `landing_page` was added in migration 0002; types/database.ts hasn't
  // been regenerated yet, so cast through unknown.
  const landing =
    ((course as unknown as { landing_page: LandingPageData | null })
      .landing_page) ?? null;
  if (landing?.published) {
    const nextCohort = openCohorts[0] ?? null;
    return (
      <CourseLandingPage
        course={course}
        curriculum={curriculum}
        instructor={instructor}
        nextCohort={
          nextCohort
            ? {
                id: nextCohort.id,
                slug: nextCohort.slug,
                name: nextCohort.name,
                starts_at: nextCohort.starts_at,
              }
            : null
        }
        landing={landing}
        hasAccess={hasAccess}
        isAuthenticated={!!user}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="min-w-0 space-y-8">
          <header className="space-y-4">
            <Badge variant="brand">
              {formatDeliveryType(course.delivery_type)}
            </Badge>
            <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
              {course.title}
            </h1>
            {course.subtitle && (
              <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
                {course.subtitle}
              </p>
            )}
            {course.tags && course.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {course.tags.map((tag) => (
                  <TagChip key={tag} tag={tag} size="md" />
                ))}
              </div>
            )}
          </header>

          {course.featured_image_url && (
            <div className="overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={course.featured_image_url}
                alt=""
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          )}

          {course.description && (
            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight">
                About this course
              </h2>
              <Markdown>{course.description}</Markdown>
            </section>
          )}

          <section>
            <h2 className="mb-4 text-xl font-semibold tracking-tight">
              Curriculum
            </h2>
            <CourseCurriculum
              sections={curriculum}
              canAccessFullContent={hasAccess}
              unlocks={unlocks}
              lessonHrefBase={
                hasAccess
                  ? `/dashboard/courses/${course.id}/lessons`
                  : `/courses/${course.slug}/lessons`
              }
            />
          </section>

          {openCohorts.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-semibold tracking-tight">
                Available cohorts
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {openCohorts.map((cohort) => (
                  <CohortPublicCard key={cohort.id} cohort={cohort} />
                ))}
              </div>
            </section>
          )}

          {instructor && (
            <section>
              <h2 className="mb-4 text-xl font-semibold tracking-tight">
                Instructor
              </h2>
              <Link
                href={`/instructors/${instructor.id}`}
                className="flex gap-4 rounded-xl border border-black/10 bg-white p-5 transition-colors hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-950 dark:hover:bg-zinc-900"
              >
                {instructor.avatar_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={instructor.avatar_url}
                    alt=""
                    className="h-14 w-14 rounded-full object-cover"
                  />
                )}
                <div className="min-w-0 space-y-1">
                  <p className="font-medium">
                    {instructor.full_name ||
                      `${instructor.first_name ?? ""} ${
                        instructor.last_name ?? ""
                      }`.trim() ||
                      "Instructor"}
                  </p>
                  {instructor.headline && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {instructor.headline}
                    </p>
                  )}
                </div>
              </Link>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <CourseSidebar
            course={course}
            hasAccess={hasAccess}
            isAuthenticated={!!user}
          />
        </aside>
      </div>
    </div>
  );
}
