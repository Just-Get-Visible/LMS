import { ActiveCohortsWidget } from "@/components/dashboard/active-cohorts-widget";
import { EnrolledCoursesWidget } from "@/components/dashboard/enrolled-courses-widget";
import { RecentProgressWidget } from "@/components/dashboard/recent-progress-widget";
import { UpcomingSessionsWidget } from "@/components/dashboard/upcoming-sessions-widget";
import { getCurrentProfile, requireUser } from "@/lib/auth/user";
import { getActiveCohortsForUser } from "@/lib/data/cohorts";
import { getEnrolledCoursesForUser } from "@/lib/data/enrolments";
import { getUpcomingLiveSessionsForUser } from "@/lib/data/live-sessions";
import { getRecentLessonProgress } from "@/lib/data/progress";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await requireUser();
  const profile = await getCurrentProfile();

  const [enrolledCourses, cohorts, sessions, recentProgress] =
    await Promise.all([
      getEnrolledCoursesForUser(user.id),
      getActiveCohortsForUser(user.id),
      getUpcomingLiveSessionsForUser(5),
      getRecentLessonProgress(user.id, 5),
    ]);

  const greetingName =
    profile?.first_name?.trim() || profile?.full_name?.trim();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Welcome back{greetingName ? `, ${greetingName}` : ""}
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Pick up where you left off.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <EnrolledCoursesWidget items={enrolledCourses} />
          <RecentProgressWidget items={recentProgress} />
        </div>
        <div className="space-y-6">
          <UpcomingSessionsWidget sessions={sessions} />
          <ActiveCohortsWidget items={cohorts} />
        </div>
      </div>
    </div>
  );
}
