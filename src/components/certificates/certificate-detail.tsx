import { formatDateTime } from "@/lib/format";
import type { Tables } from "@/types";

interface Props {
  certificate: Tables<"certificates">;
  studentName: string;
  courseTitle: string;
}

export function CertificateDetail({
  certificate,
  studentName,
  courseTitle,
}: Props) {
  return (
    <div className="rounded-2xl border-8 border-double border-amber-300 bg-white p-10 text-center shadow-sm dark:border-amber-800 dark:bg-zinc-950 sm:p-16">
      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-700 dark:text-amber-400">
        Certificate of completion
      </p>
      <p className="mt-8 text-sm text-zinc-600 dark:text-zinc-400">
        This is to certify that
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        {studentName}
      </h1>
      <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
        has successfully completed
      </p>
      <h2 className="mt-3 text-xl font-medium tracking-tight sm:text-2xl">
        {courseTitle}
      </h2>
      <div className="mt-10 grid gap-4 border-t border-zinc-200 pt-6 text-xs text-zinc-500 sm:grid-cols-2 dark:border-zinc-800 dark:text-zinc-400">
        <div>
          <p className="uppercase tracking-wide">Issued on</p>
          <p className="mt-1 font-medium text-zinc-700 dark:text-zinc-300">
            {formatDateTime(certificate.issued_at)}
          </p>
        </div>
        <div>
          <p className="uppercase tracking-wide">Certificate number</p>
          <p className="mt-1 font-mono text-zinc-700 dark:text-zinc-300">
            {certificate.certificate_number ?? "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
