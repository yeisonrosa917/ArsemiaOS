/**
 * Deterministic, SSR-safe date helpers.
 *
 * React 19 treats hydration mismatches as hard runtime crashes. Any date
 * formatted with the browser's default locale (`toLocaleString(undefined, …)`)
 * renders differently on the server (Node → "en-US") and the client (system
 * locale → "es-ES" etc.), which crashes the page. Every date that ends up in
 * SSR-rendered markup MUST go through these helpers.
 *
 * Rules enforced here:
 *  - fixed locale: always "en-US"
 *  - fixed timezone for date-only formatting: "UTC" (so "2026-06-21" never
 *    drifts a day across timezones)
 *  - never call `toISOString()` on an unvalidated Date (throws RangeError)
 *  - invalid input renders a safe fallback ("—") instead of crashing
 */

export const APP_LOCALE = "en-US";
export const APP_TIMEZONE = "America/New_York"; // Arsemia LLC — Miami, FL
export const INVALID_DATE_FALLBACK = "—";

export type DateInput = Date | string | number | null | undefined;

/** True only for a real, finite Date. */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

/** Parse anything into a valid Date, or null if it can't be parsed. */
export function parseDateSafe(value: DateInput): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return isValidDate(value) ? value : null;
  const d = new Date(value);
  return isValidDate(d) ? d : null;
}

/**
 * Safe "YYYY-MM-DD". Returns today's date string for invalid input so date
 * strips / pickers never crash on a bad value. Uses local calendar day.
 */
export function toISODateSafe(value: DateInput): string {
  const d = parseDateSafe(value) ?? new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Mon Jun 21, 2026 — date only, fixed locale + UTC (no day drift). */
export function formatDateStable(
  value: DateInput,
  opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  },
): string {
  const d = parseDateSafe(value);
  if (!d) return INVALID_DATE_FALLBACK;
  return d.toLocaleDateString(APP_LOCALE, { timeZone: "UTC", ...opts });
}

/** Jun 21 — short date with no year. */
export function formatShortDateStable(value: DateInput): string {
  return formatDateStable(value, { month: "short", day: "numeric" });
}

/** Jun 21, 2026, 11:00 AM — date + time in the app timezone. */
export function formatDateTimeStable(
  value: DateInput,
  opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
): string {
  const d = parseDateSafe(value);
  if (!d) return INVALID_DATE_FALLBACK;
  return d.toLocaleString(APP_LOCALE, { timeZone: APP_TIMEZONE, ...opts });
}

/** Mon / Monday — weekday label only. */
export function formatWeekdayStable(
  value: DateInput,
  variant: "short" | "long" | "narrow" = "short",
): string {
  const d = parseDateSafe(value);
  if (!d) return INVALID_DATE_FALLBACK;
  return d.toLocaleDateString(APP_LOCALE, {
    timeZone: "UTC",
    weekday: variant,
  });
}
