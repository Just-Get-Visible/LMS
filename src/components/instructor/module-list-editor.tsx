import Link from "next/link";

import { QuickAddLessonForm } from "@/components/instructor/quick-add-lesson-form";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  deleteModuleAction,
  moveModuleAction,
} from "@/lib/actions/modules";
import {
  deleteLessonAction,
  moveLessonAction,
} from "@/lib/actions/lessons";
import type { Tables } from "@/types";

import { AddModuleForm, EditModuleForm } from "./module-forms";

interface Props {
  courseId: string;
  modules: Tables<"course_modules">[];
  lessons: Tables<"lessons">[];
}

export function ModuleListEditor({ courseId, modules, lessons }: Props) {
  const lessonsByModule = new Map<string | null, Tables<"lessons">[]>();
  for (const lesson of lessons) {
    const key = lesson.module_id;
    const list = lessonsByModule.get(key) ?? [];
    list.push(lesson);
    lessonsByModule.set(key, list);
  }
  for (const list of lessonsByModule.values()) {
    list.sort((a, b) => a.sort_order - b.sort_order);
  }

  const unassigned = lessonsByModule.get(null) ?? [];

  return (
    <div className="space-y-6">
      {modules.length === 0 && unassigned.length === 0 ? (
        <EmptyState
          title="No modules yet"
          description="Create your first module below to start organising lessons."
        />
      ) : (
        <div className="space-y-4">
          {modules.map((module, index) => (
            <ModuleCard
              key={module.id}
              courseId={courseId}
              module={module}
              lessons={lessonsByModule.get(module.id) ?? []}
              isFirst={index === 0}
              isLast={index === modules.length - 1}
            />
          ))}
          {unassigned.length > 0 && (
            <UnassignedLessonsCard
              courseId={courseId}
              lessons={unassigned}
            />
          )}
        </div>
      )}

      <div className="rounded-xl border border-dashed border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
        <h3 className="mb-3 text-sm font-medium">Add module</h3>
        <AddModuleForm courseId={courseId} />
      </div>
    </div>
  );
}

function ModuleCard({
  courseId,
  module,
  lessons,
  isFirst,
  isLast,
}: {
  courseId: string;
  module: Tables<"course_modules">;
  lessons: Tables<"lessons">[];
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950">
      <header className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-medium">{module.title}</h3>
            {!module.is_published && (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                Draft
              </span>
            )}
          </div>
          {module.description && (
            <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
              {module.description}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <ReorderButton
            disabled={isFirst}
            action={moveModuleAction.bind(null, courseId, module.id, "up")}
            label="Move module up"
            symbol="↑"
          />
          <ReorderButton
            disabled={isLast}
            action={moveModuleAction.bind(null, courseId, module.id, "down")}
            label="Move module down"
            symbol="↓"
          />
          <form
            action={deleteModuleAction.bind(null, courseId, module.id)}
          >
            <Button type="submit" size="sm" variant="destructive">
              Delete
            </Button>
          </form>
        </div>
      </header>

      <details className="border-t border-black/10 dark:border-white/10">
        <summary className="cursor-pointer px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300">
          Module settings
        </summary>
        <div className="border-t border-black/10 p-4 dark:border-white/10">
          <EditModuleForm courseId={courseId} module={module} />
        </div>
      </details>

      <div className="border-t border-black/10 p-4 dark:border-white/10">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Lessons
        </h4>
        <LessonList
          courseId={courseId}
          moduleId={module.id}
          lessons={lessons}
        />
        <div className="mt-3">
          <QuickAddLessonForm courseId={courseId} moduleId={module.id} />
        </div>
      </div>
    </div>
  );
}

function UnassignedLessonsCard({
  courseId,
  lessons,
}: {
  courseId: string;
  lessons: Tables<"lessons">[];
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
      <header>
        <h3 className="font-medium">Unassigned lessons</h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Lessons without a module. Edit each lesson to assign it.
        </p>
      </header>
      <div className="mt-4">
        <LessonList courseId={courseId} moduleId={null} lessons={lessons} />
      </div>
    </div>
  );
}

function LessonList({
  courseId,
  moduleId,
  lessons,
}: {
  courseId: string;
  moduleId: string | null;
  lessons: Tables<"lessons">[];
}) {
  if (lessons.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No lessons yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-black/5 rounded-md border border-black/10 dark:divide-white/5 dark:border-white/10">
      {lessons.map((lesson, index) => (
        <li
          key={lesson.id}
          className="flex items-center justify-between gap-3 px-3 py-2"
        >
          <div className="min-w-0 flex-1">
            <Link
              href={`/instructor/courses/${courseId}/lessons/${lesson.id}`}
              className="block truncate text-sm font-medium hover:underline"
            >
              {lesson.title}
            </Link>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="capitalize">
                {lesson.lesson_type.replace("_", " ")}
              </span>
              {!lesson.is_published && <span>· Draft</span>}
              {lesson.is_preview && <span>· Preview</span>}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <ReorderButton
              disabled={index === 0}
              action={moveLessonAction.bind(
                null,
                courseId,
                moduleId,
                lesson.id,
                "up",
              )}
              label="Move lesson up"
              symbol="↑"
            />
            <ReorderButton
              disabled={index === lessons.length - 1}
              action={moveLessonAction.bind(
                null,
                courseId,
                moduleId,
                lesson.id,
                "down",
              )}
              label="Move lesson down"
              symbol="↓"
            />
            <form
              action={deleteLessonAction.bind(null, courseId, lesson.id)}
            >
              <Button type="submit" size="sm" variant="ghost">
                Delete
              </Button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ReorderButton({
  disabled,
  action,
  label,
  symbol,
}: {
  disabled: boolean;
  action: () => void | Promise<void>;
  label: string;
  symbol: string;
}) {
  return (
    <form action={action}>
      <Button
        type="submit"
        size="sm"
        variant="ghost"
        disabled={disabled}
        aria-label={label}
        title={label}
      >
        {symbol}
      </Button>
    </form>
  );
}
