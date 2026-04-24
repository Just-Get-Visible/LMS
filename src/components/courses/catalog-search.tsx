"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FILTER_KEYS = ["q", "delivery", "difficulty", "pricing"] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

export function CatalogSearch() {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  function setParam(key: FilterKey, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    startTransition(() => {
      router.push(qs ? `/courses?${qs}` : "/courses");
    });
  }

  function clearAll() {
    startTransition(() => router.push("/courses"));
  }

  const hasFilters = FILTER_KEYS.some((k) => params.get(k));

  return (
    <div className="space-y-3">
      <Input
        type="search"
        defaultValue={params.get("q") ?? ""}
        placeholder="Search courses..."
        onChange={(event) => setParam("q", event.target.value)}
        className="max-w-md"
        aria-label="Search courses"
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <FilterSelect
          label="Delivery"
          name="delivery"
          value={params.get("delivery") ?? ""}
          options={[
            { value: "", label: "Any" },
            { value: "self_paced", label: "Self-paced" },
            { value: "cohort", label: "Cohort-based" },
            { value: "hybrid", label: "Hybrid" },
          ]}
          onChange={(v) => setParam("delivery", v)}
        />
        <FilterSelect
          label="Difficulty"
          name="difficulty"
          value={params.get("difficulty") ?? ""}
          options={[
            { value: "", label: "Any" },
            { value: "beginner", label: "Beginner" },
            { value: "intermediate", label: "Intermediate" },
            { value: "advanced", label: "Advanced" },
          ]}
          onChange={(v) => setParam("difficulty", v)}
        />
        <FilterSelect
          label="Pricing"
          name="pricing"
          value={params.get("pricing") ?? ""}
          options={[
            { value: "", label: "Any" },
            { value: "free", label: "Free" },
            { value: "paid", label: "Paid" },
          ]}
          onChange={(v) => setParam("pricing", v)}
        />
      </div>
      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="text-xs text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-400"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={`filter-${name}`} className="text-xs text-zinc-500 dark:text-zinc-400">
        {label}
      </Label>
      <select
        id={`filter-${name}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
