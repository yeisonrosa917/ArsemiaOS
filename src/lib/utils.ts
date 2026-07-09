import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactCurrency(value: number) {
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  }
  return `$${value.toFixed(0)}`;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

/** A safe tel: href — strips everything except digits and a leading +. */
export function telHref(phone: string | undefined | null): string {
  return `tel:${(phone ?? "").replace(/[^0-9+]/g, "")}`;
}

/** A Google Maps search href for an address (and optional city). */
export function mapsHref(...parts: (string | undefined | null)[]): string {
  const q = parts.filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export function formatPercent(value: number, fractionDigits = 1) {
  return `${value.toFixed(fractionDigits)}%`;
}

export function initials(name: string) {
  const result = (name ?? "")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  // Never return a blank avatar — fall back to a neutral glyph.
  return result || "?";
}

/**
 * Locale-locked date/time formatters. Using `undefined` as the locale causes
 * SSR/client hydration mismatches (server picks en-US, client picks the user's
 * system locale). Always use these helpers for any date string rendered during
 * SSR — never call toLocaleDateString/toLocaleString/toLocaleTimeString with
 * `undefined` directly.
 */
const SSR_LOCALE = "en-US";

export function fmtDate(
  iso: string | Date,
  opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" },
): string {
  return new Date(iso).toLocaleDateString(SSR_LOCALE, opts);
}

export function fmtDateTime(
  iso: string | Date,
  opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
): string {
  return new Date(iso).toLocaleString(SSR_LOCALE, opts);
}

export function fmtTime(
  iso: string | Date,
  opts: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" },
): string {
  return new Date(iso).toLocaleTimeString(SSR_LOCALE, opts);
}

export function fmtWeekday(
  iso: string | Date,
  variant: "short" | "long" = "short",
): string {
  return new Date(iso).toLocaleDateString(SSR_LOCALE, { weekday: variant });
}
