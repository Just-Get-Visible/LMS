import { cn } from "@/lib/utils";

type Platform = "web" | "mobile";

export interface AppItem {
  name: string;
  description: string;
  platform: Platform;
  url?: string;
  imageSrc?: string;
  accentClassName?: string;
  builtIn?: string;
}

interface AppCarouselProps {
  items: AppItem[];
}

export function AppCarousel({ items }: AppCarouselProps) {
  return (
    <div
      className="-mx-6 mt-14 flex gap-5 overflow-x-auto px-6 pb-4 snap-x snap-mandatory [-ms-overflow-style:none] [-webkit-mask-image:linear-gradient(to_right,transparent_0,black_64px,black_calc(100%-64px),transparent_100%)] [mask-image:linear-gradient(to_right,transparent_0,black_64px,black_calc(100%-64px),transparent_100%)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="region"
      aria-label="Apps built with this course's method"
      tabIndex={0}
    >
      {items.map((item) => (
        <AppCard key={item.name} item={item} />
      ))}
    </div>
  );
}

function AppCard({ item }: { item: AppItem }) {
  const body = (
    <div className="group flex w-[280px] shrink-0 snap-start flex-col sm:w-[320px] md:w-[340px]">
      <div className="relative grid h-[280px] place-items-center overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-zinc-300 group-hover:shadow-lg">
        {item.platform === "web" ? (
          <WebFrame item={item} />
        ) : (
          <PhoneFrame item={item} />
        )}
        {item.builtIn && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-900 shadow-sm backdrop-blur">
            <span
              className="h-1.5 w-1.5 rounded-full bg-accent-400"
              aria-hidden
            />
            Built in {item.builtIn}
          </span>
        )}
      </div>
      <div className="mt-5">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold tracking-tight text-brand-900">
            {item.name}
          </h3>
          <Badge platform={item.platform} />
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
          {item.description}
        </p>
        {item.url && (
          <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 underline-offset-4 group-hover:underline">
            View live
            <span
              aria-hidden
              className="transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </span>
        )}
      </div>
    </div>
  );

  if (item.url) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        {body}
      </a>
    );
  }
  return body;
}

function Badge({ platform }: { platform: Platform }) {
  const isWeb = platform === "web";
  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        isWeb
          ? "bg-brand-50 text-brand-700"
          : "bg-accent-400 text-brand-900",
      )}
    >
      {isWeb ? "Web" : "Mobile"}
    </span>
  );
}

function WebFrame({ item }: { item: AppItem }) {
  return (
    <div className="w-full overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center gap-1.5 border-b border-zinc-200 bg-zinc-50 px-3 py-1.5">
        <span className="h-2 w-2 rounded-full bg-zinc-300" />
        <span className="h-2 w-2 rounded-full bg-zinc-300" />
        <span className="h-2 w-2 rounded-full bg-zinc-300" />
      </div>
      <div className="aspect-[16/10]">
        <Screen item={item} />
      </div>
    </div>
  );
}

function PhoneFrame({ item }: { item: AppItem }) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border-[5px] border-zinc-900 bg-zinc-900 shadow-md">
      <div className="aspect-[9/18] w-[120px] bg-white">
        <Screen item={item} />
      </div>
    </div>
  );
}

function Screen({ item }: { item: AppItem }) {
  if (item.imageSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.imageSrc}
        alt={item.name}
        className="h-full w-full object-cover"
      />
    );
  }
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-gradient-to-br p-3 text-center",
        item.accentClassName ?? "from-brand-100 to-brand-50",
      )}
    >
      <span className="text-sm font-extrabold leading-tight tracking-tight text-brand-700">
        {item.name}
      </span>
    </div>
  );
}
