import { createHmac, timingSafeEqual } from "node:crypto";

function getSecret(): string {
  return (
    process.env.CALENDAR_SECRET ??
    process.env.UNSUBSCRIBE_SECRET ??
    // Dev fallback so feeds work without explicit setup. Set CALENDAR_SECRET
    // in production or tokens become forgeable.
    "dev-only-calendar-secret-replace-me"
  );
}

function hmacHex(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function makeCalendarToken(cohortId: string, userId: string): string {
  const sig = hmacHex(`cohort:${cohortId}:${userId}`).slice(0, 32);
  return `${userId}.${sig}`;
}

export function verifyCalendarToken(
  cohortId: string,
  token: string,
): { userId: string } | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [userId, sig] = parts;
  if (!userId || !sig) return null;
  const expected = hmacHex(`cohort:${cohortId}:${userId}`).slice(0, 32);
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return { userId };
}
