// Minimal RFC-5545 builder. Enough for VEVENTs in a published feed; not a
// full ICS implementation.

export interface IcsEvent {
  uid: string;
  start: Date;
  end: Date;
  summary: string;
  description?: string;
  location?: string;
  url?: string;
  status?: "CONFIRMED" | "TENTATIVE" | "CANCELLED";
}

export interface IcsCalendar {
  prodId: string;
  name: string;
  events: IcsEvent[];
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function toUtcStamp(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

// RFC-5545 §3.1 — fold lines longer than 75 octets with CRLF + space.
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const out: string[] = [];
  let i = 0;
  while (i < line.length) {
    const chunk = line.slice(i, i + 75);
    out.push(i === 0 ? chunk : ` ${chunk}`);
    i += 75;
  }
  return out.join("\r\n");
}

function emit(lines: string[], key: string, value: string | undefined): void {
  if (value == null || value === "") return;
  lines.push(foldLine(`${key}:${escapeText(value)}`));
}

export function buildIcs(cal: IcsCalendar): string {
  const now = toUtcStamp(new Date());
  const lines: string[] = [];
  lines.push("BEGIN:VCALENDAR");
  lines.push("VERSION:2.0");
  lines.push(`PRODID:${cal.prodId}`);
  lines.push("CALSCALE:GREGORIAN");
  lines.push("METHOD:PUBLISH");
  lines.push(foldLine(`X-WR-CALNAME:${escapeText(cal.name)}`));

  for (const ev of cal.events) {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${ev.uid}`);
    lines.push(`DTSTAMP:${now}`);
    lines.push(`DTSTART:${toUtcStamp(ev.start)}`);
    lines.push(`DTEND:${toUtcStamp(ev.end)}`);
    emit(lines, "SUMMARY", ev.summary);
    emit(lines, "DESCRIPTION", ev.description);
    emit(lines, "LOCATION", ev.location);
    emit(lines, "URL", ev.url);
    if (ev.status) lines.push(`STATUS:${ev.status}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
