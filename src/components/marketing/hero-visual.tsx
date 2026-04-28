export function HeroVisual() {
  return (
    <div
      className="relative mx-auto h-[420px] w-full max-w-[460px] sm:h-[480px]"
      aria-hidden
    >
      <div className="absolute left-0 top-6 w-[68%] -rotate-3">
        <WebFrame />
      </div>
      <div className="absolute -right-2 bottom-0 w-[44%] rotate-3">
        <PhoneFrame />
      </div>
    </div>
  );
}

function WebFrame() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/15 bg-white shadow-2xl shadow-black/30 ring-1 ring-black/5">
      <div className="flex items-center gap-1.5 border-b border-zinc-200 bg-zinc-50 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
        <span className="ml-2 h-3 flex-1 rounded bg-zinc-100" />
      </div>
      <div className="flex aspect-[16/10]">
        <div className="flex w-1/3 flex-col gap-2 border-r border-zinc-100 bg-zinc-50/60 p-3">
          <span className="h-2 w-3/4 rounded bg-brand-600/80" />
          <span className="h-1.5 w-2/3 rounded bg-zinc-300" />
          <span className="h-1.5 w-1/2 rounded bg-zinc-300" />
          <span className="h-1.5 w-3/5 rounded bg-zinc-300" />
          <span className="mt-3 h-1.5 w-2/3 rounded bg-zinc-300" />
          <span className="h-1.5 w-1/2 rounded bg-zinc-300" />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-3">
          <span className="h-2.5 w-2/5 rounded bg-zinc-800" />
          <div className="mt-1 grid grid-cols-3 gap-2">
            <div className="h-10 rounded-md bg-gradient-to-br from-brand-100 to-brand-50" />
            <div className="h-10 rounded-md bg-gradient-to-br from-accent-100 to-accent-50" />
            <div className="h-10 rounded-md bg-gradient-to-br from-zinc-100 to-zinc-50" />
          </div>
          <div className="mt-2 flex h-12 items-end gap-1.5">
            <span className="h-1/2 w-2 rounded-sm bg-brand-300" />
            <span className="h-3/4 w-2 rounded-sm bg-brand-400" />
            <span className="h-2/5 w-2 rounded-sm bg-brand-300" />
            <span className="h-full w-2 rounded-sm bg-brand-600" />
            <span className="h-3/5 w-2 rounded-sm bg-brand-400" />
            <span className="h-4/5 w-2 rounded-sm bg-accent-400" />
            <span className="h-1/2 w-2 rounded-sm bg-brand-300" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneFrame() {
  return (
    <div className="overflow-hidden rounded-[2rem] border-[6px] border-zinc-900 bg-zinc-900 shadow-2xl shadow-black/40">
      <div className="aspect-[9/19] w-full bg-white">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <span className="h-1.5 w-6 rounded-full bg-zinc-300" />
          <span className="h-1.5 w-3 rounded-full bg-zinc-300" />
        </div>
        <div className="flex flex-col gap-2 px-4 pt-2">
          <span className="h-2 w-2/3 rounded bg-zinc-800" />
          <span className="h-1.5 w-1/2 rounded bg-zinc-300" />
          <div className="mt-3 rounded-lg bg-gradient-to-br from-brand-600 to-brand-500 p-3">
            <span className="block h-1.5 w-2/3 rounded bg-white/40" />
            <span className="mt-2 block h-2 w-1/2 rounded bg-white/80" />
          </div>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center gap-2 rounded-md border border-zinc-200 p-2">
              <span className="h-3 w-3 rounded-full bg-accent-400" />
              <span className="h-1.5 flex-1 rounded bg-zinc-200" />
            </div>
            <div className="flex items-center gap-2 rounded-md border border-zinc-200 p-2">
              <span className="h-3 w-3 rounded-full bg-brand-200" />
              <span className="h-1.5 flex-1 rounded bg-zinc-200" />
            </div>
            <div className="flex items-center gap-2 rounded-md border border-zinc-200 p-2">
              <span className="h-3 w-3 rounded-full bg-zinc-300" />
              <span className="h-1.5 flex-1 rounded bg-zinc-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
