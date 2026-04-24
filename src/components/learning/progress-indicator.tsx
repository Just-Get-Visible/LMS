import type { Tables } from "@/types";

export function ProgressIndicator({
  progress,
}: {
  progress: Tables<"course_progress"> | null;
}) {
  const percent = Number(progress?.progress_percent ?? 0);
  const completed = progress?.completed_lessons_count ?? 0;
  const total = progress?.total_lessons_count ?? 0;
  const value = Math.max(0, Math.min(100, percent));

  return (
    <div className="space-y-2 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Course progress</span>
        <span className="text-zinc-600 dark:text-zinc-400">
          {completed}/{total} lessons · {Math.round(percent)}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className="h-full bg-emerald-500 transition-[width]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
