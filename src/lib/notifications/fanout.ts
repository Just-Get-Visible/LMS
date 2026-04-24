import { getAppBaseUrl, sendEmail } from "@/lib/email/client";
import {
  type EmailCategory,
  isOptedIn,
  makeUnsubscribeToken,
} from "@/lib/email/preferences";
import { makeCalendarToken } from "@/lib/calendar/tokens";
import {
  announcementEmail,
  certificateIssuedEmail,
  cohortEnrolmentEmail,
  courseEnrolmentEmail,
  discussionReplyEmail,
  sessionScheduledEmail,
  submissionReviewedEmail,
} from "@/lib/email/templates";
import { getAdminSupabase } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";
import type { TablesInsert } from "@/types";

type RecipientProfile = {
  id: string;
  email: string;
  fullName: string | null;
  metadata: Json | null;
};

async function getRecipientProfiles(
  userIds: string[],
): Promise<RecipientProfile[]> {
  if (userIds.length === 0) return [];
  const supabase = getAdminSupabase();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, metadata")
    .in("id", userIds);
  return (data ?? [])
    .filter(
      (
        p,
      ): p is {
        id: string;
        email: string;
        full_name: string | null;
        metadata: Json | null;
      } => !!p.email,
    )
    .map((p) => ({
      id: p.id,
      email: p.email,
      fullName: p.full_name,
      metadata: p.metadata,
    }));
}

function displayName(p: RecipientProfile): string {
  return p.fullName?.trim() || "there";
}

function unsubscribeUrlFor(
  baseUrl: string,
  userId: string,
  category: EmailCategory,
): string {
  const token = makeUnsubscribeToken(userId, category);
  return `${baseUrl}/unsubscribe?token=${encodeURIComponent(token)}`;
}

async function getCourseEnrolledUserIds(
  courseId: string,
): Promise<string[]> {
  const supabase = getAdminSupabase();
  const { data } = await supabase
    .from("course_enrolments")
    .select("user_id")
    .eq("course_id", courseId)
    .in("status", ["active", "completed"]);
  return [...new Set((data ?? []).map((row) => row.user_id))];
}

async function getCohortEnrolledUserIds(
  cohortId: string,
): Promise<string[]> {
  const supabase = getAdminSupabase();
  const { data } = await supabase
    .from("cohort_enrolments")
    .select("user_id")
    .eq("cohort_id", cohortId)
    .in("status", ["active", "completed"]);
  return [...new Set((data ?? []).map((row) => row.user_id))];
}

async function bulkInsertNotifications(
  rows: TablesInsert<"notifications">[],
): Promise<void> {
  if (rows.length === 0) return;
  const supabase = getAdminSupabase();
  // Best-effort: don't block the action's success on notification failure
  // (RLS rejection or transient error). Surface in dev console.
  const { error } = await supabase.from("notifications").insert(rows);
  if (error && process.env.NODE_ENV !== "production") {
    console.warn("Notification fanout failed:", error.message);
  }
}

export async function notifyAnnouncementPublished(
  announcementId: string,
): Promise<void> {
  const supabase = getAdminSupabase();
  const { data: ann } = await supabase
    .from("announcements")
    .select(
      "id, title, course_id, cohort_id, is_published, created_by",
    )
    .eq("id", announcementId)
    .maybeSingle();

  if (!ann || !ann.is_published) return;

  const userIds = ann.cohort_id
    ? await getCohortEnrolledUserIds(ann.cohort_id)
    : ann.course_id
      ? await getCourseEnrolledUserIds(ann.course_id)
      : [];

  const recipients = ann.created_by
    ? userIds.filter((id) => id !== ann.created_by)
    : userIds;
  if (recipients.length === 0) return;

  const linkUrl = ann.cohort_id
    ? `/dashboard/cohorts/${ann.cohort_id}`
    : "/dashboard/announcements";

  await bulkInsertNotifications(
    recipients.map((userId) => ({
      user_id: userId,
      type: "announcement",
      title: `New announcement: ${ann.title}`,
      link_url: linkUrl,
      metadata: { announcement_id: ann.id },
    })),
  );

  // Email fanout — best-effort, doesn't block the action.
  const baseUrl = getAppBaseUrl();
  const { data: full } = await supabase
    .from("announcements")
    .select("body")
    .eq("id", announcementId)
    .maybeSingle();
  const profiles = await getRecipientProfiles(recipients);
  for (const profile of profiles) {
    if (!isOptedIn(profile.metadata, "announcements")) continue;
    const msg = announcementEmail({
      recipientName: displayName(profile),
      announcementTitle: ann.title,
      announcementBody: full?.body ?? "",
      link: `${baseUrl}${linkUrl}`,
      unsubscribeUrl: unsubscribeUrlFor(baseUrl, profile.id, "announcements"),
    });
    await sendEmail({ to: profile.email, ...msg });
  }
}

export async function notifySubmissionReviewed(
  submissionId: string,
): Promise<void> {
  const supabase = getAdminSupabase();
  const { data: sub } = await supabase
    .from("assignment_submissions")
    .select("id, user_id, assignment_id, status, score")
    .eq("id", submissionId)
    .maybeSingle();

  if (!sub) return;

  const { data: assignment } = await supabase
    .from("assignments")
    .select("title")
    .eq("id", sub.assignment_id)
    .maybeSingle();

  const scorePart = sub.score != null ? ` — score ${sub.score}` : "";
  const body = assignment
    ? `${assignment.title}: ${sub.status}${scorePart}`
    : `Status: ${sub.status}${scorePart}`;

  await bulkInsertNotifications([
    {
      user_id: sub.user_id,
      type: "submission_reviewed",
      title: "Your submission was reviewed",
      body,
      link_url: `/dashboard/assignments/${sub.assignment_id}`,
      metadata: {
        submission_id: sub.id,
        assignment_id: sub.assignment_id,
        status: sub.status,
      },
    },
  ]);

  // Email fanout
  const { data: assignmentFull } = await supabase
    .from("assignments")
    .select("title, max_score")
    .eq("id", sub.assignment_id)
    .maybeSingle();
  const profiles = await getRecipientProfiles([sub.user_id]);
  if (profiles.length > 0 && isOptedIn(profiles[0].metadata, "submissions")) {
    const baseUrl = getAppBaseUrl();
    const msg = submissionReviewedEmail({
      recipientName: displayName(profiles[0]),
      assignmentTitle: assignmentFull?.title ?? "your assignment",
      status: sub.status,
      score: sub.score ?? null,
      maxScore: assignmentFull?.max_score ?? null,
      link: `${baseUrl}/dashboard/assignments/${sub.assignment_id}`,
      unsubscribeUrl: unsubscribeUrlFor(
        baseUrl,
        profiles[0].id,
        "submissions",
      ),
    });
    await sendEmail({ to: profiles[0].email, ...msg });
  }
}

export async function notifyCertificateIssued(
  certificateId: string,
): Promise<void> {
  const supabase = getAdminSupabase();
  const { data: cert } = await supabase
    .from("certificates")
    .select("id, user_id, course_id, certificate_number")
    .eq("id", certificateId)
    .maybeSingle();

  if (!cert) return;

  const { data: course } = await supabase
    .from("courses")
    .select("title")
    .eq("id", cert.course_id)
    .maybeSingle();

  const courseTitle = course?.title ?? "your course";

  const certNumber = cert.certificate_number ?? "";

  await bulkInsertNotifications([
    {
      user_id: cert.user_id,
      type: "certificate",
      title: `Certificate earned: ${courseTitle}`,
      body: certNumber,
      link_url: `/dashboard/certificates/${cert.id}`,
      metadata: {
        certificate_id: cert.id,
        course_id: cert.course_id,
      },
    },
  ]);

  // Email
  const profiles = await getRecipientProfiles([cert.user_id]);
  if (profiles.length > 0 && isOptedIn(profiles[0].metadata, "certificates")) {
    const baseUrl = getAppBaseUrl();
    const msg = certificateIssuedEmail({
      recipientName: displayName(profiles[0]),
      courseTitle,
      certificateNumber: certNumber,
      link: `${baseUrl}/dashboard/certificates/${cert.id}`,
      unsubscribeUrl: unsubscribeUrlFor(
        baseUrl,
        profiles[0].id,
        "certificates",
      ),
    });
    await sendEmail({ to: profiles[0].email, ...msg });
  }
}

export async function notifyCourseEnrolment(
  userId: string,
  courseId: string,
): Promise<void> {
  const supabase = getAdminSupabase();

  const { data: course } = await supabase
    .from("courses")
    .select("id, title")
    .eq("id", courseId)
    .maybeSingle();
  if (!course) return;

  // First lesson, by module sort_order then lesson sort_order. Fall back to
  // the course landing page if there are none yet.
  const { data: firstLesson } = await supabase
    .from("lessons")
    .select("id, sort_order")
    .eq("course_id", courseId)
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  const startPath = firstLesson
    ? `/dashboard/courses/${courseId}/lessons/${firstLesson.id}`
    : `/dashboard/courses/${courseId}`;

  await bulkInsertNotifications([
    {
      user_id: userId,
      type: "enrolment",
      title: `Welcome to ${course.title}`,
      body: "You're enrolled. Start whenever you're ready.",
      link_url: startPath,
      metadata: { course_id: courseId },
    },
  ]);

  const profiles = await getRecipientProfiles([userId]);
  if (profiles.length === 0) return;
  const baseUrl = getAppBaseUrl();
  const msg = courseEnrolmentEmail({
    recipientName: displayName(profiles[0]),
    courseTitle: course.title,
    startLink: `${baseUrl}${startPath}`,
  });
  await sendEmail({ to: profiles[0].email, ...msg });
}

export async function notifyCohortEnrolment(
  userId: string,
  cohortId: string,
): Promise<void> {
  const supabase = getAdminSupabase();

  const { data: cohort } = await supabase
    .from("cohorts")
    .select("id, name, starts_at")
    .eq("id", cohortId)
    .maybeSingle();
  if (!cohort) return;

  const cohortPath = `/dashboard/cohorts/${cohortId}`;
  const startsAtDisplay = cohort.starts_at
    ? formatWhen(cohort.starts_at)
    : null;

  await bulkInsertNotifications([
    {
      user_id: userId,
      type: "enrolment",
      title: `Welcome to ${cohort.name}`,
      body: startsAtDisplay
        ? `Starts ${startsAtDisplay}.`
        : "You're in the cohort.",
      link_url: cohortPath,
      metadata: { cohort_id: cohortId },
    },
  ]);

  const profiles = await getRecipientProfiles([userId]);
  if (profiles.length === 0) return;
  const baseUrl = getAppBaseUrl();
  const calendarFeedUrl = `${baseUrl}/api/calendar/cohort/${cohortId}?token=${encodeURIComponent(
    makeCalendarToken(cohortId, userId),
  )}`;
  const msg = cohortEnrolmentEmail({
    recipientName: displayName(profiles[0]),
    cohortName: cohort.name,
    startsAtDisplay,
    cohortLink: `${baseUrl}${cohortPath}`,
    calendarFeedUrl,
  });
  await sendEmail({ to: profiles[0].email, ...msg });
}

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export async function notifyDiscussionReply(
  postId: string,
): Promise<void> {
  const supabase = getAdminSupabase();

  const { data: post } = await supabase
    .from("discussion_posts")
    .select("id, thread_id, author_user_id, body")
    .eq("id", postId)
    .maybeSingle();

  if (!post) return;

  const { data: thread } = await supabase
    .from("discussion_threads")
    .select("id, title, created_by")
    .eq("id", post.thread_id)
    .maybeSingle();

  if (!thread) return;

  const { data: priorPosts } = await supabase
    .from("discussion_posts")
    .select("author_user_id")
    .eq("thread_id", post.thread_id)
    .neq("id", post.id);

  const recipientSet = new Set<string>();
  recipientSet.add(thread.created_by);
  for (const p of priorPosts ?? []) recipientSet.add(p.author_user_id);
  recipientSet.delete(post.author_user_id);

  const recipients = [...recipientSet];
  if (recipients.length === 0) return;

  const { data: author } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", post.author_user_id)
    .maybeSingle();
  const authorName = author?.full_name?.trim() || "Someone";

  const excerpt =
    post.body.length > 280 ? `${post.body.slice(0, 280)}…` : post.body;

  const linkUrl = `/dashboard/discussions/${thread.id}`;

  await bulkInsertNotifications(
    recipients.map((userId) => ({
      user_id: userId,
      type: "discussion_reply",
      title: `New reply: ${thread.title}`,
      body: `${authorName} replied`,
      link_url: linkUrl,
      metadata: {
        thread_id: thread.id,
        post_id: post.id,
        author_user_id: post.author_user_id,
      },
    })),
  );

  // Email
  const baseUrl = getAppBaseUrl();
  const profiles = await getRecipientProfiles(recipients);
  for (const profile of profiles) {
    if (!isOptedIn(profile.metadata, "discussions")) continue;
    const msg = discussionReplyEmail({
      recipientName: displayName(profile),
      threadTitle: thread.title,
      authorName,
      excerpt,
      link: `${baseUrl}${linkUrl}`,
      unsubscribeUrl: unsubscribeUrlFor(baseUrl, profile.id, "discussions"),
    });
    await sendEmail({ to: profile.email, ...msg });
  }
}

export async function notifyLiveSessionScheduled(
  sessionId: string,
): Promise<void> {
  const supabase = getAdminSupabase();
  const { data: session } = await supabase
    .from("live_sessions")
    .select(
      "id, title, course_id, cohort_id, host_user_id, created_by, scheduled_start_at",
    )
    .eq("id", sessionId)
    .maybeSingle();

  if (!session) return;

  const userIds = session.cohort_id
    ? await getCohortEnrolledUserIds(session.cohort_id)
    : session.course_id
      ? await getCourseEnrolledUserIds(session.course_id)
      : [];

  const exclude = new Set(
    [session.host_user_id, session.created_by].filter(
      (id): id is string => !!id,
    ),
  );
  const recipients = userIds.filter((id) => !exclude.has(id));
  if (recipients.length === 0) return;

  let when = "";
  try {
    when = new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(session.scheduled_start_at));
  } catch {
    when = session.scheduled_start_at;
  }

  await bulkInsertNotifications(
    recipients.map((userId) => ({
      user_id: userId,
      type: "live_session",
      title: `New session: ${session.title}`,
      body: `Starts ${when}`,
      link_url: `/dashboard/sessions/${session.id}`,
      metadata: { session_id: session.id },
    })),
  );

  // Email fanout
  const baseUrl = getAppBaseUrl();
  const profiles = await getRecipientProfiles(recipients);
  for (const profile of profiles) {
    if (!isOptedIn(profile.metadata, "sessions")) continue;
    const msg = sessionScheduledEmail({
      recipientName: displayName(profile),
      sessionTitle: session.title,
      whenDisplay: when,
      link: `${baseUrl}/dashboard/sessions/${session.id}`,
      unsubscribeUrl: unsubscribeUrlFor(baseUrl, profile.id, "sessions"),
    });
    await sendEmail({ to: profile.email, ...msg });
  }
}
