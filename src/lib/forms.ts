export function nullableString(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

export function nullableNumber(v: FormDataEntryValue | null): number | null {
  if (typeof v !== "string" || v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function bool(v: FormDataEntryValue | null): boolean {
  return v === "on" || v === "true";
}

export function parseDateTimeLocal(
  v: FormDataEntryValue | null,
): string | null {
  if (typeof v !== "string" || v.trim() === "") return null;
  const date = new Date(v);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function toDateTimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function pickEnum<T extends string>(
  v: FormDataEntryValue | null,
  allowed: readonly T[],
  fallback: T,
): T {
  return allowed.includes(v as T) ? (v as T) : fallback;
}

export function pickEnumOrNull<T extends string>(
  v: FormDataEntryValue | null,
  allowed: readonly T[],
): T | null {
  return allowed.includes(v as T) ? (v as T) : null;
}

export function escapeIlikePattern(input: string): string {
  return input.replace(/[%_\\]/g, "\\$&");
}

export function safeSearchTerm(input: string): string {
  return input.replace(/[^a-zA-Z0-9@.\s_-]/g, "").trim();
}

export function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}
