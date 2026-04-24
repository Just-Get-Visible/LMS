import type { Enums } from "@/types";

export function formatPrice(
  amount: number | null | undefined,
  currency: string | null | undefined,
  isFree: boolean | null | undefined,
): string {
  if (isFree || !amount || amount === 0) return "Free";
  const code = currency || "GBP";
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: code,
    }).format(amount);
  } catch {
    return `${code} ${amount.toFixed(2)}`;
  }
}

export function formatDeliveryType(
  type: Enums<"course_delivery_type">,
): string {
  switch (type) {
    case "self_paced":
      return "Self-paced";
    case "cohort":
      return "Cohort-based";
    case "hybrid":
      return "Hybrid";
  }
}

export function formatDuration(
  hours: number | null | undefined,
): string | null {
  if (!hours || hours <= 0) return null;
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  const rounded = Math.round(hours * 10) / 10;
  return `${rounded} ${rounded === 1 ? "hour" : "hours"}`;
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatFileSize(
  bytes: number | null | undefined,
): string {
  if (!bytes || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  const display =
    size < 10 && unitIndex > 0 ? size.toFixed(1) : Math.round(size).toString();
  return `${display} ${units[unitIndex]}`;
}
