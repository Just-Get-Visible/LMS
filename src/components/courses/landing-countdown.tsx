"use client";

import { useEffect, useState } from "react";

interface Props {
  target: string; // ISO date
  label?: string;
}

export function LandingCountdown({ target, label = "Starts in" }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = new Date(target).getTime() - now;

  if (diff <= 0) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-accent-300 px-4 py-1.5 text-sm font-semibold text-brand-900">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-900" />
        Live now
      </div>
    );
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return (
    <div className="inline-flex flex-col items-start gap-2 sm:flex-row sm:items-center">
      <span className="text-xs font-medium uppercase tracking-wider text-white/70">
        {label}
      </span>
      <div className="flex gap-2 font-mono text-sm">
        <Block value={days} unit="d" />
        <Block value={hours} unit="h" />
        <Block value={minutes} unit="m" />
        <Block value={seconds} unit="s" />
      </div>
    </div>
  );
}

function Block({ value, unit }: { value: number; unit: string }) {
  return (
    <span className="rounded-md bg-white/10 px-2.5 py-1 backdrop-blur">
      <span className="font-bold tabular-nums">
        {value.toString().padStart(2, "0")}
      </span>
      <span className="ml-0.5 text-white/60">{unit}</span>
    </span>
  );
}
