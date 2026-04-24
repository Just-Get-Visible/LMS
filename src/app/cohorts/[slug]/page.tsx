import Link from "next/link";
import { notFound } from "next/navigation";

import { CohortPublicSidebar } from "@/components/cohorts/cohort-public-sidebar";
import { CohortStatusBadge } from "@/components/cohorts/cohort-status-badge";
import { Markdown } from "@/components/markdown";
import { getCurrentUser } from "@/lib/auth/user";
import { getCohortBySlug } from "@/lib/data/cohorts";
import { isEnrolledInCohort } from "@/lib/data/enrolments";
import { createClient } from "@/lib/supabase/server";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const cohort = await getCohortBySlug(slug);
  if (!cohort) return { title: "Cohort not found" };

  const description =
    cohort.description?.slice(0, 200) ?? undefined;

  return {
    title: cohort.name,
    description,
    openGraph: {
      type: "article",
      title: cohort.name,
      description,
      url: `/cohorts/${cohort.slug}`,
    },
    twitter: {
      card: "summary",
      title: cohort.name,
      description,
    },
  };
}

export default async function PublicCohortPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;

  const cohort = await getCohortBySlug(slug);
  if (!cohort) notFound();

  const supabase = await createClient();
  const { data: course } = await supabase
    .from("courses")
    .select("id, slug, title, visibility")
    .eq("id", cohort.course_id)
    .maybeSingle();

  // Hide if the parent course isn't public (the RLS will already have blocked
  // the cohort fetch in most cases, but double-check).
  if (!course || course.visibility !== "public") notFound();

  const user = await getCurrentUser();
  const hasAccess = user
    ? await isEnrolledInCohort(user.id, cohort.id)
    : false;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="min-w-0 space-y-8">
          <header className="space-y-3">
            <div className="flex items-center gap-2">
              <Link
                href={`/courses/${course.slug}`}
                className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                {course.title}
              </Link>
            </div>
            <div className="flex items-center justify-between gap-3">
              <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
                {cohort.name}
              </h1>
              <CohortStatusBadge status={cohort.status} />
            </div>
          </header>

          {cohort.description && (
            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight">
                About this cohort
              </h2>
              <Markdown>{cohort.description}</Markdown>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <CohortPublicSidebar
            cohort={cohort}
            hasAccess={hasAccess}
            isAuthenticated={!!user}
          />
        </aside>
      </div>
    </div>
  );
}
