import { NextResponse } from "next/server";

import { maybeIssueCertificate } from "@/lib/data/certificates";
import { getAppBaseUrl, sendEmail } from "@/lib/email/client";
import { cohortCompletedEmail } from "@/lib/email/templates";
import { notifyCertificateIssued } from "@/lib/notifications/fanout";
import { getAdminSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = getAdminSupabase();
  const nowIso = new Date().toISOString();

  // (1) Auto-flip open/closed → running once starts_at has passed.
  const { data: started, error: startErr } = await supabase
    .from("cohorts")
    .update({ status: "running" })
    .lte("starts_at", nowIso)
    .in("status", ["open", "closed"])
    .select("id");

  if (startErr) {
    return NextResponse.json({ error: startErr.message }, { status: 500 });
  }

  // (2) Auto-flip running → completed once ends_at has passed. Then close
  // out enrolments and email participants.
  const { data: ending, error: endErr } = await supabase
    .from("cohorts")
    .select("id, name")
    .eq("status", "running")
    .not("ends_at", "is", null)
    .lte("ends_at", nowIso);

  if (endErr) {
    return NextResponse.json({ error: endErr.message }, { status: 500 });
  }

  const baseUrl = getAppBaseUrl();
  let cohortsCompleted = 0;
  let enrolmentsCompleted = 0;
  let emailsSent = 0;
  let certificatesIssued = 0;

  for (const cohort of ending ?? []) {
    await supabase
      .from("cohorts")
      .update({ status: "completed" })
      .eq("id", cohort.id);
    cohortsCompleted += 1;

    // Flip every active enrolment in this cohort. "completed" rows from
    // earlier completion events stay put.
    const { data: flipped } = await supabase
      .from("cohort_enrolments")
      .update({ status: "completed" })
      .eq("cohort_id", cohort.id)
      .eq("status", "active")
      .select("user_id");
    const flippedIds = (flipped ?? []).map((r) => r.user_id);
    enrolmentsCompleted += flippedIds.length;

    if (flippedIds.length === 0) continue;

    // Pull the cohort's parent course for the safety-net cert issuance.
    const { data: cohortFull } = await supabase
      .from("cohorts")
      .select("course_id")
      .eq("id", cohort.id)
      .maybeSingle();
    const courseId = cohortFull?.course_id ?? null;

    // Profiles for emailing.
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .in("id", flippedIds);

    const cohortLink = `${baseUrl}/dashboard/cohorts/${cohort.id}`;

    for (const profile of profiles ?? []) {
      if (profile.email) {
        const msg = cohortCompletedEmail({
          recipientName: profile.full_name?.trim() || "there",
          cohortName: cohort.name,
          cohortLink,
        });
        await sendEmail({ to: profile.email, ...msg });
        emailsSent += 1;
      }

      // Safety-net certificate issuance — `maybeIssueCertificate`
      // dedups internally and exits if the course isn't fully complete or
      // the cert flag is off.
      if (courseId) {
        const certId = await maybeIssueCertificate(profile.id, courseId);
        if (certId) {
          certificatesIssued += 1;
          await notifyCertificateIssued(certId);
        }
      }
    }
  }

  return NextResponse.json({
    cohortsStarted: started?.length ?? 0,
    cohortsCompleted,
    enrolmentsCompleted,
    emailsSent,
    certificatesIssued,
  });
}
