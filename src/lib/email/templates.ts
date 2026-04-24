function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c]!,
  );
}

function nl2br(s: string): string {
  return escapeHtml(s).replace(/\n/g, "<br />");
}

function shell({
  preheader,
  body,
  unsubscribeUrl,
  categoryLabel,
}: {
  preheader: string;
  body: string;
  unsubscribeUrl?: string;
  categoryLabel?: string;
}): string {
  const footer = unsubscribeUrl
    ? `<tr><td style="padding:16px 32px 24px;font-size:12px;color:#71717a;text-align:center;">
        You're receiving this because you opted in to <strong>${escapeHtml(categoryLabel ?? "updates")}</strong>.
        <br /><a href="${unsubscribeUrl}" style="color:#71717a;text-decoration:underline;">Unsubscribe from these emails</a>
      </td></tr>`
    : "";
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(
    preheader,
  )}</title></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#18181b;">
  <span style="display:none;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escapeHtml(
    preheader,
  )}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;">
        <tr><td style="padding:32px;">${body}</td></tr>
        ${footer}
      </table>
    </td></tr>
  </table>
</body></html>`;
}

const buttonStyle =
  "display:inline-block;padding:10px 16px;background:#18181b;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;";

export interface AnnouncementEmailInput {
  recipientName: string;
  announcementTitle: string;
  announcementBody: string;
  link: string;
  unsubscribeUrl?: string;
}

export function announcementEmail(input: AnnouncementEmailInput) {
  const subject = `New announcement: ${input.announcementTitle}`;
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;">${escapeHtml(input.announcementTitle)}</h1>
    <p style="margin:0 0 16px;color:#52525b;font-size:14px;">Hi ${escapeHtml(input.recipientName)},</p>
    <div style="margin:0 0 24px;padding:16px;background:#fafafa;border-radius:6px;font-size:14px;line-height:1.6;color:#18181b;">${nl2br(input.announcementBody)}</div>
    <a href="${input.link}" style="${buttonStyle}">Read on the platform</a>
  `;
  const text = `${input.announcementTitle}\n\nHi ${input.recipientName},\n\n${input.announcementBody}\n\nOpen: ${input.link}${
    input.unsubscribeUrl ? `\n\nUnsubscribe: ${input.unsubscribeUrl}` : ""
  }`;
  return {
    subject,
    html: shell({
      preheader: input.announcementTitle,
      body,
      unsubscribeUrl: input.unsubscribeUrl,
      categoryLabel: "announcements",
    }),
    text,
  };
}

export interface SubmissionReviewedEmailInput {
  recipientName: string;
  assignmentTitle: string;
  status: string;
  score: number | null;
  maxScore: number | null;
  link: string;
  unsubscribeUrl?: string;
}

export function submissionReviewedEmail(input: SubmissionReviewedEmailInput) {
  const subject = `Your submission was reviewed: ${input.assignmentTitle}`;
  const scoreLine =
    input.score != null
      ? `<p style="margin:0 0 16px;font-size:14px;"><strong>Score:</strong> ${input.score}${input.maxScore != null ? ` / ${input.maxScore}` : ""}</p>`
      : "";
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;">Submission reviewed</h1>
    <p style="margin:0 0 8px;color:#52525b;font-size:14px;">Hi ${escapeHtml(input.recipientName)},</p>
    <p style="margin:0 0 16px;font-size:14px;">Your submission for <strong>${escapeHtml(input.assignmentTitle)}</strong> has been reviewed.</p>
    <p style="margin:0 0 16px;font-size:14px;"><strong>Status:</strong> ${escapeHtml(input.status)}</p>
    ${scoreLine}
    <a href="${input.link}" style="${buttonStyle}">View feedback</a>
  `;
  const text = `${subject}\n\nStatus: ${input.status}${input.score != null ? `\nScore: ${input.score}${input.maxScore != null ? ` / ${input.maxScore}` : ""}` : ""}\n\nView: ${input.link}${
    input.unsubscribeUrl ? `\n\nUnsubscribe: ${input.unsubscribeUrl}` : ""
  }`;
  return {
    subject,
    html: shell({
      preheader: subject,
      body,
      unsubscribeUrl: input.unsubscribeUrl,
      categoryLabel: "submission reviews",
    }),
    text,
  };
}

export interface SessionScheduledEmailInput {
  recipientName: string;
  sessionTitle: string;
  whenDisplay: string;
  link: string;
  unsubscribeUrl?: string;
}

export function sessionScheduledEmail(input: SessionScheduledEmailInput) {
  const subject = `New session scheduled: ${input.sessionTitle}`;
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;">${escapeHtml(input.sessionTitle)}</h1>
    <p style="margin:0 0 16px;color:#52525b;font-size:14px;">Hi ${escapeHtml(input.recipientName)},</p>
    <p style="margin:0 0 16px;font-size:14px;">A new live session has been scheduled.</p>
    <p style="margin:0 0 24px;font-size:14px;"><strong>${escapeHtml(input.whenDisplay)}</strong></p>
    <a href="${input.link}" style="${buttonStyle}">View session</a>
  `;
  const text = `${subject}\n\nWhen: ${input.whenDisplay}\n\nView: ${input.link}${
    input.unsubscribeUrl ? `\n\nUnsubscribe: ${input.unsubscribeUrl}` : ""
  }`;
  return {
    subject,
    html: shell({
      preheader: subject,
      body,
      unsubscribeUrl: input.unsubscribeUrl,
      categoryLabel: "new live sessions",
    }),
    text,
  };
}

export interface DiscussionReplyEmailInput {
  recipientName: string;
  threadTitle: string;
  authorName: string;
  excerpt: string;
  link: string;
  unsubscribeUrl?: string;
}

export function discussionReplyEmail(input: DiscussionReplyEmailInput) {
  const subject = `New reply: ${input.threadTitle}`;
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;">${escapeHtml(input.threadTitle)}</h1>
    <p style="margin:0 0 16px;color:#52525b;font-size:14px;">Hi ${escapeHtml(input.recipientName)},</p>
    <p style="margin:0 0 16px;font-size:14px;"><strong>${escapeHtml(input.authorName)}</strong> replied:</p>
    <div style="margin:0 0 24px;padding:16px;background:#fafafa;border-radius:6px;font-size:14px;line-height:1.6;color:#18181b;">${nl2br(input.excerpt)}</div>
    <a href="${input.link}" style="${buttonStyle}">View thread</a>
  `;
  const text = `${subject}\n\n${input.authorName} replied:\n\n${input.excerpt}\n\nView: ${input.link}${
    input.unsubscribeUrl ? `\n\nUnsubscribe: ${input.unsubscribeUrl}` : ""
  }`;
  return {
    subject,
    html: shell({
      preheader: subject,
      body,
      unsubscribeUrl: input.unsubscribeUrl,
      categoryLabel: "discussion replies",
    }),
    text,
  };
}

export interface CourseEnrolmentEmailInput {
  recipientName: string;
  courseTitle: string;
  startLink: string;
}

export function courseEnrolmentEmail(input: CourseEnrolmentEmailInput) {
  const subject = `Welcome to ${input.courseTitle}`;
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;">You&rsquo;re enrolled!</h1>
    <p style="margin:0 0 16px;color:#52525b;font-size:14px;">Hi ${escapeHtml(input.recipientName)},</p>
    <p style="margin:0 0 24px;font-size:14px;">You now have access to <strong>${escapeHtml(input.courseTitle)}</strong>. Jump in whenever you&rsquo;re ready.</p>
    <a href="${input.startLink}" style="${buttonStyle}">Start learning</a>
  `;
  const text = `${subject}\n\nYou now have access to ${input.courseTitle}.\n\nStart: ${input.startLink}`;
  return {
    subject,
    html: shell({ preheader: subject, body }),
    text,
  };
}

export interface CohortCompletedEmailInput {
  recipientName: string;
  cohortName: string;
  cohortLink: string;
}

export function cohortCompletedEmail(input: CohortCompletedEmailInput) {
  const subject = `Cohort complete: ${input.cohortName}`;
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;">That&rsquo;s a wrap!</h1>
    <p style="margin:0 0 16px;color:#52525b;font-size:14px;">Hi ${escapeHtml(input.recipientName)},</p>
    <p style="margin:0 0 24px;font-size:14px;"><strong>${escapeHtml(input.cohortName)}</strong> has officially ended. Thanks for being part of it.</p>
    <a href="${input.cohortLink}" style="${buttonStyle}">Open cohort</a>
  `;
  const text = `${subject}\n\n${input.cohortName} has officially ended. Thanks for being part of it.\n\nOpen: ${input.cohortLink}`;
  return {
    subject,
    html: shell({ preheader: subject, body }),
    text,
  };
}

export interface CohortEnrolmentEmailInput {
  recipientName: string;
  cohortName: string;
  startsAtDisplay: string | null;
  cohortLink: string;
  calendarFeedUrl: string;
}

export function cohortEnrolmentEmail(input: CohortEnrolmentEmailInput) {
  const subject = `Welcome to ${input.cohortName}`;
  const startsLine = input.startsAtDisplay
    ? `<p style="margin:0 0 16px;font-size:14px;"><strong>Starts ${escapeHtml(input.startsAtDisplay)}</strong></p>`
    : "";
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;">You&rsquo;re in!</h1>
    <p style="margin:0 0 16px;color:#52525b;font-size:14px;">Hi ${escapeHtml(input.recipientName)},</p>
    <p style="margin:0 0 16px;font-size:14px;">You&rsquo;ve been enrolled in <strong>${escapeHtml(input.cohortName)}</strong>.</p>
    ${startsLine}
    <p style="margin:0 0 24px;font-size:14px;">Add the cohort schedule to your calendar so you don&rsquo;t miss a session:<br /><a href="${input.calendarFeedUrl}" style="color:#18181b;font-family:monospace;font-size:12px;word-break:break-all;">${escapeHtml(input.calendarFeedUrl)}</a></p>
    <a href="${input.cohortLink}" style="${buttonStyle}">Open cohort</a>
  `;
  const text = `${subject}\n\nYou've been enrolled in ${input.cohortName}.${
    input.startsAtDisplay ? `\n\nStarts ${input.startsAtDisplay}` : ""
  }\n\nCalendar feed: ${input.calendarFeedUrl}\n\nOpen: ${input.cohortLink}`;
  return {
    subject,
    html: shell({ preheader: subject, body }),
    text,
  };
}

export interface AssignmentDueEmailInput {
  recipientName: string;
  assignmentTitle: string;
  dueDisplay: string;
  link: string;
  unsubscribeUrl?: string;
}

export function assignmentDueEmail(input: AssignmentDueEmailInput) {
  const subject = `Due tomorrow: ${input.assignmentTitle}`;
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;">${escapeHtml(input.assignmentTitle)}</h1>
    <p style="margin:0 0 16px;color:#52525b;font-size:14px;">Hi ${escapeHtml(input.recipientName)},</p>
    <p style="margin:0 0 16px;font-size:14px;">This is a reminder that your assignment is due in about a day.</p>
    <p style="margin:0 0 24px;font-size:14px;"><strong>Due ${escapeHtml(input.dueDisplay)}</strong></p>
    <a href="${input.link}" style="${buttonStyle}">Open assignment</a>
  `;
  const text = `${subject}\n\nDue ${input.dueDisplay}\n\nOpen: ${input.link}${
    input.unsubscribeUrl ? `\n\nUnsubscribe: ${input.unsubscribeUrl}` : ""
  }`;
  return {
    subject,
    html: shell({
      preheader: subject,
      body,
      unsubscribeUrl: input.unsubscribeUrl,
      categoryLabel: "deadline reminders",
    }),
    text,
  };
}

export interface CertificateIssuedEmailInput {
  recipientName: string;
  courseTitle: string;
  certificateNumber: string;
  link: string;
  unsubscribeUrl?: string;
}

export function certificateIssuedEmail(input: CertificateIssuedEmailInput) {
  const subject = `Certificate earned: ${input.courseTitle}`;
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;">Congratulations!</h1>
    <p style="margin:0 0 16px;color:#52525b;font-size:14px;">Hi ${escapeHtml(input.recipientName)},</p>
    <p style="margin:0 0 16px;font-size:14px;">You&rsquo;ve completed <strong>${escapeHtml(input.courseTitle)}</strong> and earned a certificate.</p>
    <p style="margin:0 0 24px;font-family:monospace;font-size:13px;color:#52525b;">${escapeHtml(input.certificateNumber)}</p>
    <a href="${input.link}" style="${buttonStyle}">View &amp; download</a>
  `;
  const text = `${subject}\n\nCertificate №: ${input.certificateNumber}\n\nView: ${input.link}${
    input.unsubscribeUrl ? `\n\nUnsubscribe: ${input.unsubscribeUrl}` : ""
  }`;
  return {
    subject,
    html: shell({
      preheader: subject,
      body,
      unsubscribeUrl: input.unsubscribeUrl,
      categoryLabel: "certificates earned",
    }),
    text,
  };
}

export interface SessionReminderEmailInput {
  recipientName: string;
  sessionTitle: string;
  whenDisplay: string;
  link: string;
  joinUrl: string | null;
  unsubscribeUrl?: string;
}

export function sessionReminderEmail(input: SessionReminderEmailInput) {
  const subject = `Starting soon: ${input.sessionTitle}`;
  const joinButton = input.joinUrl
    ? `<a href="${input.joinUrl}" style="${buttonStyle}">Join now</a>`
    : `<a href="${input.link}" style="${buttonStyle}">View session</a>`;
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;">${escapeHtml(input.sessionTitle)}</h1>
    <p style="margin:0 0 16px;color:#52525b;font-size:14px;">Hi ${escapeHtml(input.recipientName)},</p>
    <p style="margin:0 0 16px;font-size:14px;">Your session starts in about an hour.</p>
    <p style="margin:0 0 24px;font-size:14px;"><strong>${escapeHtml(input.whenDisplay)}</strong></p>
    ${joinButton}
  `;
  const text = `${subject}\n\n${input.whenDisplay}\n\n${input.joinUrl ? `Join: ${input.joinUrl}` : `View: ${input.link}`}${
    input.unsubscribeUrl ? `\n\nUnsubscribe: ${input.unsubscribeUrl}` : ""
  }`;
  return {
    subject,
    html: shell({
      preheader: subject,
      body,
      unsubscribeUrl: input.unsubscribeUrl,
      categoryLabel: "session reminders",
    }),
    text,
  };
}
