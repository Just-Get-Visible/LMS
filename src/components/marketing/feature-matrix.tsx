export interface MatrixRow {
  feature: string;
  included: boolean[];
}

interface FeatureMatrixProps {
  tiers: string[];
  rows: MatrixRow[];
  popularIndex?: number;
}

const checkMark = (
  <span
    className="grid h-5 w-5 place-items-center rounded-full bg-accent-400 text-brand-900"
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

const dash = (
  <span
    className="block h-px w-3 bg-zinc-300"
    aria-label="not included"
    role="img"
  />
);

export function FeatureMatrix({
  tiers,
  rows,
  popularIndex,
}: FeatureMatrixProps) {
  return (
    <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <div
        className="hidden text-sm md:grid"
        style={{
          gridTemplateColumns: `1.4fr repeat(${tiers.length}, minmax(0, 1fr))`,
        }}
      >
        <div className="border-b border-zinc-200 bg-zinc-50 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
          What&rsquo;s included
        </div>
        {tiers.map((tier, idx) => (
          <div
            key={tier}
            className={`border-b border-l border-zinc-200 px-4 py-4 text-center text-[11px] font-bold uppercase tracking-[0.18em] ${
              idx === popularIndex
                ? "bg-brand-600 text-accent-400"
                : "bg-zinc-50 text-zinc-500"
            }`}
          >
            {tier}
          </div>
        ))}

        {rows.map((row, rIdx) => (
          <div key={row.feature} className="contents">
            <div
              className={`px-6 py-3.5 text-zinc-700 ${
                rIdx === rows.length - 1 ? "" : "border-b border-zinc-100"
              }`}
            >
              {row.feature}
            </div>
            {row.included.map((included, tIdx) => (
              <div
                key={tIdx}
                className={`flex items-center justify-center border-l border-zinc-200 px-4 py-3.5 ${
                  rIdx === rows.length - 1 ? "" : "border-b border-zinc-100"
                } ${tIdx === popularIndex ? "bg-brand-50/40" : ""}`}
              >
                {included ? checkMark : dash}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Mobile: per-tier accordions-like stacks */}
      <div className="md:hidden">
        {tiers.map((tier, tIdx) => (
          <details
            key={tier}
            className={`group ${
              tIdx === tiers.length - 1 ? "" : "border-b border-zinc-200"
            }`}
            open={tIdx === popularIndex}
          >
            <summary
              className={`flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-bold tracking-tight ${
                tIdx === popularIndex
                  ? "bg-brand-600 text-accent-400"
                  : "bg-zinc-50 text-brand-900"
              }`}
            >
              <span className="uppercase tracking-[0.18em] text-[12px]">
                {tier}
              </span>
              <span
                className="text-base transition-transform group-open:rotate-180"
                aria-hidden
              >
                ⌄
              </span>
            </summary>
            <ul className="divide-y divide-zinc-100">
              {rows.map((row) => (
                <li
                  key={row.feature}
                  className="flex items-center justify-between gap-3 px-5 py-3 text-sm text-zinc-700"
                >
                  <span>{row.feature}</span>
                  {row.included[tIdx] ? checkMark : dash}
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
}
