"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { getResourceDownloadUrl } from "@/lib/actions/resources";

interface Props {
  resourceId: string;
  isDownloadable: boolean;
}

export function ResourceDownloadButton({ resourceId, isDownloadable }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await getResourceDownloadUrl(resourceId);
      if (result.ok) {
        window.open(result.url, "_blank", "noopener,noreferrer");
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="sm"
        variant="outline"
        onClick={handleClick}
        disabled={isPending}
      >
        {isPending ? "Loading..." : isDownloadable ? "Download" : "Open"}
      </Button>
      {error && (
        <p className="text-right text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
