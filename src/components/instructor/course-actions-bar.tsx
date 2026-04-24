import { Button } from "@/components/ui/button";
import {
  archiveCourseAction,
  setCoursePublishAction,
} from "@/lib/actions/courses";
import type { Tables } from "@/types";

export function CourseActionsBar({ course }: { course: Tables<"courses"> }) {
  const isPublic = course.visibility === "public";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
      <div className="space-y-1">
        <p className="text-sm font-medium">
          Status: <span className="capitalize">{course.visibility}</span>
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {isPublic
            ? "Listed on the public catalogue."
            : "Not visible to students yet."}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <form action={setCoursePublishAction.bind(null, course.id, !isPublic)}>
          <Button type="submit" size="sm">
            {isPublic ? "Unpublish" : "Publish"}
          </Button>
        </form>
        <form action={archiveCourseAction.bind(null, course.id)}>
          <Button type="submit" size="sm" variant="destructive">
            Archive
          </Button>
        </form>
      </div>
    </div>
  );
}
