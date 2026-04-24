import { Skeleton } from "@/components/ui/skeleton";

export default function CourseDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
          <header className="space-y-4">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-2/3" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </header>
          <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        </div>
        <aside>
          <Skeleton className="h-72 w-full rounded-2xl" />
        </aside>
      </div>
    </div>
  );
}
