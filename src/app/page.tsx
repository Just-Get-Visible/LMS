import Link from "next/link";

import { CourseCard } from "@/components/courses/course-card";
import {
  CourseLandingPage,
  type LandingPageData,
} from "@/components/courses/course-landing-page";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/user";
import { getPublicCohortsForCourse } from "@/lib/data/cohorts";
import {
  getCourseBySlug,
  getCourseCurriculum,
  getCourseInstructor,
  listPublicCourses,
} from "@/lib/data/courses";
import { canAccessCourseContent } from "@/lib/data/enrolments";

export default async function HomePage() {
  // Single-flagship-course mode: when HOMEPAGE_COURSE_SLUG is set, the
  // homepage renders that course's launch page (Phase A/B). Falls back
  // to the platform homepage if unset, the slug doesn't exist, or the
  // course has no published `landing_page`.
  const flagshipSlug = process.env.HOMEPAGE_COURSE_SLUG;
  if (flagshipSlug) {
    const course = await getCourseBySlug(flagshipSlug);
    const landing =
      ((course as unknown as { landing_page: LandingPageData | null } | null)
        ?.landing_page) ?? null;

    if (course && landing?.published) {
      const user = await getCurrentUser();
      const [curriculum, instructor, hasAccess, openCohorts] =
        await Promise.all([
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
      const nextCohort = openCohorts[0] ?? null;
      return (
        <>
          <SiteHeader />
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
        </>
      );
    }
  }

  // Platform homepage (default).
  const [user, courses] = await Promise.all([
    getCurrentUser(),
    listPublicCourses(),
  ]);
  const featured = courses.slice(0, 6);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-600 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent-400 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-brand-400 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <div className="max-w-3xl space-y-6">
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white/80 backdrop-blur">
              Learn at your own pace
            </span>
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Courses and live cohorts that take you further.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
              Self-paced learning, live sessions with instructors, and
              certificates when you finish. Built for serious learners.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {user ? (
                <Link href="/dashboard">
                  <Button variant="accent" size="lg">
                    Go to dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/signup">
                    <Button variant="accent" size="lg">
                      Get started
                    </Button>
                  </Link>
                  <Link href="/courses">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:border-white/50"
                    >
                      Browse courses
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="border-b border-black/5 bg-white py-16 dark:border-white/10 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 sm:grid-cols-3">
            <ValueProp
              title="Learn at your own pace"
              body="Self-paced video, text, and quiz lessons you can pick up anywhere."
            />
            <ValueProp
              title="Live cohort sessions"
              body="Join structured cohorts with live workshops, deadlines, and a community."
            />
            <ValueProp
              title="Certificates on completion"
              body="Earn a verifiable certificate when you finish a course or cohort."
            />
          </div>
        </div>
      </section>

      {/* Featured courses */}
      {featured.length > 0 && (
        <section className="bg-zinc-50 py-20 dark:bg-zinc-900/40">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Featured courses
                </h2>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                  Popular self-paced and cohort programmes.
                </p>
              </div>
              <Link
                href="/courses"
                className="hidden text-sm font-medium text-brand-600 hover:text-brand-700 sm:inline-block dark:text-brand-300 dark:hover:text-brand-200"
              >
                View all →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/courses"
                className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-300"
              >
                View all courses →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="border-t border-black/5 bg-white py-20 dark:border-white/10 dark:bg-zinc-950">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Browse the full catalogue or sign in to pick up where you left off.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            {user ? (
              <Link href="/dashboard">
                <Button size="lg">Go to dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <Button size="lg">Create an account</Button>
                </Link>
                <Link href="/courses">
                  <Button variant="outline" size="lg">
                    Browse courses
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
      </main>
    </>
  );
}

function ValueProp({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 12l2 2 4-4" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      </div>
      <h3 className="font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {body}
      </p>
    </div>
  );
}
