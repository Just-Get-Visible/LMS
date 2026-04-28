type Phase = "plan" | "build" | "launch";

export interface TimelineModule {
  phase: Phase;
  number: number;
  title: string;
  description: string;
}

interface ModuleTimelineProps {
  modules: TimelineModule[];
}

const phaseMeta: Record<
  Phase,
  { label: string; tagline: string; accent: string }
> = {
  plan: {
    label: "Plan",
    tagline: "Turn the idea into a clear, structured roadmap.",
    accent: "from-brand-100 to-brand-50",
  },
  build: {
    label: "Build",
    tagline: "Use AI to assemble your app — feature by feature.",
    accent: "from-accent-100 to-accent-50",
  },
  launch: {
    label: "Launch",
    tagline: "Ship it on the web, on mobile, and to the App Store.",
    accent: "from-brand-100 to-accent-50",
  },
};

const phaseOrder: Phase[] = ["plan", "build", "launch"];

export function ModuleTimeline({ modules }: ModuleTimelineProps) {
  const grouped = phaseOrder.map((phase) => ({
    phase,
    modules: modules.filter((m) => m.phase === phase),
  }));

  return (
    <div className="mx-auto mt-14 max-w-4xl space-y-14">
      {grouped.map(({ phase, modules: phaseModules }, phaseIdx) => {
        const meta = phaseMeta[phase];
        return (
          <div key={phase} className="relative">
            <div className="grid gap-6 sm:grid-cols-[200px_1fr] sm:gap-10">
              <div className="sm:pt-2">
                <span
                  className={`inline-block rounded-md bg-gradient-to-br ${meta.accent} px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-900`}
                >
                  Phase {phaseIdx + 1}
                </span>
                <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-brand-900">
                  {meta.label}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {meta.tagline}
                </p>
              </div>
              <ol className="relative space-y-5 sm:border-l sm:border-zinc-200 sm:pl-8">
                {phaseModules.map((module) => (
                  <li
                    key={module.number}
                    className="relative rounded-xl border border-zinc-200 bg-white p-6 transition-colors hover:border-brand-600"
                  >
                    <span
                      aria-hidden
                      className="absolute -left-[34px] top-6 hidden h-2.5 w-2.5 rounded-full bg-brand-600 ring-4 ring-zinc-50 sm:block"
                    />
                    <div className="flex items-start gap-4">
                      <span className="font-display text-3xl font-extrabold leading-none text-brand-600/30">
                        {String(module.number).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-base font-bold tracking-tight text-brand-900">
                          {module.title}
                        </h4>
                        <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
                          {module.description}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        );
      })}
    </div>
  );
}
