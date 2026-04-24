import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-10 w-72" />
        <Skeleton className="mt-2 h-4 w-48" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <WidgetSkeleton lines={3} />
          <WidgetSkeleton lines={4} />
        </div>
        <div className="space-y-6">
          <WidgetSkeleton lines={3} />
          <WidgetSkeleton lines={3} />
        </div>
      </div>
    </div>
  );
}

function WidgetSkeleton({ lines }: { lines: number }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
      <Skeleton className="mb-4 h-5 w-32" />
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
