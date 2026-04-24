import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { LessonViewer } from "@/components/learning/lesson-viewer";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/user";
import { getCourseBySlug } from "@/lib/data/courses";
import { canAccessCourseContent } from "@/lib/data/enrolments";
import { createClient } from "@/lib/supabase/server";

type Params = Promise<{ slug: string; lessonId: string }>;

async function loadPreview(slug: string, lessonId: string) {
  const course = await getCourseBySlug(slug);
  if (!course || course.visibility !== "public") return null;

  const supabase = await createClient();
  const { data: lesson } = await supabase
    .from("lessons")
    .select(
      "id, course_id, title, summary, lesson_type, video_url, content_html, transcript, is_preview, is_published, seo_title, seo_description",
    )
    .eq("id", lessonId)
    .maybeSingle();

  if (!lesson || lesson.course_id !== course.id) return null;
  if (!lesson.is_published || !lesson.is_preview) return null;
  return { course, lesson };
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug, lessonId } = await params;
  const data = await loadPreview(slug, lessonId);
  if (!data) return { title: "Preview not found" };

  const { course, lesson } = data;
  const title = lesson.seo_title ?? `${lesson.title} — preview`;
  const description =
    lesson.seo_description ?? lesson.summary ?? `Preview a lesson from ${course.title}.`;
  return {
    title,
    description,
    openGraph: {
      type: "article",
      title,
      description,
      url: `/courses/${course.slug}/lessons/${lesson.id}`,
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function PublicLessonPreviewPage({
  params,
}: {
  params: Params;
}) {
  const { slug, lessonId } = await params;
  const data = await loadPreview(slug, lessonId);
  if (!data) notFound();
  const { course, lesson } = data;

  const user = await getCurrentUser();
  if (user && (await canAccessCourseContent(user.id, course.id))) {
    redirect(`/dashboard/courses/${course.id}/lessons/${lesson.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <div>
        <Link
          href={`/courses/${course.slug}`}
          className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← {course.title}
        </Link>
        <span className="ml-3 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          Free preview
        </span>
      </div>

      <LessonViewer lesson={lesson as never} />

      <div className="rounded-xl border border-black/10 bg-zinc-50 p-6 text-center dark:border-white/10 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold tracking-tight">
          Enjoying the preview?
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Enrol in <strong>{course.title}</strong> to access the full course.
        </p>
        <Link href={`/courses/${course.slug}`} className="mt-4 inline-block">
          <Button>View course</Button>
        </Link>
      </div>
    </div>
  );
}
