"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Route as RouteIcon,
  UserSquare2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useJobsStore } from "@/lib/store/jobs";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { formatDateStable } from "@/lib/dates";
import type { Job } from "@/lib/types";

/** Fixed "today" — matches the schedule/dashboard so the board opens populated. */
const ROUTES_TODAY = "2026-07-02";

function shiftDay(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + delta));
  return dt.toISOString().slice(0, 10);
}

/** "14:00" -> "2:00 PM" without timezone drift. */
function fmtTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

const STATUS_STYLE: Record<string, string> = {
  Unassigned: "border-slate-500/40 bg-slate-500/10 text-slate-600",
  Assigned: "border-indigo-500/40 bg-indigo-500/10 text-indigo-600",
  "En Route": "border-sky-500/40 bg-sky-500/10 text-sky-600",
  "Pickup Started": "border-amber-500/40 bg-amber-500/10 text-amber-600",
  "Pickup Completed": "border-amber-500/40 bg-amber-500/10 text-amber-600",
  "Delivery Started": "border-violet-500/40 bg-violet-500/10 text-violet-600",
  Completed: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
  Cancelled: "border-rose-500/40 bg-rose-500/10 text-rose-600",
};

export default function RoutesPage() {
  const jobs = useJobsStore((s) => s.jobs);
  const [day, setDay] = useState(ROUTES_TODAY);

  const dayJobs = useMemo(
    () =>
      jobs
        .filter((j) => j.scheduledAt.slice(0, 10) === day && j.status !== "Cancelled")
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    [jobs, day],
  );

  const byForeman = useMemo(() => {
    const m = new Map<string, Job[]>();
    const unassigned: Job[] = [];
    dayJobs.forEach((j) => {
      if (!j.driverName || j.status === "Unassigned") {
        unassigned.push(j);
        return;
      }
      const arr = m.get(j.driverName) ?? [];
      arr.push(j);
      m.set(j.driverName, arr);
    });
    const foremen = [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    return { foremen, unassigned };
  }, [dayJobs]);

  const stats = useMemo(() => {
    const cuFt = dayJobs.reduce((s, j) => s + j.cuFt, 0);
    const miles = dayJobs.reduce((s, j) => s + j.miles, 0);
    const value = dayJobs.reduce((s, j) => s + j.price, 0);
    return { jobs: dayJobs.length, foremen: byForeman.foremen.length, cuFt, miles, value };
  }, [dayJobs, byForeman]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Routes & Schedule"
        description="The day's moving jobs organized by foreman — stop order, timing, zones and load. Navigate by day to plan ahead or review history."
      />

      {/* Day navigator */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setDay(shiftDay(day, -1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex min-w-[190px] items-center gap-2 px-1">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">{formatDateStable(day, { weekday: "long", month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setDay(shiftDay(day, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {day !== ROUTES_TODAY && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setDay(ROUTES_TODAY)}>
              Today
            </Button>
          )}
        </div>
        <input
          type="date"
          value={day}
          onChange={(e) => e.target.value && setDay(e.target.value)}
          className="h-8 rounded-md border border-border bg-background px-2 text-xs"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Jobs" value={String(stats.jobs)} icon={RouteIcon} />
        <Stat label="Foremen working" value={String(stats.foremen)} icon={UserSquare2} />
        <Stat label="Total load" value={`${formatNumber(stats.cuFt)} cuft`} icon={Boxes} />
        <Stat label="Total miles" value={formatNumber(Math.round(stats.miles))} icon={MapPin} />
        <Stat label="Day value" value={formatCurrency(stats.value)} icon={Clock} />
      </div>

      {byForeman.unassigned.length > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/[0.03]">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Unassigned — needs a foreman</span>
              <Badge variant="warning" className="text-[9px]">{byForeman.unassigned.length}</Badge>
            </div>
            <ul className="space-y-2">
              {byForeman.unassigned.map((j) => (
                <StopRow key={j.id} job={j} index={null} />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {byForeman.foremen.length === 0 && byForeman.unassigned.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-12 text-center">
            <CalendarDays className="h-8 w-8 text-muted-foreground/60" />
            <p className="text-sm font-semibold">No jobs scheduled this day</p>
            <p className="text-xs text-muted-foreground">Use the arrows to find a working day.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {byForeman.foremen.map(([foreman, fJobs]) => {
            const cuFt = fJobs.reduce((s, j) => s + j.cuFt, 0);
            const miles = fJobs.reduce((s, j) => s + j.miles, 0);
            return (
              <Card key={foreman}>
                <CardContent className="p-0">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/15 text-brand-600">
                        <UserSquare2 className="h-4 w-4" />
                      </div>
                      <div className="leading-tight">
                        <p className="text-sm font-semibold">{foreman}</p>
                        <p className="text-[11px] text-muted-foreground">{fJobs.length} stops · {formatNumber(cuFt)} cuft · {Math.round(miles)} mi</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-semibold">{formatCurrency(fJobs.reduce((s, j) => s + j.price, 0))}</span>
                  </div>
                  <ul className="divide-y divide-border">
                    {fJobs.map((j, idx) => (
                      <StopRow key={j.id} job={j} index={idx + 1} />
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StopRow({ job, index }: { job: Job; index: number | null }) {
  return (
    <li>
      <Link href={`/jobs/${job.id}`} className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent/30">
        <div className="flex shrink-0 flex-col items-center gap-1 pt-0.5">
          <span className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold",
            index === null ? "bg-amber-500/20 text-amber-700" : "bg-muted text-foreground",
          )}>
            {index ?? "?"}
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground">{fmtTime(job.scheduledAt.slice(11, 16))}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">{job.customer}</span>
            <Badge variant="outline" className="text-[9px]">{job.type}</Badge>
            {job.priority === "High" && <Badge variant="danger" className="text-[9px]">High</Badge>}
          </div>
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <span>{job.pickupCity}</span>
            <ArrowRight className="h-3 w-3 shrink-0" />
            <span>{job.deliveryCity}</span>
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">{job.zone} · {formatNumber(job.cuFt)} cuft · {Math.round(job.miles)} mi</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className={cn("rounded border px-1.5 py-0.5 text-[9px] font-semibold", STATUS_STYLE[job.status] ?? "border-border text-muted-foreground")}>
            {job.status}
          </span>
          <span className="font-mono text-xs font-semibold">{formatCurrency(job.price)}</span>
        </div>
      </Link>
    </li>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Card className="border p-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground/60" />
      </div>
      <p className="mt-1 font-mono text-xl font-bold">{value}</p>
    </Card>
  );
}
