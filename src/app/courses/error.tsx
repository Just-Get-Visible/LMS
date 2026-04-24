"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function CoursesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        Couldn&apos;t load courses
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {error.message || "Something went wrong loading this page."}
      </p>
      <div className="mt-4 flex justify-center">
        <Button onClick={reset} variant="secondary" size="sm">
          Try again
        </Button>
      </div>
    </div>
  );
}
