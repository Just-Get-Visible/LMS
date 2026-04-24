import { notFound } from "next/navigation";

import { CourseCard } from "@/components/courses/course-card";
import {
  getInstructorPublicCourses,
  getInstructorPublicProfile,
} from "@/lib/data/instructor";

type Params = Promise<{ id: string }>;

function displayName(p: {
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
}): string {
  return (
    p.full_name?.trim() ||
    `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() ||
    "Instructor"
  );
}

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const profile = await getInstructorPublicProfile(id);
  if (!profile) return { title: "Instructor not found" };
  const name = displayName(profile);
  const description = profile.headline ?? profile.bio?.slice(0, 200);
  return {
    title: name,
    description,
    openGraph: {
      type: "profile",
      title: name,
      description,
      url: `/instructors/${profile.id}`,
      images: profile.avatar_url
        ? [{ url: profile.avatar_url, alt: name }]
        : undefined,
    },
    twitter: {
      card: profile.avatar_url ? "summary" : "summary",
      title: name,
      description,
    },
  };
}

export default async function InstructorPublicProfilePage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const [profile, courses] = await Promise.all([
    getInstructorPublicProfile(id),
    getInstructorPublicCourses(id),
  ]);
  if (!profile) notFound();

  const name = displayName(profile);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-10">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start">
        {profile.avatar_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt=""
            className="h-24 w-24 rounded-full object-cover"
          />
        )}
        <div className="min-w-0 space-y-2">
          <h1 className="font-display text-4xl font-bold tracking-tight">
            {name}
          </h1>
          {profile.headline && (
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              {profile.headline}
            </p>
          )}
          {profile.bio && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {profile.bio}
            </p>
          )}
        </div>
      </header>

      <section>
        <h2 className="mb-4 text-xl font-semibold tracking-tight">
          Courses by {name}
        </h2>
        {courses.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No public courses yet.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
