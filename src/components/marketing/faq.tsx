export interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

interface FAQProps {
  items: FAQItem[];
}

export function FAQ({ items }: FAQProps) {
  return (
    <div className="mx-auto mt-14 max-w-3xl divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      {items.map((item, idx) => (
        <details key={idx} className="group">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 px-6 py-5 text-left text-base font-bold tracking-tight text-brand-900 transition-colors hover:bg-zinc-50">
            <span>{item.question}</span>
            <span
              className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-700 transition-transform group-open:rotate-45"
              aria-hidden
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
          </summary>
          <div className="px-6 pb-6 text-sm leading-relaxed text-zinc-600">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
