import type { MetadataRoute } from "next";

import { listPublicCohorts } from "@/lib/data/cohorts";
import { listPublicCourses } from "@/lib/data/courses";
import { listPublicInstructors } from "@/lib/data/instructor";
import { getAppBaseUrl } from "@/lib/email/client";
import { getAdminSupabase } from "@/lib/supabase/admin";

// Service-role admin reads can't run during build prerender.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getAppBaseUrl();

  const [courses, cohorts, instructors] = await Promise.all([
    listPublicCourses(),
    listPublicCohorts(),
    listPublicInstructors(),
  ]);

  // Preview lessons need course slugs paired with lesson ids — one query
  // for all of them across all public courses.
  const courseIdToSlug = new Map(courses.map((c) => [c.id, c.slug]));
  const courseIds = [...courseIdToSlug.keys()];
  const previewLessons =
    courseIds.length > 0
      ? (
          await getAdminSupabase()
            .from("lessons")
            .select("id, course_id")
            .in("course_id", courseIds)
            .eq("is_preview", true)
            .eq("is_published", true)
        ).data ?? []
      : [];

  const now = new Date();

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cohorts`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/instructors`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...courses.map((c) => ({
      url: `${baseUrl}/courses/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...previewLessons.flatMap((l) => {
      const slug = courseIdToSlug.get(l.course_id);
      return slug
        ? [
            {
              url: `${baseUrl}/courses/${slug}/lessons/${l.id}`,
              lastModified: now,
              changeFrequency: "weekly" as const,
              priority: 0.6,
            },
          ]
        : [];
    }),
    ...cohorts.map(({ cohort }) => ({
      url: `${baseUrl}/cohorts/${cohort.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...instructors.map((i) => ({
      url: `${baseUrl}/instructors/${i.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
