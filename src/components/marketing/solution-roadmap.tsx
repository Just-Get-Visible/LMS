interface Milestone {
  label: string;
  description: string;
}

const milestones: Milestone[] = [
  {
    label: "Plan",
    description: "Turn the idea into a clear roadmap you can actually build.",
  },
  {
    label: "Build",
    description: "Use AI to assemble your app — feature by feature.",
  },
  {
    label: "Launch",
    description: "Ship it on the web, on mobile, and to the App Store.",
  },
];

export function SolutionRoadmap() {
  return (
    <div className="relative rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
        Your three-phase journey
      </p>
      <ol className="relative mt-6 space-y-7">
        <span
          aria-hidden
          className="absolute left-[19px] top-3 bottom-3 w-px border-l-2 border-dashed border-zinc-200"
        />
        {milestones.map((m, idx) => (
          <li key={m.label} className="relative flex gap-5">
            <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-accent-400 shadow-sm ring-4 ring-white">
              {idx + 1}
            </span>
            <div className="min-w-0 pt-1">
              <h4 className="text-lg font-extrabold tracking-tight text-brand-900">
                {m.label}
              </h4>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
                {m.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-7 flex items-center gap-3 rounded-lg bg-zinc-50 px-4 py-3">
        <span
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent-400 text-brand-900"
          aria-hidden
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <p className="text-sm font-medium text-brand-900">
          A live, working app at the end.
        </p>
      </div>
    </div>
  );
}
