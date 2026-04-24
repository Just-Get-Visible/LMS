import type { Enums } from "@/types";

const colors: Record<Enums<"assignment_submission_status">, string> = {
  draft: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  submitted:
    "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
  reviewed:
    "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  returned:
    "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300",
  passed:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
};

export function SubmissionStatusBadge({
  status,
}: {
  status: Enums<"assignment_submission_status">;
}) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${colors[status]}`}
    >
      {status}
    </span>
  );
}
