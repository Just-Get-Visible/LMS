import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { CurriculumSection } from "@/lib/data/courses";

interface FlattenedLesson {
  id: string;
  title: string;
}

function flatten(sections: CurriculumSection[]): FlattenedLesson[] {
  return sections.flatMap((s) =>
    s.lessons.map((l) => ({ id: l.id, title: l.title })),
  );
}

interface Props {
  courseId: string;
  courseTitle: string;
  currentLessonId: string;
  sections: CurriculumSection[];
  completedLessonIds: Set<string>;
}

export function LessonProgressHeader({
  courseId,
  courseTitle,
  currentLessonId,
  sections,
  completedLessonIds,
}: Props) {
  const flat = flatten(sections);
  const total = flat.length;
  const idx = flat.findIndex((l) => l.id === currentLessonId);
  const position = idx >= 0 ? idx + 1 : 1;
  const completed = flat.filter((l) => completedLessonIds.has(l.id)).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <Link
          href={`/dashboard/courses/${courseId}`}
          className="font-medium text-zinc-600 hover:text-brand-600 dark:text-zinc-400 dark:hover:text-brand-300"
        >
          ← {courseTitle}
        </Link>
        <span className="text-zinc-500 dark:text-zinc-400">
          Lesson {position} of {total} · {percent}% complete
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900"
      >
        <div
          className="h-full rounded-full bg-brand-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function LessonNavigationFooter({
  courseId,
  currentLessonId,
  sections,
}: {
  courseId: string;
  currentLessonId: string;
  sections: CurriculumSection[];
}) {
  const flat = flatten(sections);
  const idx = flat.findIndex((l) => l.id === currentLessonId);
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;

  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Lesson navigation"
      className="flex items-center justify-between gap-3 border-t border-black/10 pt-6 dark:border-white/10"
    >
      <div className="min-w-0 flex-1">
        {prev ? (
          <Link
            href={`/dashboard/courses/${courseId}/lessons/${prev.id}`}
            className="group inline-flex max-w-full items-center gap-2 text-left"
          >
            <span className="text-zinc-400 group-hover:text-brand-600 dark:group-hover:text-brand-300">
              ←
            </span>
            <span className="min-w-0">
              <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                Previous
              </span>
              <span className="block truncate text-sm font-medium text-zinc-700 group-hover:text-brand-600 dark:text-zinc-300 dark:group-hover:text-brand-300">
                {prev.title}
              </span>
            </span>
          </Link>
        ) : null}
      </div>
      {next ? (
        <Link href={`/dashboard/courses/${courseId}/lessons/${next.id}`}>
          <Button>
            Next lesson
            <span className="ml-2">→</span>
          </Button>
        </Link>
      ) : (
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          End of course
        </span>
      )}
    </nav>
  );
}
