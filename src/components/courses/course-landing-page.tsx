import Link from "next/link";

import { LandingCountdown } from "@/components/courses/landing-countdown";
import { Button } from "@/components/ui/button";
import type { CurriculumSection } from "@/lib/data/courses";
import { formatPrice } from "@/lib/format";
import type { Tables } from "@/types";

export type LandingPageData = {
  published?: boolean;
  hero?: { tagline?: string; ctaLabel?: string };
  problemStats?: { stat: string; label: string }[];
  whatYouGet?: string[];
  bonus?: {
    title: string;
    valueDisplay?: string;
    description?: string;
  };
  faqs?: { q: string; a: string }[];
  testimonials?: {
    quote: string;
    name: string;
    role?: string;
    avatarUrl?: string;
  }[];
  instructorCredibility?: string[];
};

interface Props {
  course: Tables<"courses">;
  curriculum: CurriculumSection[];
  instructor: {
    id: string;
    full_name: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    headline: string | null;
  } | null;
  nextCohort: {
    id: string;
    slug: string;
    starts_at: string | null;
    name: string;
  } | null;
  landing: LandingPageData;
  hasAccess: boolean;
  isAuthenticated: boolean;
}

export function CourseLandingPage({
  course,
  curriculum,
  instructor,
  nextCohort,
  landing,
  hasAccess,
  isAuthenticated,
}: Props) {
  const ctaLabel = landing.hero?.ctaLabel ?? "Secure your spot";
  const ctaHref = hasAccess
    ? `/dashboard/courses/${course.id}`
    : nextCohort
      ? `/cohorts/${nextCohort.slug}/checkout`
      : isAuthenticated
        ? `/courses/${course.slug}/checkout`
        : `/signup?next=/courses/${course.slug}`;
  const ctaText = hasAccess ? "Continue learning" : ctaLabel;
  const instructorName =
    instructor?.full_name?.trim() ||
    `${instructor?.first_name ?? ""} ${instructor?.last_name ?? ""}`.trim() ||
    "Instructor";
  const lessons = curriculum.flatMap((s) => s.lessons);

  return (
    <main className="flex-1 bg-brand-600 text-white">
      {/* 1. Hero */}
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(249,221,0,0.22),_transparent_55%),radial-gradient(ellipse_at_bottom_left,_rgba(3,13,30,0.7),_transparent_60%),radial-gradient(ellipse_at_top_right,_rgba(3,13,30,0.5),_transparent_60%)]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-accent-300/40 to-transparent"
        />
        <div className="relative mx-auto max-w-5xl px-6 pt-24 pb-20 text-center sm:pt-32 sm:pb-28">
          {landing.hero?.tagline && (
            <p className="mb-8 inline-block rounded-full border border-accent-300/40 bg-accent-300/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent-300">
              {landing.hero.tagline}
            </p>
          )}
          <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            {course.title}
          </h1>
          {course.subtitle && (
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70 sm:text-xl">
              {course.subtitle}
            </p>
          )}

          {nextCohort && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-white/70 sm:text-sm">
              <ScarcityChip dot label="Live cohort" />
              <ScarcityChip label={nextCohort.name} />
              {nextCohort.starts_at && (
                <ScarcityChip
                  label={new Date(nextCohort.starts_at).toLocaleDateString(
                    "en-GB",
                    { day: "numeric", month: "short", year: "numeric" },
                  )}
                />
              )}
            </div>
          )}

          <div className="mt-10 flex flex-col items-center gap-5">
            <Link href={ctaHref}>
              <Button
                variant="accent"
                size="lg"
                className="px-8 shadow-[0_0_0_4px_rgba(249,221,0,0.12)] hover:shadow-[0_0_0_6px_rgba(249,221,0,0.18)]"
              >
                {ctaText} →
              </Button>
            </Link>
            {nextCohort?.starts_at && !hasAccess && (
              <LandingCountdown target={nextCohort.starts_at} />
            )}
          </div>
        </div>
      </section>

      {/* 2. Problem stats */}
      {landing.problemStats && landing.problemStats.length > 0 && (
        <section className="border-b border-white/10 bg-brand-600 py-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.07]">
              <div className="grid divide-y divide-white/15 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {landing.problemStats.map((s, i) => (
                  <div key={i} className="px-8 py-10 text-center">
                    <p className="font-display text-5xl font-bold tracking-tight text-accent-300 sm:text-6xl">
                      {s.stat}
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-white/60">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Curriculum */}
      {lessons.length > 0 && (
        <section className="border-b border-white/10 bg-brand-600 py-24">
          <div className="mx-auto max-w-4xl px-6">
            <div className="mb-14 text-center">
              <SectionEyebrow>The curriculum</SectionEyebrow>
              <h2 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">
                What you&rsquo;ll learn.
                <br />
                <span className="text-accent-300">A clear path.</span>
              </h2>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.07]">
              {lessons.map((lesson, i) => (
                <div
                  key={lesson.id}
                  className="group flex items-center gap-6 border-b border-white/10 px-6 py-5 transition-colors last:border-b-0 hover:bg-white/[0.08] sm:px-8 sm:py-6"
                >
                  <span className="font-display text-sm font-bold tracking-widest text-accent-300/80">
                    {(i + 1).toString().padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold tracking-tight text-white">
                      {lesson.title}
                    </h3>
                    {lesson.summary && (
                      <p className="mt-1 text-sm text-white/60">
                        {lesson.summary}
                      </p>
                    )}
                  </div>
                  {lesson.estimated_duration_minutes && (
                    <span className="hidden shrink-0 text-xs font-medium uppercase tracking-wider text-white/40 sm:block">
                      {lesson.estimated_duration_minutes} min
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Instructor */}
      {instructor && (
        <section className="border-b border-white/10 bg-brand-600 py-24">
          <div className="mx-auto max-w-4xl px-6">
            <div className="text-center">
              <SectionEyebrow>Your instructor</SectionEyebrow>
              <div className="mt-8 flex justify-center">
                {instructor.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={instructor.avatar_url}
                    alt=""
                    className="h-24 w-24 rounded-full object-cover ring-4 ring-white/10"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accent-300 text-2xl font-bold text-brand-900 ring-4 ring-white/10">
                    {instructorName.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <h2 className="mt-6 font-display text-4xl font-bold tracking-tight sm:text-5xl">
                I&rsquo;ve done this.
                <br />
                <span className="text-accent-300">Now I&rsquo;ll show you.</span>
              </h2>
              {instructor.headline && (
                <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/70">
                  {instructor.headline}
                </p>
              )}
            </div>

            {landing.instructorCredibility &&
              landing.instructorCredibility.length > 0 && (
                <div className="mt-12 grid gap-4 sm:grid-cols-2">
                  {landing.instructorCredibility.map((point, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-white/15 bg-white/[0.07] p-5"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-300/80">
                        Proof {(i + 1).toString().padStart(2, "0")}
                      </p>
                      <p className="mt-2 font-medium text-white">{point}</p>
                    </div>
                  ))}
                </div>
              )}

            <p className="mt-10 text-center text-sm text-white/50">
              {instructorName}
            </p>
          </div>
        </section>
      )}

      {/* 5. What's included */}
      {landing.whatYouGet && landing.whatYouGet.length > 0 && (
        <section className="border-b border-white/10 bg-brand-600 py-24">
          <div className="mx-auto max-w-4xl px-6">
            <div className="mb-12 text-center">
              <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
                What&rsquo;s included.
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {landing.whatYouGet.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 rounded-xl border border-white/15 bg-white/[0.07] p-5"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-300 text-brand-900">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-sm leading-relaxed text-white/85">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* Bonus strip — folded into the same section */}
            {landing.bonus && (
              <div className="mt-6 overflow-hidden rounded-xl border border-accent-300/40 bg-gradient-to-r from-accent-300/10 via-accent-300/5 to-transparent">
                <div className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent-300">
                      Bonus
                    </p>
                    <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
                      {landing.bonus.title}
                    </h3>
                    {landing.bonus.description && (
                      <p className="mt-2 text-sm leading-relaxed text-white/70">
                        {landing.bonus.description}
                      </p>
                    )}
                  </div>
                  {landing.bonus.valueDisplay && (
                    <span className="shrink-0 rounded-full bg-accent-300 px-4 py-1.5 text-sm font-bold text-brand-900">
                      {landing.bonus.valueDisplay}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 7. Pricing */}
      <section className="border-b border-white/10 bg-brand-600 py-24">
        <div className="mx-auto max-w-md px-6">
          <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.08] p-8 text-center">
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-300/60 to-transparent"
            />
            <p className="inline-block rounded-full bg-accent-300/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-accent-300">
              One-time
            </p>
            <p className="mt-6 font-display text-6xl font-bold tracking-tight text-white">
              {formatPrice(
                course.price_amount,
                course.currency_code,
                course.is_free,
              )}
            </p>
            <p className="mt-2 text-sm text-white/60">Lifetime access</p>

            {landing.whatYouGet && landing.whatYouGet.length > 0 && (
              <ul className="mt-8 space-y-3 text-left">
                {landing.whatYouGet.slice(0, 4).map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-white/80"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mt-0.5 shrink-0 text-accent-300"
                      aria-hidden
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}

            <Link href={ctaHref} className="mt-8 block">
              <Button
                variant="accent"
                size="lg"
                className="w-full shadow-[0_0_0_4px_rgba(249,221,0,0.12)]"
              >
                {ctaText} →
              </Button>
            </Link>
            <p className="mt-4 text-xs text-white/50">
              Secure checkout. Lifetime access.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Testimonials */}
      {landing.testimonials && landing.testimonials.length > 0 && (
        <section className="border-b border-white/10 bg-brand-600 py-24">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="mb-14 text-center font-display text-4xl font-bold tracking-tight sm:text-5xl">
              What students say.
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {landing.testimonials.map((t, i) => (
                <figure
                  key={i}
                  className="rounded-xl border border-white/15 bg-white/[0.07] p-6"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                    className="text-accent-300/60"
                  >
                    <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
                  </svg>
                  <blockquote className="mt-4 text-base leading-relaxed text-white/85">
                    {t.quote}
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-white/15 pt-5">
                    {t.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.avatarUrl}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-300 text-sm font-bold text-brand-900">
                        {t.name.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {t.name}
                      </p>
                      {t.role && (
                        <p className="text-xs text-white/50">{t.role}</p>
                      )}
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 9. FAQ */}
      {landing.faqs && landing.faqs.length > 0 && (
        <section className="border-b border-white/10 bg-brand-600 py-24">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="mb-12 text-center font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Questions? <span className="text-accent-300">Answers.</span>
            </h2>
            <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.07]">
              {landing.faqs.map((f, i) => (
                <details
                  key={i}
                  className="group border-b border-white/10 last:border-b-0 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left font-medium text-white transition-colors hover:bg-white/[0.07]">
                    <span>{f.q}</span>
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/15 text-accent-300 transition-transform group-open:rotate-45">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        aria-hidden
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </span>
                  </summary>
                  <p className="px-6 pb-5 text-sm leading-relaxed text-white/65">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 10. Final CTA */}
      <section className="relative isolate overflow-hidden bg-brand-600 py-24">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_rgba(249,221,0,0.18),_transparent_60%)]"
        />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight sm:text-6xl">
            Stop scrolling.
            <br />
            <span className="text-accent-300">Start building.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-white/70">
            Secure your spot and get lifetime access.
          </p>
          <div className="mt-10 flex justify-center">
            <Link href={ctaHref}>
              <Button
                variant="accent"
                size="lg"
                className="px-8 shadow-[0_0_0_4px_rgba(249,221,0,0.12)] hover:shadow-[0_0_0_6px_rgba(249,221,0,0.18)]"
              >
                {ctaText} →
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full border border-accent-300/40 bg-accent-300/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-accent-300">
      {children}
    </span>
  );
}

function ScarcityChip({ label, dot }: { label: string; dot?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5">
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-300 opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-300" />
        </span>
      )}
      {label}
    </span>
  );
}
