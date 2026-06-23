/**
 * Payroll period helpers — weekly (Mon-Sun), monthly, or custom range.
 * All comparisons use plain ISO yyyy-mm-dd to avoid timezone drift.
 */

export type PayrollRangeKind = "weekly" | "monthly" | "custom";

export interface PayrollRange {
  kind: PayrollRangeKind;
  from: string; // ISO date
  to: string; // ISO date (inclusive)
  label: string;
}

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const offset = (day + 6) % 7; // Monday = 0
  x.setDate(x.getDate() - offset);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function weeklyRange(anchor: Date = new Date()): PayrollRange {
  const start = startOfWeek(anchor);
  const end = addDays(start, 6);
  return {
    kind: "weekly",
    from: isoDay(start),
    to: isoDay(end),
    label: `${start.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })} – ${end.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })}`,
  };
}

export function monthlyRange(anchor: Date = new Date()): PayrollRange {
  const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  return {
    kind: "monthly",
    from: isoDay(start),
    to: isoDay(end),
    label: start.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    }),
  };
}

export function customRange(from: string, to: string): PayrollRange {
  return {
    kind: "custom",
    from,
    to,
    label: `${from} → ${to}`,
  };
}

export function inRange(dateIso: string, range: PayrollRange): boolean {
  const d = dateIso.slice(0, 10);
  return d >= range.from && d <= range.to;
}
