"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDateStable } from "@/lib/dates";

/**
 * Shared date navigator used across Operations, Jobs, etc. so date selection
 * behaves identically everywhere. ISO-in / ISO-out (YYYY-MM-DD), rendered with
 * the app's stable locale/timezone formatter (no hydration drift).
 *
 * Default view is the compact 7-day strip; "Month" expands an inline
 * full-month calendar (equal day cells, per-day record counts, today marker).
 */

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function shiftDay(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + delta)).toISOString().slice(0, 10);
}

function startOfWeek(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dow = dt.getUTCDay(); // 0 Sun..6 Sat
  const offset = (dow + 6) % 7; // Monday = 0
  return shiftDay(iso, -offset);
}

function shiftMonth(iso: string, delta: number): string {
  const [y, m] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1 + delta, 1));
  return dt.toISOString().slice(0, 10);
}

/** Monday-aligned grid of ISO days covering the month of `iso` (5–6 weeks). */
function monthGrid(iso: string): { days: string[]; month: number } {
  const [y, m] = iso.split("-").map(Number);
  const firstIso = `${y}-${pad(m)}-01`;
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const lastIso = `${y}-${pad(m)}-${pad(daysInMonth)}`;
  const days: string[] = [];
  let cur = startOfWeek(firstIso);
  while (days.length < 42) {
    days.push(cur);
    if (days.length % 7 === 0 && cur >= lastIso) break;
    cur = shiftDay(cur, 1);
  }
  return { days, month: m };
}

const WEEKDAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function DateNavigator({
  selectedDate,
  onDateChange,
  today,
  mode = "day",
  variant = "full",
  dayCounts,
  countLabel = "jobs",
  className,
}: {
  selectedDate: string;
  onDateChange: (iso: string) => void;
  /** Fixed "today" ISO (demo uses a pinned date); defaults to real today. */
  today?: string;
  mode?: "day" | "week";
  variant?: "full" | "compact";
  /** Optional per-day record counts (ISO date → count) shown under each day. */
  dayCounts?: Record<string, number>;
  countLabel?: string;
  className?: string;
}) {
  const todayIso = today ?? new Date().toISOString().slice(0, 10);
  const step = mode === "week" ? 7 : 1;
  const weekStart = startOfWeek(selectedDate);
  const days = Array.from({ length: 7 }, (_, i) => shiftDay(weekStart, i));

  const [monthOpen, setMonthOpen] = useState(false);
  // While browsing months we anchor on the 1st; selecting a day clears it so
  // the panel follows the selection again.
  const [monthAnchor, setMonthAnchor] = useState<string | null>(null);
  const anchor = monthAnchor ?? selectedDate;
  const grid = monthGrid(anchor);

  const selectDay = (iso: string) => {
    setMonthAnchor(null);
    onDateChange(iso);
  };

  return (
    <div className={cn("rounded-xl border border-border bg-card p-2.5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => selectDay(shiftDay(selectedDate, -step))} aria-label="Previous">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex min-w-[180px] items-center gap-2 px-1">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">
              {formatDateStable(selectedDate, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => selectDay(shiftDay(selectedDate, step))} aria-label="Next">
            <ChevronRight className="h-4 w-4" />
          </Button>
          {selectedDate !== todayIso && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => selectDay(todayIso)}>Today</Button>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => e.target.value && selectDay(e.target.value)}
            className="h-8 rounded-md border border-border bg-background px-2 text-xs"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
            aria-expanded={monthOpen}
            onClick={() => {
              setMonthOpen((o) => !o);
              setMonthAnchor(null);
            }}
          >
            Month {monthOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* Compact 7-day strip (default) */}
      {variant === "full" && !monthOpen && (
        <div className="mt-2 grid grid-cols-7 gap-1">
          {days.map((d) => {
            const active = d === selectedDate;
            const isToday = d === todayIso;
            return (
              <button
                key={d}
                onClick={() => selectDay(d)}
                className={cn(
                  "flex flex-col items-center rounded-lg border px-1 py-1.5 text-center transition-colors",
                  active ? "border-primary bg-primary/10 text-primary" : "border-transparent hover:bg-muted",
                )}
              >
                <span className="text-[10px] uppercase text-muted-foreground">
                  {formatDateStable(d, { weekday: "short" })}
                </span>
                <span className={cn("text-sm font-semibold", isToday && !active && "text-primary")}>
                  {formatDateStable(d, { day: "numeric" })}
                </span>
                {dayCounts && (
                  <span className={cn("text-[9px]", active ? "text-primary/80" : "text-muted-foreground")}>
                    {isToday ? "today" : `${dayCounts[d] ?? 0} ${countLabel}`}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Expanded month view */}
      {monthOpen && (
        <div className="mt-2">
          <div className="flex items-center justify-between px-1 pb-1.5">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMonthAnchor(shiftMonth(anchor, -1))} aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-semibold">
              {formatDateStable(anchor, { month: "long", year: "numeric" })}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMonthAnchor(shiftMonth(anchor, 1))} aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAY_HEADERS.map((w) => (
              <span key={w} className="pb-0.5 text-center text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                {w}
              </span>
            ))}
            {grid.days.map((d) => {
              const inMonth = Number(d.slice(5, 7)) === grid.month;
              const active = d === selectedDate;
              const isToday = d === todayIso;
              const count = dayCounts?.[d] ?? 0;
              return (
                <button
                  key={d}
                  onClick={() => selectDay(d)}
                  className={cn(
                    "flex h-12 flex-col items-center justify-center rounded-lg border text-center transition-colors",
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-transparent hover:bg-muted",
                    !inMonth && !active && "opacity-40",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold leading-none",
                      isToday && !active && "bg-primary text-primary-foreground",
                      isToday && active && "underline",
                    )}
                  >
                    {Number(d.slice(8, 10))}
                  </span>
                  {dayCounts && (
                    <span className={cn("text-[9px] leading-tight", active ? "text-primary/80" : count > 0 ? "text-muted-foreground" : "text-muted-foreground/40")}>
                      {count > 0 ? `${count} ${countLabel}` : "—"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
