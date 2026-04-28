export interface ComparisonRow {
  label: string;
  mostCourses: string;
  thisCourse: string;
}

interface ComparisonTableProps {
  rows: ComparisonRow[];
}

const xMark = (
  <span
    className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-zinc-300 text-zinc-400"
    aria-hidden
  >
    ×
  </span>
);

const checkMark = (
  <span
    className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent-400 text-brand-900"
    aria-hidden
  >
    <svg
      width="12"
      height="12"
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
);

export function ComparisonTable({ rows }: ComparisonTableProps) {
  return (
    <div className="mx-auto mt-14 max-w-4xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {/* Desktop layout */}
      <div className="hidden md:block">
        <div className="grid grid-cols-[1fr_minmax(120px,auto)_1fr] border-b border-zinc-200">
          <div className="bg-zinc-50 px-6 py-4 text-right">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
              Most courses
            </p>
          </div>
          <div className="bg-zinc-50" />
          <div className="bg-brand-600 px-6 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-400">
              This course
            </p>
          </div>
        </div>
        {rows.map((row, idx) => (
          <div
            key={row.label}
            className={`grid grid-cols-[1fr_minmax(120px,auto)_1fr] ${
              idx === rows.length - 1 ? "" : "border-b border-zinc-200"
            }`}
          >
            <div className="flex items-start justify-end gap-3 px-6 py-5 text-sm leading-relaxed text-zinc-600">
              <span className="text-right">{row.mostCourses}</span>
              {xMark}
            </div>
            <div className="flex items-center justify-center bg-zinc-50 px-6 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
              {row.label}
            </div>
            <div className="flex items-start gap-3 px-6 py-5 text-sm leading-relaxed text-zinc-800">
              {checkMark}
              <span>{row.thisCourse}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile layout */}
      <div className="md:hidden">
        {rows.map((row, idx) => (
          <div
            key={row.label}
            className={
              idx === rows.length - 1 ? "" : "border-b border-zinc-200"
            }
          >
            <div className="bg-zinc-50 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
              {row.label}
            </div>
            <div className="flex items-start gap-3 border-t border-zinc-100 px-5 py-4 text-sm text-zinc-600">
              {xMark}
              <span>{row.mostCourses}</span>
            </div>
            <div className="flex items-start gap-3 border-t border-zinc-100 bg-brand-600/[0.04] px-5 py-4 text-sm text-zinc-800">
              {checkMark}
              <span>{row.thisCourse}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
