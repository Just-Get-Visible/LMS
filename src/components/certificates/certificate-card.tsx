import Link from "next/link";

import type { CertificateWithCourse } from "@/lib/data/certificates";
import { formatDateTime } from "@/lib/format";

export function CertificateCard({ item }: { item: CertificateWithCourse }) {
  const { certificate, course } = item;
  return (
    <Link
      href={`/dashboard/certificates/${certificate.id}`}
      className="block rounded-2xl border-2 border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">
        Certificate
      </p>
      <h3 className="mt-2 text-lg font-semibold tracking-tight">
        {course?.title ?? "Course"}
      </h3>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
        Issued {formatDateTime(certificate.issued_at)}
      </p>
      {certificate.certificate_number && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {certificate.certificate_number}
        </p>
      )}
    </Link>
  );
}
