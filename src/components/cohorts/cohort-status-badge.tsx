import type { Enums } from "@/types";

const colors: Record<Enums<"cohort_status">, string> = {
  open: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  running:
    "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
  completed:
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  closed: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  cancelled:
    "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
  draft: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

export function CohortStatusBadge({
  status,
}: {
  status: Enums<"cohort_status">;
}) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${colors[status]}`}
    >
      {status}
    </span>
  );
}
