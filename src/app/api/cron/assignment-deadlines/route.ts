import { NextResponse } from "next/server";

import { getAppBaseUrl, sendEmail } from "@/lib/email/client";
import { isOptedIn, makeUnsubscribeToken } from "@/lib/email/preferences";
import { assignmentDueEmail } from "@/lib/email/templates";
import { getAdminSupabase } from "@/lib/supabase/admin";
import type { TablesInsert } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Reminder fires roughly 24h before the deadline. Window is wide enough to
// tolerate a few missed cron ticks; idempotency is enforced per (user,
// assignment) by checking for an existing notification row.
const WINDOW_START_MIN = 22 * 60;
const WINDOW_END_MIN = 26 * 60;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = getAdminSupabase();
  const now = Date.now();
  const windowStart = new Date(
    now + WINDOW_START_MIN * 60 * 1000,
  ).toISOString();
  const windowEnd = new Date(
    now + WINDOW_END_MIN * 60 * 1000,
  ).toISOString();

  const { data: assignments, error } = await supabase
    .from("assignments")
    .select("id, title, course_id, cohort_id, due_at")
    .not("due_at", "is", null)
    .gte("due_at", windowStart)
    .lte("due_at", windowEnd);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!assignments || assignments.length === 0) {
    return NextResponse.json({ assignmentsFound: 0, notificationsSent: 0 });
  }

  const baseUrl = getAppBaseUrl();
  let totalNotifications = 0;
  let assignmentsProcessed = 0;

  for (const assignment of assignments) {
    if (!assignment.due_at) continue;

    const candidates = await getRecipientUserIds(
      supabase,
      assignment.cohort_id,
      assignment.course_id,
    );
    if (candidates.length === 0) continue;

    // Drop students who already submitted (any status — they don't need a
    // "you'll miss the deadline" ping).
    const { data: submissions } = await supabase
      .from("assignment_submissions")
      .select("user_id")
      .eq("assignment_id", assignment.id)
      .in("user_id", candidates);
    const submitted = new Set((submissions ?? []).map((s) => s.user_id));

    // Drop students we've already pinged for this assignment.
    const { data: prior } = await supabase
      .from("notifications")
      .select("user_id")
      .eq("type", "assignment_due")
      .filter("metadata->>assignment_id", "eq", assignment.id);
    const alreadyPinged = new Set((prior ?? []).map((n) => n.user_id));

    const recipients = candidates.filter(
      (id) => !submitted.has(id) && !alreadyPinged.has(id),
    );
    if (recipients.length === 0) continue;

    const dueDisplay = formatDateTime(assignment.due_at);
    const linkUrl = `/dashboard/assignments/${assignment.id}`;

    const notifRows: TablesInsert<"notifications">[] = recipients.map(
      (userId) => ({
        user_id: userId,
        type: "assignment_due",
        title: `Due tomorrow: ${assignment.title}`,
        body: `Due ${dueDisplay}`,
        link_url: linkUrl,
        metadata: { assignment_id: assignment.id, reminder: true },
      }),
    );
    await supabase.from("notifications").insert(notifRows);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name, metadata")
      .in("id", recipients);

    for (const profile of profiles ?? []) {
      if (!profile.email) continue;
      if (!isOptedIn(profile.metadata, "deadlines")) continue;
      const token = makeUnsubscribeToken(profile.id, "deadlines");
      const msg = assignmentDueEmail({
        recipientName: profile.full_name?.trim() || "there",
        assignmentTitle: assignment.title,
        dueDisplay,
        link: `${baseUrl}${linkUrl}`,
        unsubscribeUrl: `${baseUrl}/unsubscribe?token=${encodeURIComponent(token)}`,
      });
      await sendEmail({ to: profile.email, ...msg });
    }

    totalNotifications += recipients.length;
    assignmentsProcessed += 1;
  }

  return NextResponse.json({
    assignmentsFound: assignments.length,
    assignmentsProcessed,
    notificationsSent: totalNotifications,
  });
}

async function getRecipientUserIds(
  supabase: ReturnType<typeof getAdminSupabase>,
  cohortId: string | null,
  courseId: string | null,
): Promise<string[]> {
  if (cohortId) {
    const { data } = await supabase
      .from("cohort_enrolments")
      .select("user_id")
      .eq("cohort_id", cohortId)
      .in("status", ["active", "completed"]);
    return [...new Set((data ?? []).map((r) => r.user_id))];
  }
  if (courseId) {
    const { data } = await supabase
      .from("course_enrolments")
      .select("user_id")
      .eq("course_id", courseId)
      .in("status", ["active", "completed"]);
    return [...new Set((data ?? []).map((r) => r.user_id))];
  }
  return [];
}

function formatDateTime(iso: string): string {
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
