import Link from "next/link";

import {
  EMAIL_CATEGORY_LABELS,
  mergeEmailPreferences,
  verifyUnsubscribeToken,
} from "@/lib/email/preferences";
import { getAdminSupabase } from "@/lib/supabase/admin";

type SearchParams = Promise<{ token?: string }>;

export const metadata = {
  title: "Unsubscribe",
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { token } = await searchParams;
  if (!token) return <BadLink reason="No token in link." />;

  const payload = verifyUnsubscribeToken(token);
  if (!payload) return <BadLink reason="This link is invalid or expired." />;

  let updated = false;
  let dbError: string | null = null;
  try {
    const supabase = getAdminSupabase();
    const { data: profile } = await supabase
      .from("profiles")
      .select("metadata")
      .eq("id", payload.userId)
      .maybeSingle();

    if (!profile) {
      return <BadLink reason="We couldn't find your account." />;
    }

    const merged = mergeEmailPreferences(profile.metadata, {
      [payload.category]: false,
    });
    const { error } = await supabase
      .from("profiles")
      .update({ metadata: merged })
      .eq("id", payload.userId);

    if (error) {
      dbError = error.message;
    } else {
      updated = true;
    }
  } catch (e) {
    dbError = e instanceof Error ? e.message : "Unknown error.";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-zinc-950">
        {updated ? (
          <>
            <h1 className="text-xl font-semibold tracking-tight">
              You&apos;re unsubscribed
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              You&apos;ll no longer receive{" "}
              <strong>{EMAIL_CATEGORY_LABELS[payload.category]}</strong>{" "}
              emails. You&apos;ll still see updates inside the platform.
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Change your mind?{" "}
              <Link
                href="/dashboard/profile"
                className="font-medium underline-offset-4 hover:underline"
              >
                Manage email preferences
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold tracking-tight">
              We hit a snag
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {dbError ?? "Could not update your preferences."}
            </p>
            <Link
              href="/dashboard/profile"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              Manage preferences in the app →
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

function BadLink({ reason }: { reason: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="w-full max-w-md space-y-3 rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <h1 className="text-xl font-semibold tracking-tight">
          Invalid unsubscribe link
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{reason}</p>
        <Link
          href="/dashboard/profile"
          className="text-sm font-medium underline-offset-4 hover:underline"
        >
          Manage preferences in the app →
        </Link>
      </div>
    </main>
  );
}
