import { createHmac, timingSafeEqual } from "node:crypto";

import type { Json } from "@/types/database";

export const EMAIL_CATEGORIES = [
  "announcements",
  "submissions",
  "sessions",
  "reminders",
  "certificates",
  "discussions",
  "deadlines",
] as const;

export type EmailCategory = (typeof EMAIL_CATEGORIES)[number];

export const EMAIL_CATEGORY_LABELS: Record<EmailCategory, string> = {
  announcements: "Announcements",
  submissions: "Submission reviews",
  sessions: "New live sessions",
  reminders: "Session reminders (1 hour before)",
  certificates: "Certificates earned",
  discussions: "Discussion replies",
  deadlines: "Assignment deadline reminders (24 hours before)",
};

export type EmailPreferences = Record<EmailCategory, boolean>;

export const DEFAULT_EMAIL_PREFERENCES: EmailPreferences = {
  announcements: true,
  submissions: true,
  sessions: true,
  reminders: true,
  certificates: true,
  discussions: true,
  deadlines: true,
};

export function readEmailPreferences(metadata: Json | null): EmailPreferences {
  const prefs: EmailPreferences = { ...DEFAULT_EMAIL_PREFERENCES };
  if (
    metadata &&
    typeof metadata === "object" &&
    !Array.isArray(metadata) &&
    "email_prefs" in metadata
  ) {
    const raw = (metadata as Record<string, unknown>).email_prefs;
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const obj = raw as Record<string, unknown>;
      for (const cat of EMAIL_CATEGORIES) {
        if (typeof obj[cat] === "boolean") prefs[cat] = obj[cat] as boolean;
      }
    }
  }
  return prefs;
}

export function isOptedIn(
  metadata: Json | null,
  category: EmailCategory,
): boolean {
  return readEmailPreferences(metadata)[category];
}

export function mergeEmailPreferences(
  metadata: Json | null,
  next: Partial<EmailPreferences>,
): Json {
  const base =
    metadata && typeof metadata === "object" && !Array.isArray(metadata)
      ? (metadata as Record<string, unknown>)
      : {};
  const existing =
    base.email_prefs &&
    typeof base.email_prefs === "object" &&
    !Array.isArray(base.email_prefs)
      ? (base.email_prefs as Record<string, unknown>)
      : {};
  return {
    ...base,
    email_prefs: { ...existing, ...next },
  } as Json;
}

function getSecret(): string {
  return (
    process.env.UNSUBSCRIBE_SECRET ??
    // Dev fallback so links work without explicit setup. Set the env var
    // in production or tokens become forgeable.
    "dev-only-unsubscribe-secret-replace-me"
  );
}

function hmacHex(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function makeUnsubscribeToken(
  userId: string,
  category: EmailCategory,
): string {
  const sig = hmacHex(`${userId}:${category}`).slice(0, 24);
  return `${userId}.${category}.${sig}`;
}

export type UnsubscribeTokenPayload = {
  userId: string;
  category: EmailCategory;
};

export function verifyUnsubscribeToken(
  token: string,
): UnsubscribeTokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, categoryRaw, sig] = parts;
  if (!EMAIL_CATEGORIES.includes(categoryRaw as EmailCategory)) return null;
  const category = categoryRaw as EmailCategory;
  const expected = hmacHex(`${userId}:${category}`).slice(0, 24);
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return { userId, category };
}
