import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types";

type CourseRef = Pick<Tables<"courses">, "id" | "title" | "slug">;

export type CertificateWithCourse = {
  certificate: Tables<"certificates">;
  course: CourseRef | null;
};

export async function getMyCertificates(
  userId: string,
): Promise<CertificateWithCourse[]> {
  const supabase = await createClient();
  const { data: certs } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", userId)
    .order("issued_at", { ascending: false });

  if (!certs || certs.length === 0) return [];

  const courseIds = [...new Set(certs.map((c) => c.course_id))];
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, slug")
    .in("id", courseIds);

  const courseMap = new Map((courses ?? []).map((c) => [c.id, c]));
  return certs.map((certificate) => ({
    certificate,
    course: courseMap.get(certificate.course_id) ?? null,
  }));
}

export async function getCertificateById(
  id: string,
): Promise<Tables<"certificates"> | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("certificates")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

function generateCertificateNumber(): string {
  const hex = Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  )
    .join("")
    .toUpperCase();
  const year = new Date().getFullYear();
  return `CERT-${hex}-${year}`;
}

export async function maybeIssueCertificate(
  userId: string,
  courseId: string,
): Promise<string | null> {
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("certificate_enabled")
    .eq("id", courseId)
    .maybeSingle();
  if (!course?.certificate_enabled) return null;

  const { count } = await supabase
    .from("certificates")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("course_id", courseId);
  if ((count ?? 0) > 0) return null;

  const { data: inserted } = await supabase
    .from("certificates")
    .insert({
      user_id: userId,
      course_id: courseId,
      certificate_number: generateCertificateNumber(),
    })
    .select("id")
    .single();

  return inserted?.id ?? null;
}
