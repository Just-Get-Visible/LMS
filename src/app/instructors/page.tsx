import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import {
  listPublicInstructors,
  type InstructorDirectoryEntry,
} from "@/lib/data/instructor";

// Service-role admin client read — can't run during build prerender.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Instructors",
  description: "Browse instructors teaching on the platform.",
  openGraph: {
    title: "Instructors",
    description: "Browse instructors teaching on the platform.",
    url: "/instructors",
  },
};

export default async function InstructorsDirectoryPage() {
  const instructors = await listPublicInstructors();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Instructors
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          People teaching public courses on the platform.
        </p>
      </div>

      {instructors.length === 0 ? (
        <EmptyState
          title="No instructors yet"
          description="Once instructors publish courses, they'll appear here."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {instructors.map((i) => (
            <InstructorCard key={i.id} instructor={i} />
          ))}
        </ul>
      )}
    </div>
  );
}

function InstructorCard({
  instructor,
}: {
  instructor: InstructorDirectoryEntry;
}) {
  const name =
    instructor.full_name?.trim() ||
    `${instructor.first_name ?? ""} ${instructor.last_name ?? ""}`.trim() ||
    "Instructor";
  const countLabel =
    instructor.courseCount === 1 ? "1 course" : `${instructor.courseCount} courses`;

  return (
    <li>
      <Link
        href={`/instructors/${instructor.id}`}
        className="flex h-full gap-4 rounded-xl border border-black/10 bg-white p-5 transition-colors hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-950 dark:hover:bg-zinc-900"
      >
        {instructor.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={instructor.avatar_url}
            alt=""
            className="h-14 w-14 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-base font-semibold text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
          >
            {name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 space-y-1">
          <p className="truncate font-medium">{name}</p>
          {instructor.headline && (
            <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
              {instructor.headline}
            </p>
          )}
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {countLabel}
          </p>
        </div>
      </Link>
    </li>
  );
}
