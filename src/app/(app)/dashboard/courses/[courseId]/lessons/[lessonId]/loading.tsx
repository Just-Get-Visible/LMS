import { Skeleton } from "@/components/ui/skeleton";

export default function LessonLoading() {
  return (
    <div className="space-y-8">
      {/* Progress header */}
      <div className="space-y-3">
        <div className="flex justify-between gap-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>

      {/* Lesson header + body */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-2/3" />
      </div>
      <Skeleton className="aspect-video w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Footer nav */}
      <div className="flex justify-between border-t border-black/10 pt-6 dark:border-white/10">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    </div>
  );
}
