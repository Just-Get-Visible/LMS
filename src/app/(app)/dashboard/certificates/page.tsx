import { CertificateCard } from "@/components/certificates/certificate-card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/user";
import { getMyCertificates } from "@/lib/data/certificates";

export const metadata = {
  title: "Certificates",
};

export default async function CertificatesPage() {
  const user = await requireUser();
  const certificates = await getMyCertificates(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Certificates</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Awarded for completing courses.
        </p>
      </div>

      {certificates.length === 0 ? (
        <EmptyState
          title="No certificates yet"
          description="Complete a course to earn a certificate."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((item) => (
            <CertificateCard key={item.certificate.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
