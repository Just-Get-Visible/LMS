"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import type { LandingPageData } from "@/components/courses/course-landing-page";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  updateLandingPageAction,
  type LandingPageActionState,
} from "@/lib/actions/landing-page";

const initialState: LandingPageActionState = { status: "idle" };

interface Props {
  courseId: string;
  courseSlug: string;
  initial: LandingPageData | null;
}

type EditorState = {
  published: boolean;
  heroTagline: string;
  heroCtaLabel: string;
  problemStats: { stat: string; label: string }[];
  whatYouGet: string[];
  bonusTitle: string;
  bonusValueDisplay: string;
  bonusDescription: string;
  instructorCredibility: string[];
  testimonials: {
    quote: string;
    name: string;
    role: string;
    avatarUrl: string;
  }[];
  faqs: { q: string; a: string }[];
};

function fromInitial(initial: LandingPageData | null): EditorState {
  return {
    published: initial?.published ?? false,
    heroTagline: initial?.hero?.tagline ?? "",
    heroCtaLabel: initial?.hero?.ctaLabel ?? "",
    problemStats: initial?.problemStats ?? [],
    whatYouGet: initial?.whatYouGet ?? [],
    bonusTitle: initial?.bonus?.title ?? "",
    bonusValueDisplay: initial?.bonus?.valueDisplay ?? "",
    bonusDescription: initial?.bonus?.description ?? "",
    instructorCredibility: initial?.instructorCredibility ?? [],
    testimonials: (initial?.testimonials ?? []).map((t) => ({
      quote: t.quote,
      name: t.name,
      role: t.role ?? "",
      avatarUrl: t.avatarUrl ?? "",
    })),
    faqs: initial?.faqs ?? [],
  };
}

function toPayload(s: EditorState): LandingPageData {
  return {
    published: s.published,
    hero: { tagline: s.heroTagline, ctaLabel: s.heroCtaLabel },
    problemStats: s.problemStats,
    whatYouGet: s.whatYouGet,
    bonus: {
      title: s.bonusTitle,
      valueDisplay: s.bonusValueDisplay,
      description: s.bonusDescription,
    },
    instructorCredibility: s.instructorCredibility,
    testimonials: s.testimonials,
    faqs: s.faqs,
  };
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save landing page"}
    </Button>
  );
}

export function LandingPageEditor({ courseId, courseSlug, initial }: Props) {
  const [state, formAction] = useActionState(
    updateLandingPageAction.bind(null, courseId),
    initialState,
  );
  const [data, setData] = useState<EditorState>(() => fromInitial(initial));

  function update<K extends keyof EditorState>(key: K, value: EditorState[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="payload" value={JSON.stringify(toPayload(data))} />

      {state.status === "error" && (
        <Alert variant="error">{state.message}</Alert>
      )}
      {state.status === "success" && (
        <Alert variant="success">{state.message}</Alert>
      )}

      {/* Publish + preview */}
      <Section
        title="Status"
        description="When published, the launch page replaces the catalog view at /courses/{slug} and (if HOMEPAGE_COURSE_SLUG points here) the homepage too."
      >
        <label className="flex items-center gap-3 rounded-md border border-black/10 p-3 text-sm dark:border-white/10">
          <input
            type="checkbox"
            checked={data.published}
            onChange={(e) => update("published", e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
          />
          <span>
            <strong>Published</strong> — render the launch landing page
          </span>
        </label>
        <Link
          href={`/courses/${courseSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm font-medium text-brand-600 hover:underline dark:text-brand-300"
        >
          Preview public page →
        </Link>
      </Section>

      {/* Hero */}
      <Section title="Hero" description="Top of the page. Title + subtitle come from the course itself.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="hero-tagline" label="Tagline (small text above title)">
            <Input
              id="hero-tagline"
              value={data.heroTagline}
              onChange={(e) => update("heroTagline", e.target.value)}
              placeholder="Creator to CEO"
            />
          </Field>
          <Field id="hero-cta" label="Primary CTA label">
            <Input
              id="hero-cta"
              value={data.heroCtaLabel}
              onChange={(e) => update("heroCtaLabel", e.target.value)}
              placeholder="Secure your spot"
            />
          </Field>
        </div>
      </Section>

      {/* Problem stats */}
      <Section
        title="Problem stats"
        description="Up to three big numbers. Renders as a 3-column row."
      >
        <ListEditor
          items={data.problemStats}
          onChange={(next) => update("problemStats", next)}
          empty={() => ({ stat: "", label: "" })}
          render={(item, onChange) => (
            <div className="grid gap-2 sm:grid-cols-[1fr_3fr]">
              <Input
                value={item.stat}
                onChange={(e) => onChange({ ...item, stat: e.target.value })}
                placeholder="72%"
              />
              <Input
                value={item.label}
                onChange={(e) => onChange({ ...item, label: e.target.value })}
                placeholder="of creators earn less than £50K/year"
              />
            </div>
          )}
          addLabel="Add stat"
        />
      </Section>

      {/* What you get */}
      <Section
        title="What's included"
        description="Bulleted checklist. One bullet per line."
      >
        <ListEditor
          items={data.whatYouGet}
          onChange={(next) => update("whatYouGet", next)}
          empty={() => ""}
          render={(item, onChange) => (
            <Input
              value={item}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Lifetime access to all lesson recordings"
            />
          )}
          addLabel="Add bullet"
        />
      </Section>

      {/* Bonus */}
      <Section title="Bonus" description="Optional highlight panel below the includes list.">
        <Field id="bonus-title" label="Title">
          <Input
            id="bonus-title"
            value={data.bonusTitle}
            onChange={(e) => update("bonusTitle", e.target.value)}
            placeholder="Early-bird live Q&A call"
          />
        </Field>
        <Field id="bonus-value" label="Value display (e.g. 'Worth £240')">
          <Input
            id="bonus-value"
            value={data.bonusValueDisplay}
            onChange={(e) => update("bonusValueDisplay", e.target.value)}
            placeholder="Worth £240"
          />
        </Field>
        <Field id="bonus-desc" label="Description">
          <Textarea
            id="bonus-desc"
            rows={3}
            value={data.bonusDescription}
            onChange={(e) => update("bonusDescription", e.target.value)}
          />
        </Field>
      </Section>

      {/* Instructor credibility */}
      <Section
        title="Instructor credibility"
        description="Short tags shown next to instructor bio (e.g. '20M+ streams')."
      >
        <ListEditor
          items={data.instructorCredibility}
          onChange={(next) => update("instructorCredibility", next)}
          empty={() => ""}
          render={(item, onChange) => (
            <Input
              value={item}
              onChange={(e) => onChange(e.target.value)}
              placeholder="20M+ streams"
            />
          )}
          addLabel="Add credibility point"
        />
      </Section>

      {/* Testimonials */}
      <Section title="Testimonials" description="Student quotes. Renders as 2-column grid.">
        <ListEditor
          items={data.testimonials}
          onChange={(next) => update("testimonials", next)}
          empty={() => ({ quote: "", name: "", role: "", avatarUrl: "" })}
          render={(item, onChange) => (
            <div className="space-y-2">
              <Textarea
                rows={2}
                value={item.quote}
                onChange={(e) => onChange({ ...item, quote: e.target.value })}
                placeholder="Quote (without surrounding quotes)"
              />
              <div className="grid gap-2 sm:grid-cols-3">
                <Input
                  value={item.name}
                  onChange={(e) => onChange({ ...item, name: e.target.value })}
                  placeholder="Alex R."
                />
                <Input
                  value={item.role}
                  onChange={(e) => onChange({ ...item, role: e.target.value })}
                  placeholder="Creator, 80K subs"
                />
                <Input
                  value={item.avatarUrl}
                  onChange={(e) =>
                    onChange({ ...item, avatarUrl: e.target.value })
                  }
                  placeholder="Avatar URL (optional)"
                />
              </div>
            </div>
          )}
          addLabel="Add testimonial"
        />
      </Section>

      {/* FAQs */}
      <Section title="FAQs" description="Question + answer pairs. Rendered as accordions.">
        <ListEditor
          items={data.faqs}
          onChange={(next) => update("faqs", next)}
          empty={() => ({ q: "", a: "" })}
          render={(item, onChange) => (
            <div className="space-y-2">
              <Input
                value={item.q}
                onChange={(e) => onChange({ ...item, q: e.target.value })}
                placeholder="Question"
              />
              <Textarea
                rows={3}
                value={item.a}
                onChange={(e) => onChange({ ...item, a: e.target.value })}
                placeholder="Answer"
              />
            </div>
          )}
          addLabel="Add FAQ"
        />
      </Section>

      <div className="flex justify-end">
        <SaveButton />
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
      <div>
        <h3 className="font-semibold tracking-tight">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

interface ListEditorProps<T> {
  items: T[];
  onChange: (next: T[]) => void;
  empty: () => T;
  render: (item: T, onChange: (next: T) => void) => React.ReactNode;
  addLabel: string;
}

function ListEditor<T>({
  items,
  onChange,
  empty,
  render,
  addLabel,
}: ListEditorProps<T>) {
  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="flex gap-3 rounded-md border border-black/10 bg-zinc-50/50 p-3 dark:border-white/10 dark:bg-zinc-900/30"
        >
          <div className="flex-1">
            {render(item, (next) => {
              const copy = [...items];
              copy[idx] = next;
              onChange(copy);
            })}
          </div>
          <button
            type="button"
            aria-label="Remove"
            onClick={() => onChange(items.filter((_, i) => i !== idx))}
            className="self-start text-zinc-400 hover:text-red-600"
          >
            ×
          </button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...items, empty()])}
      >
        + {addLabel}
      </Button>
    </div>
  );
}
