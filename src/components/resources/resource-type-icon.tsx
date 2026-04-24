import type { Enums } from "@/types";

const colors: Record<Enums<"resource_type">, string> = {
  pdf: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  doc: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  sheet:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  slide:
    "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  zip: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300",
  link: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  template:
    "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
  image: "bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300",
  video:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
  other: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

const labels: Record<Enums<"resource_type">, string> = {
  pdf: "PDF",
  doc: "DOC",
  sheet: "XLS",
  slide: "PPT",
  zip: "ZIP",
  link: "URL",
  template: "TPL",
  image: "IMG",
  video: "MP4",
  other: "FILE",
};

export function ResourceTypeIcon({
  type,
}: {
  type: Enums<"resource_type">;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold ${colors[type]}`}
    >
      {labels[type]}
    </span>
  );
}
