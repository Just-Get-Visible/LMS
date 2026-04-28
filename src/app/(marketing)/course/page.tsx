import type { Metadata } from "next";
import Link from "next/link";

import {
  AppCarousel,
  type AppItem,
} from "@/components/marketing/app-carousel";
import { CTAButton } from "@/components/marketing/cta-button";
import {
  ComparisonTable,
  type ComparisonRow,
} from "@/components/marketing/comparison-table";
import { FAQ, type FAQItem } from "@/components/marketing/faq";
import {
  FeatureMatrix,
  type MatrixRow,
} from "@/components/marketing/feature-matrix";
import { HeroVisual } from "@/components/marketing/hero-visual";
import { HowItWorksFlow } from "@/components/marketing/how-it-works-flow";
import {
  ModuleTimeline,
  type TimelineModule,
} from "@/components/marketing/module-timeline";
import { OutcomeMock } from "@/components/marketing/outcome-mock";
import { PricingCard } from "@/components/marketing/pricing-card";
import { SolutionRoadmap } from "@/components/marketing/solution-roadmap";
import { StickyMobileCTA } from "@/components/marketing/sticky-mobile-cta";
import {
  Section,
  SectionEyebrow,
  SectionHeading,
} from "@/components/marketing/section";

export const metadata: Metadata = {
  title: "Turn your idea into a real app",
  description:
    "Stop overthinking your idea. Stop waiting on developers. A step-by-step course that shows non-technical founders how to plan, build, and launch a real working app using AI.",
};

const PRIMARY_CTA_HREF = "/signup?plan=guided";

const learnItems: TimelineModule[] = [
  {
    phase: "plan",
    number: 1,
    title: "Turn your idea into a clear plan",
    description: "Understand exactly what to build and how to structure it.",
  },
  {
    phase: "plan",
    number: 2,
    title: "Organise your features",
    description: "Break your idea into simple, manageable steps.",
  },
  {
    phase: "plan",
    number: 3,
    title: "Set up the foundation",
    description:
      "Learn how your app stores and uses information — in plain English.",
  },
  {
    phase: "build",
    number: 4,
    title: "Connect everything together",
    description: "Make your app actually work as one system.",
  },
  {
    phase: "build",
    number: 5,
    title: "Build your app with AI",
    description:
      "Learn what to say and how to guide AI to build features for you.",
  },
  {
    phase: "build",
    number: 6,
    title: "Test and fix your app",
    description:
      "Make sure everything works before you put it in front of users.",
  },
  {
    phase: "launch",
    number: 7,
    title: "Launch your app online",
    description: "Get your app live using free tools.",
  },
  {
    phase: "launch",
    number: 8,
    title: "Turn it into a mobile app",
    description: "Make your app available on phones, not just the browser.",
  },
  {
    phase: "launch",
    number: 9,
    title: "Submit it to the App Store",
    description: "Take your idea all the way to a public launch.",
  },
];

const outcomes = [
  {
    icon: "🚀",
    title: "A real, working app",
    description: "Not a wireframe, not an idea — a live product you built.",
  },
  {
    icon: "🧠",
    title: "Knowledge of how apps work",
    description: "A clear mental model so future projects feel obvious.",
  },
  {
    icon: "🛠️",
    title: "Power to manage your own product",
    description: "Improve, fix, and extend your app without waiting on anyone.",
  },
  {
    icon: "⚡",
    title: "Confidence to build the next one",
    description: "The next idea takes a fraction of the time.",
  },
];

const smallOutcomeIcons = [
  // Knowledge — brain / lightbulb mind
  <svg
    key="knowledge"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M12 2a7 7 0 0 0-4 12.7c.7.6 1 1.5 1 2.3v1h6v-1c0-.8.3-1.7 1-2.3A7 7 0 0 0 12 2Z" />
  </svg>,
  // Power — wrench / spanner
  <svg
    key="power"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.7 6.3a4.5 4.5 0 0 0 5.95 5.95l-9.4 9.4a3 3 0 1 1-4.24-4.24l9.4-9.4a4.5 4.5 0 0 0-1.71-1.71Z" />
    <path d="m9 12 3 3" />
  </svg>,
  // Confidence — bolt / zap
  <svg
    key="confidence"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
  </svg>,
];

const steps = [
  {
    number: "01",
    title: "Plan",
    description:
      "We turn your idea into a clear, structured plan you can actually build from.",
  },
  {
    number: "02",
    title: "Build",
    description:
      "Use AI and simple tools to assemble your app — feature by feature, no coding background needed.",
  },
  {
    number: "03",
    title: "Launch",
    description:
      "Ship your app live on the web and prepare it for mobile and the App Store.",
  },
];

const courseDifference: ComparisonRow[] = [
  {
    label: "Approach",
    mostCourses: "Overcomplicate things",
    thisCourse: "Keep everything simple",
  },
  {
    label: "Focus",
    mostCourses: "Theory you'll never use",
    thisCourse: "Shipping a real product",
  },
  {
    label: "Speed",
    mostCourses: "Slow, manual process",
    thisCourse: "AI does the heavy lifting",
  },
  {
    label: "Guidance",
    mostCourses: "Leave you stuck halfway",
    thisCourse: "Step-by-step, all the way to launch",
  },
];

const audience = [
  "You have an idea for an app but don't know where to start",
  "You're not technical, but you want to build something real",
  "You're tired of relying on developers",
  "You want a practical way into building software",
];

const apps: AppItem[] = [
  {
    name: "Pulse",
    description: "Habit & streak tracker with daily AI nudges.",
    platform: "mobile",
    accentClassName: "from-rose-100 to-amber-100",
    builtIn: "2 weekends",
  },
  {
    name: "StockFlow",
    description: "Inventory dashboard for small independent shops.",
    platform: "web",
    accentClassName: "from-indigo-100 to-cyan-100",
    builtIn: "1 week",
  },
  {
    name: "Mindscape",
    description: "Daily 5-minute meditation routines, AI-personalised.",
    platform: "mobile",
    accentClassName: "from-violet-100 to-fuchsia-100",
    builtIn: "10 days",
  },
  {
    name: "Tasknest",
    description: "Lightweight team task manager for small teams.",
    platform: "web",
    accentClassName: "from-emerald-100 to-teal-100",
    builtIn: "1 week",
  },
  {
    name: "Bookbase",
    description: "Reading list, notes, and AI-summarised reviews.",
    platform: "mobile",
    accentClassName: "from-amber-100 to-orange-100",
    builtIn: "2 weekends",
  },
  {
    name: "InvoiceJet",
    description: "Freelance invoicing with one-click Stripe payouts.",
    platform: "web",
    accentClassName: "from-sky-100 to-blue-100",
    builtIn: "5 days",
  },
];

const tiers = [
  {
    name: "Self-Paced",
    description: "The full course at your own pace.",
    price: "£199",
    priceNote: "one-time",
    features: [
      "Full video curriculum (9 modules)",
      "Lifetime access to all updates",
      "AI prompt library",
      "Private community",
    ],
    ctaLabel: "Start self-paced",
    ctaHref: "/signup?plan=self-paced",
    popular: false,
  },
  {
    name: "Guided",
    description: "Live cohort with weekly group support.",
    price: "£499",
    priceNote: "one-time",
    features: [
      "Everything in Self-Paced",
      "Weekly live group calls",
      "Cohort accountability",
      "Direct feedback on your app",
      "Launch-week support",
    ],
    ctaLabel: "Join the next cohort",
    ctaHref: "/signup?plan=guided",
    popular: true,
    popularNote: "Most founders pick this",
  },
  {
    name: "Premium",
    description: "1:1 mentorship until your app is live.",
    price: "£1,499",
    priceNote: "one-time",
    features: [
      "Everything in Guided",
      "Weekly 1:1 calls with me",
      "Hands-on review of your code",
      "Priority response on your questions",
      "App Store submission support",
    ],
    ctaLabel: "Apply for premium",
    ctaHref: "/signup?plan=premium",
    popular: false,
  },
];

const faqs: FAQItem[] = [
  {
    question: "Do I need any coding background?",
    answer:
      "No. The whole course is built around having zero coding experience. You'll learn what to ask AI to build for you, plus a clear mental model of how apps actually work — so the next idea takes a fraction of the time.",
  },
  {
    question: "How much time will I need each week?",
    answer:
      "Most students put in 4–6 hours a week, plus one hour for the live group call (Guided and Premium). It's designed to fit alongside a full-time job or business.",
  },
  {
    question: "What if I don't have an idea yet?",
    answer:
      "Bring a rough one — even a vague pain you've felt or noticed. The first module is about turning a fuzzy idea into a clear plan, so you don't need a polished concept on day one.",
  },
  {
    question: "Can I really build something real without writing code myself?",
    answer:
      "Yes — that's the whole point. You'll guide AI through each part of your app, and the course teaches you what to ask for, how to test it, and how to fix problems when they show up.",
  },
  {
    question: "What kind of apps can I build?",
    answer:
      "The method works for the kinds of apps you can see in the carousel above — habit trackers, dashboards, simple SaaS, marketplaces, internal tools, content products. Anything that's mostly information-in / information-out. Not games or hardware projects.",
  },
  {
    question: "What if I don't finish in time?",
    answer:
      "Lifetime access to the curriculum is included on every tier, so you can keep going at your own pace. The cohort's live support runs for the duration of the cohort, but the materials stay yours forever.",
  },
  {
    question: "What's the difference between Guided and Premium?",
    answer:
      "Guided gives you the live cohort with weekly group calls. Premium adds 1:1 calls with me, hands-on review of your code, priority response on questions, and App Store submission support. If you're shipping something serious for your business and want personal feedback, pick Premium.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "Yes — full refund if you cancel at least 48 hours before your cohort starts. No questions asked.",
  },
];

const featureMatrix: MatrixRow[] = [
  { feature: "Full video curriculum (9 modules)", included: [true, true, true] },
  { feature: "Lifetime access to all updates", included: [true, true, true] },
  { feature: "AI prompt library", included: [true, true, true] },
  { feature: "Private community", included: [true, true, true] },
  { feature: "Weekly live group calls", included: [false, true, true] },
  { feature: "Cohort accountability", included: [false, true, true] },
  { feature: "Direct feedback on your app", included: [false, true, true] },
  { feature: "Launch-week support", included: [false, true, true] },
  { feature: "Weekly 1:1 calls with Nasir", included: [false, false, true] },
  { feature: "Hands-on review of your code", included: [false, false, true] },
  { feature: "Priority response on questions", included: [false, false, true] },
  { feature: "App Store submission support", included: [false, false, true] },
];

export default function CoursePage() {
  return (
    <main className="bg-white text-zinc-900 antialiased">
      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-brand-600 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:22px_22px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-brand-500/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-24 h-[460px] w-[460px] rounded-full bg-accent-400/15 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 pt-12 pb-20 sm:pt-16 sm:pb-24 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16 lg:pt-20 lg:pb-28">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85 backdrop-blur">
              <span className="relative grid h-2 w-2 place-items-center">
                <span className="absolute h-2 w-2 animate-ping rounded-full bg-accent-400/70" />
                <span className="relative h-2 w-2 rounded-full bg-accent-400" />
              </span>
              Next cohort starts soon — limited spots
            </span>
            <h1 className="mt-8 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[4.25rem]">
              Learn how to turn your idea into a real{" "}
              <span className="relative inline-block italic">
                app
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-1 -z-10 h-3 bg-accent-400"
                />
              </span>
              .
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80 lg:mx-0 mx-auto">
              Stop overthinking your idea. Stop waiting on developers. I&rsquo;ll
              show you how to plan, build, and launch your own working app — step
              by step — using simple tools and AI.
            </p>
            <ul className="mt-7 flex flex-wrap justify-center gap-2 lg:justify-start">
              {[
                "No coding experience",
                "No confusing jargon",
                "Idea to live product",
              ].map((item) => (
                <li
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-sm text-white/90 backdrop-blur"
                >
                  <svg
                    className="h-3.5 w-3.5 text-accent-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:gap-5 lg:items-start">
              <CTAButton href={PRIMARY_CTA_HREF} size="lg">
                Join the course →
              </CTAButton>
              <Link
                href="#curriculum"
                className="group inline-flex items-center gap-1.5 text-base font-semibold tracking-tight text-white/85 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                See what you&rsquo;ll learn
                <span
                  aria-hidden
                  className="transition-transform group-hover:translate-y-0.5"
                >
                  ↓
                </span>
              </Link>
            </div>
            <p className="mt-7 text-sm text-white/65 lg:text-left text-center">
              Built by a software engineer with{" "}
              <span className="font-semibold text-white/90">20+ years</span> and{" "}
              <span className="font-semibold text-white/90">
                100+ shipped projects
              </span>
              .
            </p>
          </div>
          <div className="relative">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* 2. Problem */}
      <Section className="border-t border-zinc-200 bg-zinc-50">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-20">
          <div>
            <SectionEyebrow>The problem</SectionEyebrow>
            <SectionHeading className="mt-6">
              You&rsquo;ve got an idea. But you&rsquo;re{" "}
              <span className="italic">stuck.</span>
            </SectionHeading>
            <p className="mt-6 text-base leading-relaxed text-zinc-600">
              Most people never build their idea — not because it&rsquo;s bad,
              but because the process feels overwhelming.
            </p>
            <blockquote className="mt-8 border-l-4 border-accent-400 bg-white/60 py-3 pl-5 pr-4 text-lg font-semibold leading-snug tracking-tight text-brand-900">
              Most ideas never get built.
              <span className="mt-1 block text-sm font-normal text-zinc-500">
                Not because they&rsquo;re bad — because the path forward is
                unclear.
              </span>
            </blockquote>
          </div>
          <ul className="relative grid gap-4 sm:grid-cols-2">
            {[
              {
                pain: "You don't know where to start",
                tilt: "-rotate-1",
              },
              {
                pain: "Developers are expensive or unreliable",
                tilt: "rotate-1",
              },
              {
                pain: "Tutorials are confusing and too technical",
                tilt: "rotate-1",
              },
              {
                pain: "You feel stuck before you even begin",
                tilt: "-rotate-1",
              },
            ].map(({ pain, tilt }) => (
              <li
                key={pain}
                className={`group relative ${tilt} rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-transform hover:rotate-0`}
              >
                <span
                  className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-500/80"
                  aria-hidden
                >
                  <span className="grid h-4 w-4 place-items-center rounded-full border border-rose-300 text-rose-400">
                    ×
                  </span>
                  Pain
                </span>
                <p className="mt-2 text-base font-medium leading-snug text-zinc-700 line-through decoration-rose-300/70 decoration-2 underline-offset-2">
                  {pain}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <p className="mx-auto mt-14 max-w-xl text-center text-sm font-medium text-zinc-500">
          Sound familiar?{" "}
          <span className="text-brand-700">There&rsquo;s a way through.</span>
        </p>
      </Section>

      {/* 3. Solution */}
      <Section className="border-t border-zinc-200">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
          <div>
            <SectionEyebrow>The solution</SectionEyebrow>
            <SectionHeading className="mt-6">
              A simple, step-by-step{" "}
              <span className="italic">system</span> to build your app.
            </SectionHeading>
            <p className="mt-7 text-base leading-relaxed text-zinc-600">
              A clear roadmap to follow — no guesswork, no overwhelm. I&rsquo;ll
              guide you through the exact process I use to build real systems
              and apps, simplified so anyone can follow.
            </p>
            <p className="mt-4 text-base leading-relaxed text-zinc-600">
              You don&rsquo;t need to become a developer. You just need the
              right structure — and I&rsquo;ll give you that.
            </p>
            <ul className="mt-7 flex flex-wrap gap-2">
              {[
                "Clear roadmap",
                "AI-assisted",
                "No code background",
                "Ship in weeks",
              ].map((tag) => (
                <li
                  key={tag}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-700"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-accent-400"
                    aria-hidden
                  />
                  {tag}
                </li>
              ))}
            </ul>
          </div>
          <SolutionRoadmap />
        </div>
      </Section>

      {/* 4. What you'll learn */}
      <Section id="curriculum" className="border-t border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-3xl text-center">
          <SectionEyebrow>What you&rsquo;ll learn</SectionEyebrow>
          <SectionHeading className="mt-6">
            Nine focused modules — from idea to{" "}
            <span className="italic">App Store.</span>
          </SectionHeading>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-600">
            Grouped into the same three phases you&rsquo;ll move through: Plan,
            Build, Launch.
          </p>
        </div>
        <ModuleTimeline modules={learnItems} />
      </Section>

      {/* 5. What you'll have by the end */}
      <Section className="border-t border-zinc-200">
        <div className="mx-auto max-w-3xl text-center">
          <SectionEyebrow>What you&rsquo;ll have by the end</SectionEyebrow>
          <SectionHeading className="mt-6">
            A real product — not just an{" "}
            <span className="italic">idea.</span>
          </SectionHeading>
        </div>
        <div className="mx-auto mt-14 grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-brand-50 via-white to-accent-50/40 p-8 sm:p-10">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(rgba(0,52,101,0.6)_1px,transparent_1px)] [background-size:18px_18px]"
            />
            <div className="relative grid gap-8 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <span className="inline-block rounded-md bg-brand-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-accent-400">
                  Your deliverable
                </span>
                <h3 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-brand-900 sm:text-4xl">
                  A real, working app.
                </h3>
                <p className="mt-3 text-base leading-relaxed text-zinc-600">
                  Not a wireframe, not an idea — a live product you built,
                  shipped, and can show anyone.
                </p>
                <ul className="mt-5 space-y-2 text-sm text-zinc-700">
                  {[
                    "Live on the web",
                    "Available on mobile",
                    "Ready for the App Store",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <span
                        className="grid h-4 w-4 place-items-center rounded-full bg-accent-400 text-brand-900"
                        aria-hidden
                      >
                        <svg
                          width="10"
                          height="10"
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
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <OutcomeMock />
            </div>
          </div>
          <div className="grid gap-4 content-start">
            {outcomes.slice(1).map((o, idx) => (
              <div
                key={o.title}
                className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-6 transition-colors hover:border-brand-600"
              >
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"
                  aria-hidden
                >
                  {smallOutcomeIcons[idx]}
                </span>
                <div className="min-w-0">
                  <h4 className="text-base font-bold tracking-tight text-brand-900">
                    {o.title}
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
                    {o.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 6. How it works */}
      <Section
        className="border-t border-zinc-200 bg-zinc-50"
        pattern="light"
      >
        <div className="mx-auto max-w-3xl text-center">
          <SectionEyebrow>How it works</SectionEyebrow>
          <SectionHeading className="mt-6">
            Three steps. One real{" "}
            <span className="italic">app.</span>
          </SectionHeading>
        </div>
        <HowItWorksFlow steps={steps} />
      </Section>

      {/* 7. Why this is different */}
      <Section className="border-t border-zinc-200">
        <div className="mx-auto max-w-3xl text-center">
          <SectionEyebrow>Why this is different</SectionEyebrow>
          <SectionHeading className="mt-6">
            Less theory. More{" "}
            <span className="italic">shipping.</span>
          </SectionHeading>
        </div>
        <ComparisonTable rows={courseDifference} />
      </Section>

      {/* 8. Who this is for */}
      <Section className="border-t border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-3xl text-center">
          <SectionEyebrow>Who this is for</SectionEyebrow>
          <SectionHeading className="mt-6">
            You, if any of these sound{" "}
            <span className="italic">familiar.</span>
          </SectionHeading>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-zinc-600">
            Tick the ones that sound like something you&rsquo;d say.
          </p>
        </div>
        <ol className="mx-auto mt-14 flex max-w-3xl flex-col gap-5">
          {audience.map((line, idx) => {
            const isLeft = idx % 2 === 0;
            const initial = String.fromCharCode(65 + idx);
            return (
              <li
                key={line}
                className={`flex items-end gap-3 sm:gap-4 ${
                  isLeft ? "" : "flex-row-reverse"
                }`}
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold shadow-sm ${
                    isLeft
                      ? "bg-brand-600 text-accent-400"
                      : "bg-accent-400 text-brand-900"
                  }`}
                  aria-hidden
                >
                  {initial}
                </span>
                <div
                  className={`relative max-w-[85%] rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm sm:max-w-[78%] ${
                    isLeft ? "rounded-bl-md" : "rounded-br-md"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`absolute bottom-0 ${
                      isLeft ? "-left-1.5" : "-right-1.5"
                    } h-3 w-3 rotate-45 border-zinc-200 bg-white ${
                      isLeft ? "border-b border-l" : "border-b border-r"
                    }`}
                  />
                  <p className="text-base leading-snug text-zinc-800">
                    <span className="text-zinc-300" aria-hidden>
                      &ldquo;
                    </span>
                    {line}
                    <span className="text-zinc-300" aria-hidden>
                      &rdquo;
                    </span>
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
        <div className="mx-auto mt-12 flex max-w-2xl flex-col items-center gap-5 rounded-2xl border-2 border-dashed border-brand-200 bg-white p-8 text-center sm:flex-row sm:gap-8 sm:text-left">
          <div className="flex-1">
            <p className="text-lg font-extrabold tracking-tight text-brand-900">
              Sound like you?
            </p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-600">
              Then you&rsquo;re exactly who I built this course for.
            </p>
          </div>
          <CTAButton href={PRIMARY_CTA_HREF} size="md">
            Join the next cohort →
          </CTAButton>
        </div>
      </Section>

      {/* 9. About */}
      <Section className="border-t border-zinc-200">
        <div className="mx-auto grid max-w-5xl gap-14 md:grid-cols-[auto_1fr] md:items-start md:gap-16">
          <div className="mx-auto md:mx-0">
            {/* TODO: replace placeholder with real portrait — swap the inner
                navy block for an <Image src="..." /> at the same dimensions. */}
            <div className="relative w-fit -rotate-3">
              <span
                aria-hidden
                className="absolute -top-3 left-1/2 z-10 h-5 w-20 -translate-x-1/2 rotate-2 rounded-sm bg-accent-400/80 shadow-sm"
              />
              <div className="rounded-md bg-white p-4 pb-12 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.25)] ring-1 ring-zinc-200">
                <div className="relative grid h-48 w-40 place-items-center overflow-hidden rounded-sm bg-gradient-to-br from-brand-600 to-brand-500 sm:h-56 sm:w-48">
                  <span
                    aria-hidden
                    className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:14px_14px]"
                  />
                  <span className="relative font-display text-7xl font-extrabold leading-none text-accent-400 sm:text-8xl">
                    N
                  </span>
                </div>
                <p className="mt-3 text-center font-display text-2xl italic leading-none text-brand-900">
                  — Nasir
                </p>
              </div>
            </div>
          </div>
          <div>
            <SectionEyebrow>About me</SectionEyebrow>
            <SectionHeading className="mt-4">
              20+ years building real{" "}
              <span className="italic">systems</span> for businesses.
            </SectionHeading>
            <p className="mt-5 text-base leading-relaxed text-zinc-600">
              I&rsquo;m a software engineer with over two decades of experience.
              I&rsquo;ve delivered 100+ projects and recently built 10+ apps
              using this exact process. I&rsquo;ve simplified everything into a
              step-by-step method so you can do the same — without the years of
              trial and error.
            </p>
            <p className="mt-5 border-l-4 border-accent-400 pl-5 text-lg font-semibold leading-snug tracking-tight text-brand-900">
              I&rsquo;ve already done the trial and error. You get the
              shortcut.
            </p>
            <dl className="mt-9 grid grid-cols-3 gap-6 border-t border-zinc-200 pt-7">
              {[
                { label: "Experience", value: "20+", suffix: "yrs" },
                { label: "Projects", value: "100+", suffix: "shipped" },
                { label: "Apps built", value: "10+", suffix: "with this method" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                    {stat.label}
                  </dt>
                  <dd className="mt-2 flex items-baseline gap-1.5">
                    <span className="font-display text-4xl font-extrabold leading-none tracking-tight text-brand-900 sm:text-5xl">
                      {stat.value}
                    </span>
                  </dd>
                  <span
                    aria-hidden
                    className="mt-2 block h-1 w-8 rounded-full bg-accent-400"
                  />
                  <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                    {stat.suffix}
                  </p>
                </div>
              ))}
            </dl>
            <div className="mt-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                Across industries
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {[
                  "Education",
                  "Retail",
                  "Cybersecurity",
                  "SaaS",
                  "Marketplaces",
                  "Fintech",
                ].map((industry) => (
                  <li
                    key={industry}
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-sm font-medium text-brand-800"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-brand-600"
                      aria-hidden
                    />
                    {industry}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-8 text-sm text-zinc-500">
              Most recent builds are below —{" "}
              <Link
                href="#built-with-method"
                className="font-semibold text-brand-700 underline-offset-4 hover:underline"
              >
                see them in action
              </Link>
              .
            </p>
          </div>
        </div>
      </Section>

      {/* 9b. Apps built with this method */}
      <Section
        id="built-with-method"
        className="border-t border-zinc-200 bg-zinc-50"
      >
        <div className="mx-auto max-w-3xl text-center">
          <SectionEyebrow>Built with this method</SectionEyebrow>
          <SectionHeading className="mt-6">
            Real apps. Real launches. Built using{" "}
            <span className="italic">AI.</span>
          </SectionHeading>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-600">
            A sample of the products I&rsquo;ve shipped using the same
            step-by-step process you&rsquo;ll learn in this course.
          </p>
        </div>
        <AppCarousel items={apps} />
        <p className="mt-6 text-center text-xs text-zinc-500">
          ← Drag, swipe, or use arrow keys to scroll →
        </p>
      </Section>

      {/* 10. Pricing */}
      <Section id="pricing" className="border-t border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-3xl text-center">
          <SectionEyebrow>Pricing</SectionEyebrow>
          <SectionHeading className="mt-6">
            Pick the level of{" "}
            <span className="italic">support</span> you want.
          </SectionHeading>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-zinc-600">
            One-time payment. No subscriptions. Lifetime access to the
            curriculum.
          </p>
        </div>
        <div className="mt-16 grid gap-6 lg:grid-cols-3 lg:items-start">
          {tiers.map((tier) => (
            <PricingCard key={tier.name} {...tier} />
          ))}
        </div>
        <div className="mt-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
              Compare what&rsquo;s included
            </p>
          </div>
          <FeatureMatrix
            tiers={tiers.map((t) => t.name)}
            rows={featureMatrix}
            popularIndex={1}
          />
        </div>
        <div className="mx-auto mt-12 flex max-w-3xl items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-6 sm:items-center">
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent-400 text-brand-900"
            aria-hidden
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-base font-bold tracking-tight text-brand-900">
              No-risk guarantee
            </p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-600">
              Full refund if you cancel at least 48 hours before your cohort
              starts — no questions asked.
            </p>
          </div>
        </div>
      </Section>

      {/* 10.5 FAQ */}
      <Section className="border-t border-zinc-200">
        <div className="mx-auto max-w-3xl text-center">
          <SectionEyebrow>FAQ</SectionEyebrow>
          <SectionHeading className="mt-6">
            The questions people ask{" "}
            <span className="italic">most.</span>
          </SectionHeading>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-600">
            Still got one that&rsquo;s not here?{" "}
            <Link
              href="mailto:hello@example.com"
              className="font-semibold text-brand-700 underline-offset-4 hover:underline"
            >
              Email me directly
            </Link>{" "}
            and I&rsquo;ll answer.
          </p>
        </div>
        <FAQ items={faqs} />
      </Section>

      {/* 11. Final CTA */}
      <Section
        className="border-t border-zinc-200 bg-brand-600 text-white"
        pattern="dark"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
            Your idea isn&rsquo;t the problem.
            <span className="block italic text-accent-400">
              The process is.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-white/80">
            Once you have the right process, everything becomes simple. Let me
            show you how to turn your idea into something real.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CTAButton href={PRIMARY_CTA_HREF} size="lg">
              Join the course now →
            </CTAButton>
            <Link
              href="#pricing"
              className="inline-flex h-14 items-center justify-center rounded-md border-2 border-white/30 bg-transparent px-8 text-base font-semibold tracking-tight text-white transition-colors hover:bg-white/10"
            >
              See pricing
            </Link>
          </div>
          <p className="mt-6 text-xs text-white/70">
            ⚡ Limited cohort spots — so I can support you properly.
          </p>
        </div>
      </Section>
      <StickyMobileCTA href={PRIMARY_CTA_HREF} label="Join the course" />
    </main>
  );
}
