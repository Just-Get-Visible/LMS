"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function AppError({
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
    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950/30">
      <h1 className="text-xl font-semibold text-red-900 dark:text-red-200">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm text-red-800 dark:text-red-300">
        {error.message ||
          "An unexpected error occurred while loading this page."}
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-red-700 dark:text-red-400">
          Reference: {error.digest}
        </p>
      )}
      <div className="mt-4 flex justify-center">
        <Button onClick={reset} variant="secondary" size="sm">
          Try again
        </Button>
      </div>
    </div>
  );
}
