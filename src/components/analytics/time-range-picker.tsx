"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatCompactCurrency, formatNumber } from "@/lib/utils";

export type TimeRange = "today" | "7d" | "30d" | "90d" | "ytd" | "custom";

export interface TimeRangeMeta {
  id: TimeRange;
  label: string;
  /** Mock data for the period — replace with real query results in Phase 3. */
  revenue: number;
  jobs: number;
  prevRevenue: number;
  prevJobs: number;
}

export const TIME_RANGES: TimeRangeMeta[] = [
  {
    id: "today",
    label: "Today",
    revenue: 31240,
    jobs: 26,
    prevRevenue: 26380,
    prevJobs: 23,
  },
  {
    id: "7d",
    label: "Last 7 days",
    revenue: 161550,
    jobs: 119,
    prevRevenue: 142880,
    prevJobs: 108,
  },
  {
    id: "30d",
    label: "Last 30 days",
    revenue: 542000,
    jobs: 412,
    prevRevenue: 516000,
    prevJobs: 388,
  },
  {
    id: "90d",
    label: "Last 90 days",
    revenue: 1546000,
    jobs: 1184,
    prevRevenue: 1312000,
    prevJobs: 1022,
  },
  {
    id: "ytd",
    label: "Year to date",
    revenue: 2858000,
    jobs: 2188,
    prevRevenue: 2412000,
    prevJobs: 1840,
  },
  {
    id: "custom",
    label: "Custom",
    revenue: 0,
    jobs: 0,
    prevRevenue: 0,
    prevJobs: 0,
  },
];

export function TimeRangePicker({
  value,
  onChange,
}: {
  value: TimeRange;
  onChange: (v: TimeRange) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000)
    .toISOString()
    .slice(0, 10);
  const [customFrom, setCustomFrom] = useState(monthAgo);
  const [customTo, setCustomTo] = useState(today);

  const customMeta = useMemo<TimeRangeMeta>(() => {
    const days = Math.max(
      1,
      Math.round(
        (new Date(customTo).getTime() - new Date(customFrom).getTime()) /
          (1000 * 3600 * 24),
      ),
    );
    // Pro-rate from 30-day baseline of $542k / 412 jobs
    const baseRev = (542000 / 30) * days;
    const baseJobs = Math.round((412 / 30) * days);
    return {
      id: "custom",
      label: `${customFrom} → ${customTo}`,
      revenue: Math.round(baseRev),
      jobs: baseJobs,
      prevRevenue: Math.round(baseRev * 0.93),
      prevJobs: Math.round(baseJobs * 0.95),
    };
  }, [customFrom, customTo]);

  const meta = value === "custom" ? customMeta : TIME_RANGES.find((t) => t.id === value)!;
  const revDelta =
    meta.prevRevenue > 0
      ? ((meta.revenue - meta.prevRevenue) / meta.prevRevenue) * 100
      : 0;
  const jobDelta =
    meta.prevJobs > 0 ? ((meta.jobs - meta.prevJobs) / meta.prevJobs) * 100 : 0;

  return (
    <Card className="border-primary/30">
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-muted/30 p-1">
          {TIME_RANGES.map((r) => {
            const active = r.id === value;
            return (
              <button
                key={r.id}
                onClick={() => onChange(r.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  active
                    ? "bg-background text-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r.id === "custom" && <Calendar className="h-3 w-3" />}
                {r.label}
              </button>
            );
          })}
        </div>

        {value === "custom" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                From
              </span>
              <Input
                type="date"
                value={customFrom}
                max={customTo}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                To
              </span>
              <Input
                type="date"
                value={customTo}
                min={customFrom}
                max={today}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </label>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatBlock
            label="Revenue"
            value={formatCompactCurrency(meta.revenue)}
            prev={formatCompactCurrency(meta.prevRevenue)}
            delta={revDelta}
            primary
          />
          <StatBlock
            label="Jobs closed"
            value={formatNumber(meta.jobs)}
            prev={formatNumber(meta.prevJobs)}
            delta={jobDelta}
          />
          <StatBlock
            label="Avg ticket"
            value={
              meta.jobs > 0
                ? formatCompactCurrency(meta.revenue / meta.jobs)
                : "—"
            }
            prev={
              meta.prevJobs > 0
                ? formatCompactCurrency(meta.prevRevenue / meta.prevJobs)
                : "—"
            }
            delta={
              meta.prevJobs > 0 && meta.jobs > 0
                ? ((meta.revenue / meta.jobs -
                    meta.prevRevenue / meta.prevJobs) /
                    (meta.prevRevenue / meta.prevJobs)) *
                  100
                : 0
            }
          />
          <StatBlock
            label="Period"
            value={meta.label}
            prev="vs prior period"
            delta={0}
            hideDelta
          />
        </div>
      </CardContent>
    </Card>
  );
}

function StatBlock({
  label,
  value,
  prev,
  delta,
  primary,
  hideDelta,
}: {
  label: string;
  value: string;
  prev: string;
  delta: number;
  primary?: boolean;
  hideDelta?: boolean;
}) {
  const positive = delta >= 0;
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-background p-3",
        primary && "border-primary/40",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-mono text-xl font-bold",
          primary && "text-primary",
        )}
      >
        {value}
      </p>
      {!hideDelta && (
        <div className="mt-1 flex items-center gap-1.5 text-[10px]">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-semibold",
              positive
                ? "bg-success/15 text-success"
                : "bg-destructive/15 text-destructive",
            )}
          >
            {positive ? (
              <ArrowUp className="h-2.5 w-2.5" />
            ) : (
              <ArrowDown className="h-2.5 w-2.5" />
            )}
            {Math.abs(delta).toFixed(1)}%
          </span>
          <span className="text-muted-foreground">vs {prev}</span>
        </div>
      )}
    </div>
  );
}
