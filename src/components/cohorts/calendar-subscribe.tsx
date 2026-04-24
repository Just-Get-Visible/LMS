"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

interface Props {
  feedUrl: string;
}

export function CalendarSubscribe({ feedUrl }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — fall back to selecting the text input.
      const el = document.getElementById(
        "calendar-feed-url",
      ) as HTMLInputElement | null;
      el?.select();
    }
  }

  return (
    <div className="rounded-lg border border-black/10 bg-zinc-50 p-4 dark:border-white/10 dark:bg-zinc-900">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-medium">Subscribe in your calendar</p>
        <Button type="button" onClick={copy} size="sm" variant="secondary">
          {copied ? "Copied!" : "Copy link"}
        </Button>
      </div>
      <p className="mb-2 text-xs text-zinc-600 dark:text-zinc-400">
        Add this URL as a subscribed calendar (Apple Calendar, Google Calendar,
        Outlook). Sessions stay in sync as the schedule changes.
      </p>
      <input
        id="calendar-feed-url"
        readOnly
        value={feedUrl}
        onFocus={(e) => e.currentTarget.select()}
        className="w-full rounded-md border border-black/10 bg-white px-2 py-1.5 font-mono text-xs text-zinc-700 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-300"
      />
    </div>
  );
}
