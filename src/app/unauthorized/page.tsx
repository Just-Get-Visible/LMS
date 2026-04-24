import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Access denied",
};

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <h1 className="text-xl font-semibold tracking-tight">Access denied</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          You don&apos;t have permission to view this page. If you think this is
          a mistake, contact your administrator.
        </p>
        <div className="flex justify-center">
          <Link href="/dashboard">
            <Button variant="secondary">Back to dashboard</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
