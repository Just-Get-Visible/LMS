import { NextResponse } from "next/server";

import { getAppBaseUrl, sendEmail } from "@/lib/email/client";
import { isOptedIn, makeUnsubscribeToken } from "@/lib/email/preferences";
import { sessionReminderEmail } from "@/lib/email/templates";
import { getAdminSupabase } from "@/lib/supabase/admin";
import type { TablesInsert } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_START_MIN = 45;
const WINDOW_END_MIN = 75;

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

  const { data: sessions, error: sessionsError } = await supabase
    .from("live_sessions")
    .select(
      "id, title, course_id, cohort_id, scheduled_start_at, join_url",
    )
    .eq("status", "scheduled")
    .gte("scheduled_start_at", windowStart)
    .lte("scheduled_start_at", windowEnd);

  if (sessionsError) {
    return NextResponse.json(
      { error: sessionsError.message },
      { status: 500 },
    );
  }
  if (!sessions || sessions.length === 0) {
    return NextResponse.json({ sessionsFound: 0, notificationsSent: 0 });
  }

  const baseUrl = getAppBaseUrl();
  let totalNotifications = 0;
  let sessionsProcessed = 0;

  for (const session of sessions) {
    // Idempotency: skip if any reminder has already been written for this session.
    const { count: alreadySent } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("type", "session_reminder")
      .filter("metadata->>session_id", "eq", session.id);

    if ((alreadySent ?? 0) > 0) continue;

    const userIds = await getRecipientUserIds(
      supabase,
      session.cohort_id,
      session.course_id,
    );
    if (userIds.length === 0) continue;

    const whenDisplay = formatDateTime(session.scheduled_start_at);

    // Bulk insert notifications
    const notifRows: TablesInsert<"notifications">[] = userIds.map(
      (userId) => ({
        user_id: userId,
        type: "session_reminder",
        title: `Starting soon: ${session.title}`,
        body: `Starts ${whenDisplay}`,
        link_url: `/dashboard/sessions/${session.id}`,
        metadata: { session_id: session.id, reminder: true },
      }),
    );
    await supabase.from("notifications").insert(notifRows);

    // Email fan-out
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name, metadata")
      .in("id", userIds);

    for (const profile of profiles ?? []) {
      if (!profile.email) continue;
      if (!isOptedIn(profile.metadata, "reminders")) continue;
      const token = makeUnsubscribeToken(profile.id, "reminders");
      const msg = sessionReminderEmail({
        recipientName: profile.full_name?.trim() || "there",
        sessionTitle: session.title,
        whenDisplay,
        link: `${baseUrl}/dashboard/sessions/${session.id}`,
        joinUrl: session.join_url,
        unsubscribeUrl: `${baseUrl}/unsubscribe?token=${encodeURIComponent(token)}`,
      });
      await sendEmail({ to: profile.email, ...msg });
    }

    totalNotifications += userIds.length;
    sessionsProcessed += 1;
  }

  return NextResponse.json({
    sessionsFound: sessions.length,
    sessionsProcessed,
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
