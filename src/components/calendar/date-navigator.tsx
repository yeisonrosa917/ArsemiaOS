"use client";

import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDateStable } from "@/lib/dates";

/**
 * Shared date navigator used across Dispatch, Jobs, Routes, etc. so date
 * selection behaves identically everywhere. ISO-in / ISO-out (YYYY-MM-DD),
 * rendered with the app's stable locale/timezone formatter (no hydration drift).
 */

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

export function DateNavigator({
  selectedDate,
  onDateChange,
  today,
  mode = "day",
  variant = "full",
  className,
}: {
  selectedDate: string;
  onDateChange: (iso: string) => void;
  /** Fixed "today" ISO (demo uses a pinned date); defaults to real today. */
  today?: string;
  mode?: "day" | "week";
  variant?: "full" | "compact";
  className?: string;
}) {
  const todayIso = today ?? new Date().toISOString().slice(0, 10);
  const step = mode === "week" ? 7 : 1;
  const weekStart = startOfWeek(selectedDate);
  const days = Array.from({ length: 7 }, (_, i) => shiftDay(weekStart, i));

  return (
    <div className={cn("rounded-xl border border-border bg-card p-2.5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onDateChange(shiftDay(selectedDate, -step))} aria-label="Previous">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex min-w-[180px] items-center gap-2 px-1">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">
              {formatDateStable(selectedDate, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onDateChange(shiftDay(selectedDate, step))} aria-label="Next">
            <ChevronRight className="h-4 w-4" />
          </Button>
          {selectedDate !== todayIso && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => onDateChange(todayIso)}>Today</Button>
          )}
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => e.target.value && onDateChange(e.target.value)}
          className="h-8 rounded-md border border-border bg-background px-2 text-xs"
        />
      </div>

      {variant === "full" && (
        <div className="mt-2 grid grid-cols-7 gap-1">
          {days.map((d) => {
            const active = d === selectedDate;
            const isToday = d === todayIso;
            return (
              <button
                key={d}
                onClick={() => onDateChange(d)}
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
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
