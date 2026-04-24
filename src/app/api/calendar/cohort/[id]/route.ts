import { NextResponse } from "next/server";

import { buildIcs, type IcsEvent } from "@/lib/calendar/ics";
import { verifyCalendarToken } from "@/lib/calendar/tokens";
import { getAppBaseUrl } from "@/lib/email/client";
import { getAdminSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function GET(
  req: Request,
  { params }: { params: Params },
) {
  const { id: cohortId } = await params;
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) return new NextResponse("Missing token", { status: 401 });

  const verified = verifyCalendarToken(cohortId, token);
  if (!verified) return new NextResponse("Invalid token", { status: 401 });

  const supabase = getAdminSupabase();

  // Re-check current access — revoking enrolment kills the feed even though
  // the token is still cryptographically valid.
  const { data: enrolment } = await supabase
    .from("cohort_enrolments")
    .select("status")
    .eq("cohort_id", cohortId)
    .eq("user_id", verified.userId)
    .maybeSingle();

  if (
    !enrolment ||
    !["active", "completed"].includes(enrolment.status)
  ) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { data: cohort } = await supabase
    .from("cohorts")
    .select("id, name")
    .eq("id", cohortId)
    .maybeSingle();
  if (!cohort) return new NextResponse("Not found", { status: 404 });

  const { data: sessions } = await supabase
    .from("live_sessions")
    .select(
      "id, title, description, scheduled_start_at, scheduled_end_at, join_url, status",
    )
    .eq("cohort_id", cohortId)
    .order("scheduled_start_at", { ascending: true });

  const baseUrl = getAppBaseUrl();
  const events: IcsEvent[] = (sessions ?? []).map((s) => ({
    uid: `session-${s.id}@${new URL(baseUrl).hostname}`,
    start: new Date(s.scheduled_start_at),
    end: new Date(s.scheduled_end_at),
    summary: s.title,
    description: s.description ?? undefined,
    location: s.join_url ?? undefined,
    url: `${baseUrl}/dashboard/sessions/${s.id}`,
    status:
      s.status === "cancelled"
        ? "CANCELLED"
        : s.status === "scheduled"
          ? "CONFIRMED"
          : undefined,
  }));

  const body = buildIcs({
    prodId: "-//Just Get Visible//LMS//EN",
    name: cohort.name,
    events,
  });

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="cohort-${cohortId}.ics"`,
      "Cache-Control": "private, max-age=300",
    },
  });
}
