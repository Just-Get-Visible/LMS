import Link from "next/link";
import { notFound } from "next/navigation";

import { CertificateDetail } from "@/components/certificates/certificate-detail";
import { Button } from "@/components/ui/button";
import { isAdmin } from "@/lib/auth/roles";
import { getCurrentProfile, requireUser } from "@/lib/auth/user";
import { getCertificateById } from "@/lib/data/certificates";
import { createClient } from "@/lib/supabase/server";

type Params = Promise<{ id: string }>;

export const metadata = {
  title: "Certificate",
};

export default async function CertificateDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const user = await requireUser();

  const certificate = await getCertificateById(id);
  if (!certificate) notFound();

  const isOwner = certificate.user_id === user.id;
  const allowed = isOwner || (await isAdmin(user.id));
  if (!allowed) notFound();

  const supabase = await createClient();
  const [{ data: course }, profile] = await Promise.all([
    supabase
      .from("courses")
      .select("title")
      .eq("id", certificate.course_id)
      .maybeSingle(),
    isOwner
      ? getCurrentProfile()
      : supabase
          .from("profiles")
          .select(
            "full_name, first_name, last_name, email",
          )
          .eq("id", certificate.user_id)
          .maybeSingle()
          .then((res) => res.data),
  ]);

  const studentName =
    profile?.full_name?.trim() ||
    `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() ||
    profile?.email ||
    "Student";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/dashboard/certificates"
          className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← All certificates
        </Link>
      </div>

      <CertificateDetail
        certificate={certificate}
        studentName={studentName}
        courseTitle={course?.title ?? "Course"}
      />

      <div className="flex justify-center">
        <a href={`/api/certificates/${certificate.id}/pdf`} download>
          <Button>Download PDF</Button>
        </a>
      </div>
    </div>
  );
}
