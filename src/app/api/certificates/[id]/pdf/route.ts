import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";
import { renderCertificatePdf } from "@/lib/certificates/render-pdf";
import { getCertificateById } from "@/lib/data/certificates";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await requireUser();

  const cert = await getCertificateById(id);
  if (!cert) {
    return new NextResponse("Certificate not found", { status: 404 });
  }

  const isOwner = cert.user_id === user.id;
  const allowed = isOwner || (await isAdmin(user.id));
  if (!allowed) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const supabase = await createClient();
  const [courseRes, profileRes] = await Promise.all([
    supabase
      .from("courses")
      .select("title")
      .eq("id", cert.course_id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("full_name, first_name, last_name, email")
      .eq("id", cert.user_id)
      .maybeSingle(),
  ]);

  const profile = profileRes.data;
  const studentName =
    profile?.full_name?.trim() ||
    `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() ||
    profile?.email ||
    "Student";

  const pdfBytes = await renderCertificatePdf({
    studentName,
    courseTitle: courseRes.data?.title ?? "Course",
    certificateNumber: cert.certificate_number ?? "—",
    issuedAt: cert.issued_at,
  });

  const filename = `certificate-${cert.certificate_number ?? cert.id}.pdf`;
  return new NextResponse(pdfBytes as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
