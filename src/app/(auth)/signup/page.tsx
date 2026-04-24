import Link from "next/link";
import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth/signup-form";
import { getCurrentUser } from "@/lib/auth/user";

export const metadata = {
  title: "Sign up",
};

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="space-y-8">
      <div className="space-y-3 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-display text-xl font-bold tracking-tight text-brand-700 transition-colors hover:text-brand-800 dark:text-brand-200 dark:hover:text-brand-100"
          aria-label="Home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-sm font-bold text-white">
            L
          </span>
          <span>LMS</span>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Start learning in under a minute
          </p>
        </div>
      </div>
      <div className="rounded-2xl border border-black/10 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <SignupForm />
      </div>
    </div>
  );
}
