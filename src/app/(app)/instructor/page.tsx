import { InstructorCoursesWidget } from "@/components/instructor/instructor-courses-widget";
import { InstructorStatsWidget } from "@/components/instructor/instructor-stats-widget";
import { InstructorSubmissionsWidget } from "@/components/instructor/instructor-submissions-widget";
import { requireUser } from "@/lib/auth/user";
import {
  getInstructorCourses,
  getInstructorPendingSubmissions,
  getInstructorStats,
} from "@/lib/data/instructor";

export const metadata = {
  title: "Instructor",
};

export default async function InstructorDashboardPage() {
  const user = await requireUser();

  const [courses, stats, submissions] = await Promise.all([
    getInstructorCourses(user.id),
    getInstructorStats(user.id),
    getInstructorPendingSubmissions(5),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Instructor
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Manage your courses, cohorts and student work.
        </p>
      </div>

      <InstructorStatsWidget stats={stats} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <InstructorCoursesWidget items={courses} />
        </div>
        <div>
          <InstructorSubmissionsWidget items={submissions} />
        </div>
      </div>
    </div>
  );
}
