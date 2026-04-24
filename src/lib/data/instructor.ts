import { getAdminSupabase } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types";

export type InstructorCourseSummary = Pick<
  Tables<"courses">,
  | "id"
  | "slug"
  | "title"
  | "subtitle"
  | "visibility"
  | "delivery_type"
  | "thumbnail_url"
  | "sort_order"
  | "published_at"
  | "archived_at"
  | "updated_at"
>;

export async function getInstructorCourseIds(
  userId: string,
): Promise<string[]> {
  const supabase = await createClient();
  const [ciRes, primaryRes] = await Promise.all([
    supabase
      .from("course_instructors")
      .select("course_id")
      .eq("user_id", userId),
    supabase.from("courses").select("id").eq("instructor_user_id", userId),
  ]);

  return [
    ...new Set([
      ...(ciRes.data ?? []).map((row) => row.course_id),
      ...(primaryRes.data ?? []).map((row) => row.id),
    ]),
  ];
}

export async function getInstructorCourses(
  userId: string,
): Promise<InstructorCourseSummary[]> {
  const courseIds = await getInstructorCourseIds(userId);
  if (courseIds.length === 0) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select(
      "id, slug, title, subtitle, visibility, delivery_type, thumbnail_url, sort_order, published_at, archived_at, updated_at",
    )
    .in("id", courseIds)
    .is("archived_at", null)
    .order("updated_at", { ascending: false });

  return data ?? [];
}

export type InstructorStats = {
  courseCount: number;
  enrolmentCount: number;
  pendingSubmissionsCount: number;
};

export async function getInstructorStats(
  userId: string,
): Promise<InstructorStats> {
  const courseIds = await getInstructorCourseIds(userId);

  if (courseIds.length === 0) {
    return { courseCount: 0, enrolmentCount: 0, pendingSubmissionsCount: 0 };
  }

  const supabase = await createClient();
  const [enrolmentRes, submissionsRes] = await Promise.all([
    supabase
      .from("course_enrolments")
      .select("*", { count: "exact", head: true })
      .in("course_id", courseIds)
      .in("status", ["active", "completed"]),
    supabase
      .from("assignment_submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "submitted"),
  ]);

  return {
    courseCount: courseIds.length,
    enrolmentCount: enrolmentRes.count ?? 0,
    pendingSubmissionsCount: submissionsRes.count ?? 0,
  };
}

type AssignmentRef = Pick<Tables<"assignments">, "id" | "title" | "course_id">;
type ProfileRef = Pick<Tables<"profiles">, "id" | "full_name" | "email">;

export type PendingSubmissionItem = {
  submission: Tables<"assignment_submissions">;
  assignment: AssignmentRef | null;
  student: ProfileRef | null;
};

export async function getInstructorPendingSubmissions(
  limit = 5,
): Promise<PendingSubmissionItem[]> {
  const supabase = await createClient();
  const { data: subs } = await supabase
    .from("assignment_submissions")
    .select("*")
    .eq("status", "submitted")
    .order("submitted_at", { ascending: false })
    .limit(limit);

  if (!subs || subs.length === 0) return [];

  const assignmentIds = [...new Set(subs.map((s) => s.assignment_id))];
  const userIds = [...new Set(subs.map((s) => s.user_id))];

  const [assignmentsRes, profilesRes] = await Promise.all([
    supabase
      .from("assignments")
      .select("id, title, course_id")
      .in("id", assignmentIds),
    supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds),
  ]);

  const assignmentMap = new Map(
    (assignmentsRes.data ?? []).map((a) => [a.id, a]),
  );
  const profileMap = new Map(
    (profilesRes.data ?? []).map((p) => [p.id, p]),
  );

  return subs.map((submission) => ({
    submission,
    assignment: assignmentMap.get(submission.assignment_id) ?? null,
    student: profileMap.get(submission.user_id) ?? null,
  }));
}

export type CourseAnalytics = {
  activeEnrolments: number;
  completedEnrolments: number;
  completionRate: number;
  averageProgressPercent: number;
  pendingSubmissions: number;
  totalRevenue: number;
  revenueCurrency: string | null;
  enrolmentsLast7Days: number;
};

// Per-course analytics for the instructor view. Uses the admin client
// because callers (instructor course detail page) have already verified
// `isCourseInstructor` upstream — same pattern as fanout (Phase 37). RLS
// would otherwise hide rows the instructor doesn't directly own a relation to.
export async function getCourseAnalytics(
  courseId: string,
): Promise<CourseAnalytics> {
  const supabase = getAdminSupabase();
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 86_400_000,
  ).toISOString();

  const [
    activeRes,
    completedRes,
    progressRes,
    pendingSubmissionsRes,
    paidOrdersRes,
    recentEnrolmentsRes,
  ] = await Promise.all([
    supabase
      .from("course_enrolments")
      .select("*", { count: "exact", head: true })
      .eq("course_id", courseId)
      .eq("status", "active"),
    supabase
      .from("course_enrolments")
      .select("*", { count: "exact", head: true })
      .eq("course_id", courseId)
      .eq("status", "completed"),
    supabase
      .from("course_progress")
      .select("progress_percent")
      .eq("course_id", courseId),
    supabase
      .from("assignment_submissions")
      .select("assignments!inner(course_id)", { count: "exact", head: true })
      .eq("assignments.course_id", courseId)
      .eq("status", "submitted"),
    supabase
      .from("orders")
      .select("total_amount, currency_code")
      .eq("course_id", courseId)
      .eq("payment_status", "paid"),
    supabase
      .from("course_enrolments")
      .select("*", { count: "exact", head: true })
      .eq("course_id", courseId)
      .gte("enrolled_at", sevenDaysAgo),
  ]);

  const activeEnrolments = activeRes.count ?? 0;
  const completedEnrolments = completedRes.count ?? 0;
  const totalEnrolments = activeEnrolments + completedEnrolments;
  const completionRate =
    totalEnrolments === 0
      ? 0
      : Math.round((completedEnrolments / totalEnrolments) * 100);

  const progressRows = progressRes.data ?? [];
  const averageProgressPercent =
    progressRows.length === 0
      ? 0
      : Math.round(
          progressRows.reduce((sum, r) => sum + (r.progress_percent ?? 0), 0) /
            progressRows.length,
        );

  const paidOrders = paidOrdersRes.data ?? [];
  const totalRevenue = paidOrders.reduce(
    (sum, o) => sum + (o.total_amount ?? 0),
    0,
  );
  const revenueCurrency = paidOrders[0]?.currency_code ?? null;

  return {
    activeEnrolments,
    completedEnrolments,
    completionRate,
    averageProgressPercent,
    pendingSubmissions: pendingSubmissionsRes.count ?? 0,
    totalRevenue,
    revenueCurrency,
    enrolmentsLast7Days: recentEnrolmentsRes.count ?? 0,
  };
}

export type CohortAnalytics = {
  activeEnrolments: number;
  completedEnrolments: number;
  sessionsHeld: number;
  sessionsScheduled: number;
  attendanceRatePercent: number;
  averageProgressPercent: number;
  pendingSubmissions: number;
};

// Same privileged-read justification as getCourseAnalytics — caller has
// already verified isCohortInstructor upstream.
export async function getCohortAnalytics(
  cohortId: string,
): Promise<CohortAnalytics> {
  const supabase = getAdminSupabase();

  // Need the cohort's parent course to compute progress across enrolees.
  const { data: cohort } = await supabase
    .from("cohorts")
    .select("course_id")
    .eq("id", cohortId)
    .maybeSingle();
  const courseId = cohort?.course_id ?? null;

  const [
    activeRes,
    completedRes,
    enrolmentUserIdsRes,
    sessionsHeldRes,
    sessionsScheduledRes,
    sessionIdsRes,
    pendingSubmissionsRes,
  ] = await Promise.all([
    supabase
      .from("cohort_enrolments")
      .select("*", { count: "exact", head: true })
      .eq("cohort_id", cohortId)
      .eq("status", "active"),
    supabase
      .from("cohort_enrolments")
      .select("*", { count: "exact", head: true })
      .eq("cohort_id", cohortId)
      .eq("status", "completed"),
    supabase
      .from("cohort_enrolments")
      .select("user_id")
      .eq("cohort_id", cohortId)
      .in("status", ["active", "completed"]),
    supabase
      .from("live_sessions")
      .select("*", { count: "exact", head: true })
      .eq("cohort_id", cohortId)
      .eq("status", "completed"),
    supabase
      .from("live_sessions")
      .select("*", { count: "exact", head: true })
      .eq("cohort_id", cohortId),
    supabase
      .from("live_sessions")
      .select("id")
      .eq("cohort_id", cohortId)
      .eq("status", "completed"),
    supabase
      .from("assignment_submissions")
      .select("assignments!inner(cohort_id)", { count: "exact", head: true })
      .eq("assignments.cohort_id", cohortId)
      .eq("status", "submitted"),
  ]);

  const activeEnrolments = activeRes.count ?? 0;
  const completedEnrolments = completedRes.count ?? 0;
  const enroleeIds = (enrolmentUserIdsRes.data ?? []).map((r) => r.user_id);
  const sessionsHeld = sessionsHeldRes.count ?? 0;
  const sessionsScheduled = sessionsScheduledRes.count ?? 0;
  const heldSessionIds = (sessionIdsRes.data ?? []).map((r) => r.id);

  // Attendance: sum of "attended" rows across held sessions / expected.
  let attendanceRatePercent = 0;
  if (heldSessionIds.length > 0 && activeEnrolments + completedEnrolments > 0) {
    const { count: attendedCount } = await supabase
      .from("session_attendance")
      .select("*", { count: "exact", head: true })
      .in("live_session_id", heldSessionIds)
      .eq("status", "attended");
    const expected =
      heldSessionIds.length * (activeEnrolments + completedEnrolments);
    attendanceRatePercent =
      expected === 0 ? 0 : Math.round(((attendedCount ?? 0) / expected) * 100);
  }

  // Average linked-course progress across cohort enrolees.
  let averageProgressPercent = 0;
  if (courseId && enroleeIds.length > 0) {
    const { data: progressRows } = await supabase
      .from("course_progress")
      .select("progress_percent")
      .eq("course_id", courseId)
      .in("user_id", enroleeIds);
    if (progressRows && progressRows.length > 0) {
      averageProgressPercent = Math.round(
        progressRows.reduce(
          (sum, r) => sum + (r.progress_percent ?? 0),
          0,
        ) / progressRows.length,
      );
    }
  }

  return {
    activeEnrolments,
    completedEnrolments,
    sessionsHeld,
    sessionsScheduled,
    attendanceRatePercent,
    averageProgressPercent,
    pendingSubmissions: pendingSubmissionsRes.count ?? 0,
  };
}

export type StudentCohortDetail = {
  profile: Pick<
    Tables<"profiles">,
    "id" | "full_name" | "first_name" | "last_name" | "email" | "avatar_url"
  > | null;
  courseProgress: Tables<"course_progress"> | null;
  lessons: Pick<
    Tables<"lessons">,
    "id" | "title" | "module_id" | "sort_order" | "is_published"
  >[];
  lessonProgress: Pick<
    Tables<"lesson_progress">,
    "lesson_id" | "is_completed" | "completed_at" | "last_viewed_at"
  >[];
  assignments: {
    assignment: Pick<
      Tables<"assignments">,
      "id" | "title" | "due_at" | "max_score"
    >;
    submission: Tables<"assignment_submissions"> | null;
  }[];
  sessions: {
    session: Pick<
      Tables<"live_sessions">,
      "id" | "title" | "scheduled_start_at" | "status"
    >;
    attendance: Tables<"session_attendance"> | null;
  }[];
};

export async function getStudentCohortDetail(
  cohortId: string,
  userId: string,
): Promise<StudentCohortDetail> {
  const supabase = getAdminSupabase();

  const { data: cohort } = await supabase
    .from("cohorts")
    .select("course_id")
    .eq("id", cohortId)
    .maybeSingle();
  const courseId = cohort?.course_id ?? null;

  const [
    profileRes,
    courseProgressRes,
    lessonsRes,
    lessonProgressRes,
    assignmentsRes,
    submissionsRes,
    sessionsRes,
    attendanceRes,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, first_name, last_name, email, avatar_url")
      .eq("id", userId)
      .maybeSingle(),
    courseId
      ? supabase
          .from("course_progress")
          .select("*")
          .eq("user_id", userId)
          .eq("course_id", courseId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    courseId
      ? supabase
          .from("lessons")
          .select("id, title, module_id, sort_order, is_published")
          .eq("course_id", courseId)
          .eq("is_published", true)
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [] }),
    courseId
      ? supabase
          .from("lesson_progress")
          .select("lesson_id, is_completed, completed_at, last_viewed_at")
          .eq("user_id", userId)
          .eq("course_id", courseId)
      : Promise.resolve({ data: [] }),
    supabase
      .from("assignments")
      .select("id, title, due_at, max_score")
      .eq("cohort_id", cohortId)
      .order("due_at", { ascending: true, nullsFirst: false }),
    supabase
      .from("assignment_submissions")
      .select("*")
      .eq("user_id", userId),
    supabase
      .from("live_sessions")
      .select("id, title, scheduled_start_at, status")
      .eq("cohort_id", cohortId)
      .order("scheduled_start_at", { ascending: true }),
    supabase
      .from("session_attendance")
      .select("*")
      .eq("user_id", userId),
  ]);

  const submissionsByAssignment = new Map(
    (submissionsRes.data ?? []).map((s) => [s.assignment_id, s]),
  );
  const attendanceBySession = new Map(
    (attendanceRes.data ?? []).map((a) => [a.live_session_id, a]),
  );

  const assignments = (assignmentsRes.data ?? []).map((a) => ({
    assignment: a,
    submission: submissionsByAssignment.get(a.id) ?? null,
  }));
  const sessions = (sessionsRes.data ?? []).map((s) => ({
    session: s,
    attendance: attendanceBySession.get(s.id) ?? null,
  }));

  return {
    profile: profileRes.data,
    courseProgress: courseProgressRes.data,
    lessons: lessonsRes.data ?? [],
    lessonProgress: lessonProgressRes.data ?? [],
    assignments,
    sessions,
  };
}

export type InstructorPublicProfile = Pick<
  Tables<"profiles">,
  | "id"
  | "full_name"
  | "first_name"
  | "last_name"
  | "avatar_url"
  | "headline"
  | "bio"
>;

// Public read — safe fields only. Uses admin client because the marketing
// page must render for anonymous visitors regardless of RLS.
export async function getInstructorPublicProfile(
  id: string,
): Promise<InstructorPublicProfile | null> {
  const supabase = getAdminSupabase();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, first_name, last_name, avatar_url, headline, bio")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export type InstructorDirectoryEntry = InstructorPublicProfile & {
  courseCount: number;
};

// Lists every instructor with at least one public, non-archived course —
// either as the headline `instructor_user_id` or via `course_instructors`.
// Sorted by course count desc, then name.
export async function listPublicInstructors(): Promise<
  InstructorDirectoryEntry[]
> {
  const supabase = getAdminSupabase();

  const [coursesRes, joinersRes] = await Promise.all([
    supabase
      .from("courses")
      .select("id, instructor_user_id")
      .eq("visibility", "public")
      .is("archived_at", null),
    supabase.from("course_instructors").select("user_id, course_id"),
  ]);

  const publicCourseIds = new Set(
    (coursesRes.data ?? []).map((c) => c.id),
  );
  const courseMap = new Map<string, Set<string>>();

  for (const c of coursesRes.data ?? []) {
    if (!c.instructor_user_id) continue;
    if (!courseMap.has(c.instructor_user_id))
      courseMap.set(c.instructor_user_id, new Set());
    courseMap.get(c.instructor_user_id)!.add(c.id);
  }
  for (const j of joinersRes.data ?? []) {
    if (!publicCourseIds.has(j.course_id)) continue;
    if (!courseMap.has(j.user_id)) courseMap.set(j.user_id, new Set());
    courseMap.get(j.user_id)!.add(j.course_id);
  }

  const userIds = [...courseMap.keys()];
  if (userIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, first_name, last_name, avatar_url, headline, bio")
    .in("id", userIds);

  return (profiles ?? [])
    .map((p) => ({
      ...p,
      courseCount: courseMap.get(p.id)?.size ?? 0,
    }))
    .sort((a, b) => {
      if (b.courseCount !== a.courseCount)
        return b.courseCount - a.courseCount;
      const an =
        a.full_name?.trim() ||
        `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim();
      const bn =
        b.full_name?.trim() ||
        `${b.first_name ?? ""} ${b.last_name ?? ""}`.trim();
      return an.localeCompare(bn);
    });
}

// Public courses taught by this instructor — either as the headline
// `instructor_user_id` OR via `course_instructors`. Filter to public +
// non-archived so the public page only surfaces what visitors can actually
// open. Returns the same shape as catalog cards so the existing CourseCard
// renders it as-is.
export async function getInstructorPublicCourses(
  id: string,
): Promise<
  Pick<
    Tables<"courses">,
    | "id"
    | "slug"
    | "title"
    | "subtitle"
    | "short_description"
    | "thumbnail_url"
    | "price_amount"
    | "currency_code"
    | "is_free"
    | "delivery_type"
    | "difficulty_level"
    | "tags"
  >[]
> {
  const supabase = getAdminSupabase();
  const cols =
    "id, slug, title, subtitle, short_description, thumbnail_url, price_amount, currency_code, is_free, delivery_type, difficulty_level, tags, visibility, archived_at";

  const [headlineRes, joinedRes] = await Promise.all([
    supabase.from("courses").select(cols).eq("instructor_user_id", id),
    supabase.from("course_instructors").select("course_id").eq("user_id", id),
  ]);

  const joinedIds = (joinedRes.data ?? []).map((r) => r.course_id);
  const joined =
    joinedIds.length > 0
      ? (await supabase.from("courses").select(cols).in("id", joinedIds))
          .data ?? []
      : [];

  const all = [...(headlineRes.data ?? []), ...joined];
  const seen = new Set<string>();
  const deduped = all.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return c.visibility === "public" && !c.archived_at;
  });

  return deduped.map(({ visibility: _v, archived_at: _a, ...rest }) => rest);
}
