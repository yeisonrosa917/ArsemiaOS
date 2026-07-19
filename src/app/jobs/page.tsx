"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, MapPin, Search, Truck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { DateNavigator } from "@/components/calendar/date-navigator";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { JobStatusBadge } from "@/components/shared/status-badge";
import { JobsTable } from "@/components/jobs/jobs-table";
import { drivers } from "@/lib/mock-data";
import { useJobsStore } from "@/lib/store/jobs";
import type { JobStatus } from "@/lib/types";
import { usePreferences } from "@/lib/store/preferences";
import { getActiveForemanId, getUserByRole } from "@/lib/auth/users";
import { cn, formatCurrency, formatNumber, initials } from "@/lib/utils";
import {
  toISODateSafe,
  parseDateSafe,
  formatDateStable,
  formatDateTimeStable,
} from "@/lib/dates";
import { addDays } from "@/lib/payroll/period";

const STATUSES: (JobStatus | "All")[] = [
  "All",
  "Unassigned",
  "Assigned",
  "En Route",
  "Pickup Started",
  "Pickup Completed",
  "Delivery Started",
  "Completed",
  "Cancelled",
];

const TYPES = ["All", "Local Move", "Long Distance", "Delivery", "Storage In", "Storage Out", "Pickup", "Commercial"];

function truckFor(driverId?: string): string | null {
  if (!driverId) return null;
  return drivers.find((d) => d.id === driverId)?.vehicleName ?? null;
}

export default function JobsPage() {
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const foremanId = getActiveForemanId(activeRoleId);
  const foremanName = foremanId ? getUserByRole(activeRoleId).name : null;
  const jobs = useJobsStore((s) => s.jobs);

  // Land on today if it has jobs, otherwise on the most recent booked day so the
  // calendar is never empty on first load. (Future-dated seed data is a later
  // installment; until then the latest active day is the useful default.)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const mine = foremanId
      ? jobs.filter(
          (j) => j.driverId === foremanId || j.driverName === foremanName || j.crew.includes(foremanName ?? " "),
        )
      : jobs;
    const today = toISODateSafe(new Date());
    const days = new Set(mine.map((j) => (j.scheduledAt ?? "").slice(0, 10)).filter(Boolean));
    if (days.has(today)) return today;
    const sorted = [...days].sort();
    return sorted[sorted.length - 1] ?? today;
  });
  const [view, setView] = useState<"day" | "week" | "list">("day");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<JobStatus | "All">("All");
  const [type, setType] = useState("All");
  const [foremanFilter, setForemanFilter] = useState("All");

  // Foreman sees only their own jobs.
  const scoped = useMemo(() => {
    if (!foremanId) return jobs;
    return jobs.filter(
      (j) => j.driverId === foremanId || j.driverName === foremanName || j.crew.includes(foremanName ?? " "),
    );
  }, [jobs, foremanId, foremanName]);

  // Week window (Mon–Sun) for the selected date.
  const weekDays = useMemo(() => {
    const base = parseDateSafe(selectedDate) ?? new Date();
    const day = (base.getDay() + 6) % 7; // Mon = 0
    const monday = addDays(base, -day);
    return Array.from({ length: 7 }, (_, i) => toISODateSafe(addDays(monday, i)));
  }, [selectedDate]);

  const inScope = (isoDay: string, j: (typeof jobs)[number]) =>
    (j.scheduledAt ?? "").slice(0, 10) === isoDay;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const dayMatch = (j: (typeof jobs)[number]) => {
      const jd = (j.scheduledAt ?? "").slice(0, 10);
      return view === "week" ? weekDays.includes(jd) : jd === selectedDate;
    };
    return scoped.filter((j) => {
      if (!dayMatch(j)) return false;
      if (status !== "All" && j.status !== status) return false;
      if (type !== "All" && j.type !== type) return false;
      if (foremanFilter !== "All" && j.driverName !== foremanFilter) return false;
      if (q) {
        return `${j.id} ${j.customer} ${j.customerPhone} ${j.pickup} ${j.delivery} ${j.pickupCity} ${j.deliveryCity} ${j.driverName ?? ""} ${truckFor(j.driverId) ?? ""}`
          .toLowerCase()
          .includes(q);
      }
      return true;
    });
  }, [scoped, view, weekDays, selectedDate, status, type, foremanFilter, search]);

  // On-this-date total ignoring filters, so we can distinguish "no jobs" from "filtered out".
  const onDateCount = useMemo(
    () => scoped.filter((j) => (view === "week" ? weekDays.includes((j.scheduledAt ?? "").slice(0, 10)) : (j.scheduledAt ?? "").slice(0, 10) === selectedDate)).length,
    [scoped, view, weekDays, selectedDate],
  );

  const jobCountByDay = useMemo(() => {
    const m: Record<string, number> = {};
    scoped.forEach((j) => {
      const d = (j.scheduledAt ?? "").slice(0, 10);
      if (d) m[d] = (m[d] ?? 0) + 1;
    });
    return m;
  }, [scoped]);

  const nextBookedDate = useMemo(() => {
    const days = Object.keys(jobCountByDay).filter((d) => d > selectedDate).sort();
    return days[0] ?? null;
  }, [jobCountByDay, selectedDate]);

  const foremenNames = useMemo(
    () => ["All", ...Array.from(new Set(scoped.map((j) => j.driverName).filter(Boolean) as string[]))],
    [scoped],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title={foremanId ? "My jobs" : "Jobs"}
        description="The operational schedule. Pick a day to see the moves running, or switch to the list to search everything."
      />

      {/* Shared date navigator — same component Operations uses, so the
          selected date reads identically across the app. */}
      {view !== "list" && (
        <DateNavigator
          selectedDate={selectedDate}
          onDateChange={(iso) => setSelectedDate(parseDateSafe(iso) ? iso : toISODateSafe(new Date()))}
          variant="full"
          mode={view === "week" ? "week" : "day"}
          dayCounts={jobCountByDay}
        />
      )}

      {/* View toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted-foreground">
          {view === "week"
            ? `Week of ${formatDateStable(weekDays[0])}`
            : view === "list"
              ? "All jobs — searchable list (not date-scoped)"
              : null}
        </span>
        <div className="flex overflow-hidden rounded-md border border-border text-xs">
          {(["day", "week", "list"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "px-3 py-1.5 font-semibold capitalize transition-colors",
                view === v ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-accent/40",
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "list" ? (
        <JobsTable />
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search job, customer, phone, address, foreman, truck, city..." className="h-9 pl-9" />
            </div>
            <select value={status} onChange={(e) => setStatus(e.target.value as JobStatus | "All")} className="h-9 rounded-lg border border-input bg-background px-3 text-xs font-medium">
              {STATUSES.map((s) => <option key={s} value={s}>{s === "All" ? "All statuses" : s}</option>)}
            </select>
            <select value={type} onChange={(e) => setType(e.target.value)} className="h-9 rounded-lg border border-input bg-background px-3 text-xs font-medium">
              {TYPES.map((t) => <option key={t} value={t}>{t === "All" ? "All types" : t}</option>)}
            </select>
            {!foremanId && (
              <select value={foremanFilter} onChange={(e) => setForemanFilter(e.target.value)} className="h-9 rounded-lg border border-input bg-background px-3 text-xs font-medium">
                {foremenNames.map((f) => <option key={f} value={f}>{f === "All" ? "All foremen" : f}</option>)}
              </select>
            )}
          </div>

          {filtered.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                <CalendarDays className="h-8 w-8 text-muted-foreground" />
                {onDateCount === 0 ? (
                  <>
                    <p className="text-sm font-semibold">No jobs on this {view}.</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {nextBookedDate && (
                        <Button size="sm" variant="outline" onClick={() => setSelectedDate(nextBookedDate)}>
                          View next booked date ({formatDateStable(nextBookedDate)})
                        </Button>
                      )}
                      {!foremanId && (
                        <Button asChild size="sm" variant="outline">
                          <Link href="/quotes">Create quote</Link>
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => setSelectedDate(toISODateSafe(new Date()))}>
                        Back to today
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {onDateCount} job{onDateCount !== 1 ? "s" : ""} on this {view}, but 0 match the current filters.
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                {filtered.length} of {onDateCount} job{onDateCount !== 1 ? "s" : ""} · {formatCurrency(filtered.reduce((s, j) => s + j.price, 0))} booked
              </p>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((j) => {
                  const truck = truckFor(j.driverId);
                  return (
                    <Link key={j.id} href={`/jobs/${j.id}`}>
                      <Card className="h-full transition-colors hover:border-primary/50 hover:bg-accent/20">
                        <CardContent className="space-y-2.5 p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-mono text-[10px] text-muted-foreground">{j.id}</p>
                              <p className="text-sm font-semibold">{j.customer}</p>
                            </div>
                            <JobStatusBadge status={j.status} />
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                            <Badge variant="outline">{j.type}</Badge>
                            <span className="text-muted-foreground">
                              {formatDateTimeStable(j.scheduledAt, { weekday: "short", hour: "numeric", minute: "2-digit" })}
                              {j.eta ? ` · ETA ${j.eta}` : ""}
                            </span>
                            {j.priority === "High" && <Badge variant="danger">High</Badge>}
                          </div>
                          <div className="space-y-1 text-[11px]">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/15 text-[9px] font-bold text-amber-600">P</span>
                              <span className="truncate">{j.pickupCity} · {j.pickup}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15 text-[9px] font-bold text-emerald-600">D</span>
                              <span className="truncate">{j.deliveryCity} · {j.delivery}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between border-t pt-2 text-[11px]">
                            {j.driverName ? (
                              <div className="flex items-center gap-1.5">
                                <Avatar className="h-5 w-5">
                                  <AvatarFallback className="bg-brand-500/15 text-[9px] text-brand-700 dark:text-brand-300">
                                    {initials(j.driverName)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{j.driverName}</span>
                              </div>
                            ) : (
                              <Badge variant="slate">Needs foreman</Badge>
                            )}
                            <span className="font-semibold">{formatCurrency(j.price)}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1 truncate">
                              <Truck className="h-3 w-3 shrink-0" />
                              {truck ?? "No truck"}
                            </span>
                            <span className="flex items-center gap-2">
                              <span>{formatNumber(j.cuFt)} CuFt</span>
                              <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{j.miles.toFixed(0)} mi</span>
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
