import { Resend } from "resend";

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export type EmailResult = { ok: true } | { ok: false; error: string };

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!resendClient) resendClient = new Resend(key);
  return resendClient;
}

function resolveFrom(): string {
  return process.env.EMAIL_FROM ?? "LMS <onboarding@resend.dev>";
}

export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  const client = getResend();
  const from = resolveFrom();

  if (!client) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[email] dev mode (no RESEND_API_KEY) — would send:", {
        from,
        to: message.to,
        subject: message.subject,
      });
    }
    // In dev / when no key configured, treat as a no-op success so the
    // calling action's main flow doesn't fail on missing email config.
    return { ok: true };
  }

  try {
    const { error } = await client.emails.send({
      from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
    if (error) {
      const msg =
        typeof error === "object" && error && "message" in error
          ? String((error as { message: unknown }).message)
          : "Email send failed.";
      return { ok: false, error: msg };
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Email send threw.",
    };
  }
}

export function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}
