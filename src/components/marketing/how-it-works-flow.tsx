export interface FlowStep {
  number: string;
  title: string;
  description: string;
}

interface HowItWorksFlowProps {
  steps: FlowStep[];
}

export function HowItWorksFlow({ steps }: HowItWorksFlowProps) {
  return (
    <ol className="relative mx-auto mt-16 grid max-w-5xl gap-10 md:grid-cols-3 md:gap-6">
      {steps.map((step, idx) => (
        <li key={step.number} className="relative">
          {idx < steps.length - 1 && (
            <span
              aria-hidden
              className="absolute hidden md:block md:left-[calc(50%+3rem)] md:right-[-1.25rem] md:top-[2.25rem] md:h-px md:border-t md:border-dashed md:border-zinc-300"
            />
          )}
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-4">
              <span className="font-display text-6xl font-extrabold leading-none tracking-tight text-brand-600/15 sm:text-7xl">
                {step.number}
              </span>
              <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-accent-400 bg-white text-base font-bold text-brand-900">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </span>
            </div>
            <h3 className="mt-5 text-2xl font-extrabold tracking-tight text-brand-900">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              {step.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
