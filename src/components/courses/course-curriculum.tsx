import Link from "next/link";

import type { CurriculumSection } from "@/lib/data/courses";
import type { LessonUnlocks } from "@/lib/data/drip";
import type { Tables } from "@/types";

interface CourseCurriculumProps {
  sections: CurriculumSection[];
  canAccessFullContent: boolean;
  unlocks?: LessonUnlocks;
  // When set, accessible lesson rows become links to `${lessonHrefBase}/${lesson.id}`.
  lessonHrefBase?: string;
}

export function CourseCurriculum({
  sections,
  canAccessFullContent,
  unlocks,
  lessonHrefBase,
}: CourseCurriculumProps) {
  if (sections.length === 0) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        The instructor hasn&apos;t published any lessons yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <div
          key={section.module?.id ?? `unassigned-${index}`}
          className="overflow-hidden rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950"
        >
          <div className="border-b border-black/10 px-4 py-3 dark:border-white/10">
            <h3 className="font-semibold tracking-tight">
              {section.module?.title ?? "Lessons"}
            </h3>
            {section.module?.description && (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {section.module.description}
              </p>
            )}
          </div>
          <ul className="divide-y divide-black/5 dark:divide-white/5">
            {section.lessons.map((lesson) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                canAccessFullContent={canAccessFullContent}
                unlockAt={unlocks?.get(lesson.id) ?? null}
                lessonHrefBase={lessonHrefBase}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function LessonRow({
  lesson,
  canAccessFullContent,
  unlockAt,
  lessonHrefBase,
}: {
  lesson: Tables<"lessons">;
  canAccessFullContent: boolean;
  unlockAt: Date | null;
  lessonHrefBase?: string;
}) {
  const isLocked = !canAccessFullContent && !lesson.is_preview;
  const isDripped = !isLocked && unlockAt != null;
  const isMuted = isLocked || isDripped;
  const isClickable = !!lessonHrefBase && !isMuted;

  const inner = (
    <>
      <div className="flex min-w-0 items-center gap-3">
        <LessonTypeBadge type={lesson.lesson_type} />
        <span
          className={`truncate ${
            isMuted ? "text-zinc-500 dark:text-zinc-500" : ""
          }`}
        >
          {lesson.title}
        </span>
        {lesson.is_preview && (
          <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            Preview
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        {isDripped && unlockAt && (
          <span>Unlocks {formatUnlock(unlockAt)}</span>
        )}
        {lesson.estimated_duration_minutes ? (
          <span>{lesson.estimated_duration_minutes} min</span>
        ) : null}
        {isMuted && <LockIcon />}
      </div>
    </>
  );

  return (
    <li>
      {isClickable ? (
        <Link
          href={`${lessonHrefBase}/${lesson.id}`}
          className="flex items-center justify-between gap-4 px-4 py-3 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          {inner}
        </Link>
      ) : (
        <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
          {inner}
        </div>
      )}
    </li>
  );
}

function formatUnlock(d: Date): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

function LessonTypeBadge({ type }: { type: Tables<"lessons">["lesson_type"] }) {
  const initial = typeInitial(type);
  return (
    <span
      aria-label={typeLabel(type)}
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
    >
      {initial}
    </span>
  );
}

function typeInitial(type: Tables<"lessons">["lesson_type"]): string {
  switch (type) {
    case "video":
      return "V";
    case "text":
      return "T";
    case "document":
      return "D";
    case "live_session":
      return "L";
    case "quiz":
      return "Q";
    case "assignment":
      return "A";
  }
}

function typeLabel(type: Tables<"lessons">["lesson_type"]): string {
  switch (type) {
    case "video":
      return "Video lesson";
    case "text":
      return "Text lesson";
    case "document":
      return "Document";
    case "live_session":
      return "Live session";
    case "quiz":
      return "Quiz";
    case "assignment":
      return "Assignment";
  }
}

function LockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label="Locked"
      role="img"
      className="text-zinc-400"
    >
      <path d="M12 1a5 5 0 0 0-5 5v3H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V11a2 2 0 0 0-2-2h-2V6a5 5 0 0 0-5-5zm-3 8V6a3 3 0 1 1 6 0v3H9z" />
    </svg>
  );
}
