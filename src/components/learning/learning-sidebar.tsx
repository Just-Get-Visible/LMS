"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { CurriculumSection } from "@/lib/data/courses";
import type { Tables } from "@/types";

interface Props {
  courseId: string;
  courseTitle: string;
  sections: CurriculumSection[];
  completedLessonIds: string[];
}

export function LearningSidebar({
  courseId,
  courseTitle,
  sections,
  completedLessonIds,
}: Props) {
  const pathname = usePathname();
  const completedSet = new Set(completedLessonIds);
  const activeLessonId = pathname.match(/\/lessons\/([^/]+)/)?.[1];

  return (
    <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
      <div>
        <Link
          href="/dashboard"
          className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← Back to dashboard
        </Link>
        <h2 className="mt-2 font-semibold tracking-tight">{courseTitle}</h2>
      </div>
      <nav className="space-y-5">
        {sections.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No published lessons yet.
          </p>
        )}
        {sections.map((section, index) => (
          <div key={section.module?.id ?? `unassigned-${index}`}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {section.module?.title ?? "Lessons"}
            </h3>
            <ul className="space-y-1">
              {section.lessons.map((lesson) => (
                <li key={lesson.id}>
                  <LessonNavLink
                    courseId={courseId}
                    lesson={lesson}
                    isActive={lesson.id === activeLessonId}
                    isCompleted={completedSet.has(lesson.id)}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function LessonNavLink({
  courseId,
  lesson,
  isActive,
  isCompleted,
}: {
  courseId: string;
  lesson: Tables<"lessons">;
  isActive: boolean;
  isCompleted: boolean;
}) {
  return (
    <Link
      href={`/dashboard/courses/${courseId}/lessons/${lesson.id}`}
      aria-current={isActive ? "page" : undefined}
      className={`flex items-start gap-2 rounded-md px-2 py-1.5 text-sm ${
        isActive
          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      }`}
    >
      <CompletionDot completed={isCompleted} />
      <span className="line-clamp-2">{lesson.title}</span>
    </Link>
  );
}

function CompletionDot({ completed }: { completed: boolean }) {
  if (completed) {
    return (
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      </span>
    );
  }
  return (
    <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-zinc-300 dark:border-zinc-700" />
  );
}
