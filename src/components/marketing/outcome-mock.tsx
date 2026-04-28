export function OutcomeMock() {
  return (
    <div className="relative" aria-hidden>
      <div
        className="pointer-events-none absolute -inset-10 rounded-full bg-accent-400/20 blur-3xl"
        aria-hidden
      />
      <div className="relative mx-auto w-[260px] rotate-[-3deg] sm:w-[280px]">
        <div className="overflow-hidden rounded-[2.25rem] border-[7px] border-zinc-900 bg-zinc-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)]">
          <div className="aspect-[9/19] w-full bg-white">
            <div className="flex items-center justify-between px-5 pt-3 pb-1">
              <span className="text-[10px] font-bold tracking-tight text-zinc-900">
                9:41
              </span>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-900" />
                <span className="h-1.5 w-3 rounded-sm bg-zinc-900" />
              </div>
            </div>

            <div className="flex items-center justify-between px-5 pt-3">
              <div>
                <p className="text-[9px] font-medium uppercase tracking-wider text-zinc-400">
                  Welcome back
                </p>
                <h5 className="mt-0.5 text-base font-extrabold tracking-tight text-brand-900">
                  Your App
                </h5>
              </div>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                YA
              </span>
            </div>

            <div className="mx-5 mt-4 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-500 p-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/60">
                This week
              </p>
              <p className="mt-1 text-2xl font-extrabold tracking-tight text-white">
                +24%
              </p>
              <div className="mt-3 flex h-8 items-end gap-1">
                <span className="h-1/2 w-2 rounded-sm bg-white/30" />
                <span className="h-3/4 w-2 rounded-sm bg-white/40" />
                <span className="h-2/5 w-2 rounded-sm bg-white/30" />
                <span className="h-full w-2 rounded-sm bg-accent-400" />
                <span className="h-3/5 w-2 rounded-sm bg-white/40" />
                <span className="h-4/5 w-2 rounded-sm bg-accent-400" />
                <span className="h-1/2 w-2 rounded-sm bg-white/30" />
                <span className="h-3/5 w-2 rounded-sm bg-white/40" />
              </div>
            </div>

            <div className="mt-4 space-y-2 px-5">
              <Row tone="accent" />
              <Row tone="brand" />
              <Row tone="muted" />
            </div>

            <div className="mt-5 flex items-center justify-around border-t border-zinc-100 px-4 py-3">
              <Tab active />
              <Tab />
              <Tab />
              <Tab />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ tone }: { tone: "accent" | "brand" | "muted" }) {
  const dot =
    tone === "accent"
      ? "bg-accent-400"
      : tone === "brand"
        ? "bg-brand-300"
        : "bg-zinc-300";
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 p-2.5">
      <span className={`h-7 w-7 shrink-0 rounded-lg ${dot}`} />
      <div className="flex-1 space-y-1.5">
        <span className="block h-1.5 w-3/4 rounded bg-zinc-300" />
        <span className="block h-1.5 w-1/2 rounded bg-zinc-200" />
      </div>
      <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
    </div>
  );
}

function Tab({ active = false }: { active?: boolean }) {
  return (
    <span
      className={`h-1.5 w-6 rounded-full ${
        active ? "bg-brand-600" : "bg-zinc-200"
      }`}
    />
  );
}
