"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { getSubmissionFileUrl } from "@/lib/actions/submissions";

export function SubmissionFileButton({
  submissionId,
}: {
  submissionId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await getSubmissionFileUrl(submissionId);
      if (result.ok) {
        window.open(result.url, "_blank", "noopener,noreferrer");
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleClick}
        disabled={isPending}
      >
        {isPending ? "Loading..." : "Download file"}
      </Button>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
