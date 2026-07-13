"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Search,
  Truck,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  JobStatusBadge,
  DriverStatusBadge,
} from "@/components/shared/status-badge";
import { MapPreview } from "@/components/shared/map-preview";
import { ReassignModal } from "@/components/jobs/reassign-modal";
import { PendingDispatchChanges } from "@/components/dispatch/pending-changes";
import { drivers, jobStatuses, zones } from "@/lib/mock-data";
import { useJobsStore } from "@/lib/store/jobs";
import type { JobStatus } from "@/lib/types";
import { cn, formatCurrency, initials } from "@/lib/utils";
import { toISODateSafe, parseDateSafe, formatWeekdayStable } from "@/lib/dates";

const JOB_TYPES = [
  "All Types",
  "Local Move",
  "Long Distance",
  "Delivery",
  "Storage In",
  "Storage Out",
  "Pickup",
  "Commercial",
] as const;

function todayISO(): string {
  return toISODateSafe(new Date());
}

export function DispatchBoard({
  selectedDate: controlledDate,
  onDateChange,
  hideDateStrip = false,
}: {
  /** Controlled mode — the Operations shell owns the selected date. */
  selectedDate?: string;
  onDateChange?: (iso: string) => void;
  /** Hide the internal date strip when a shared navigator is rendered above. */
  hideDateStrip?: boolean;
} = {}) {
  const jobs = useJobsStore((s) => s.jobs);
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState<string>("All Zones");
  const [typeFilter, setTypeFilter] = useState<string>("All Types");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "All">("All");
  const [driverFilter, setDriverFilter] = useState<string>("All Foremen");
  const [internalDate, setInternalDate] = useState<string>(todayISO());
  const selectedDate = controlledDate ?? internalDate;
  const setSelectedDate = (iso: string) => {
    if (onDateChange) onDateChange(iso);
    else setInternalDate(iso);
  };
  const [selectedJobId, setSelectedJobId] = useState<string | null>(
    jobs[0]?.id ?? null,
  );
  const [reassignOpen, setReassignOpen] = useState(false);

  const dateStrip = useMemo(() => {
    // Never trust selectedDate — a cleared date picker yields "" → Invalid Date
    // → RangeError on toISOString(). Fall back to today on any invalid value.
    const base = parseDateSafe(selectedDate) ?? new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() - 3 + i);
      return d;
    });
  }, [selectedDate]);

  const jobCountByDay = useMemo(() => {
    const map: Record<string, number> = {};
    jobs.forEach((j) => {
      const day = (j.scheduledAt ?? "").slice(0, 10);
      if (!day) return;
      map[day] = (map[day] ?? 0) + 1;
    });
    return map;
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const jobDay = (j.scheduledAt ?? "").slice(0, 10);
      if (jobDay && jobDay !== selectedDate) return false;
      if (statusFilter !== "All" && j.status !== statusFilter) return false;
      if (zoneFilter !== "All Zones" && j.zone !== zoneFilter) return false;
      if (typeFilter !== "All Types" && j.type !== typeFilter) return false;
      if (driverFilter !== "All Foremen" && j.driverName !== driverFilter)
        return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !`${j.id} ${j.customer} ${j.pickup} ${j.delivery}`
            .toLowerCase()
            .includes(q)
        )
          return false;
      }
      return true;
    });
  }, [jobs, search, zoneFilter, typeFilter, statusFilter, driverFilter, selectedDate]);

  const jobsOnDate = useMemo(
    () => jobs.filter((j) => (j.scheduledAt ?? "").slice(0, 10) === selectedDate).length,
    [jobs, selectedDate],
  );

  const selectedJob =
    filteredJobs.find((j) => j.id === selectedJobId) ??
    filteredJobs[0] ??
    null;

  const counts = useMemo(() => {
    return jobStatuses.map((s) => ({
      status: s,
      count: jobs.filter((j) => j.status === s).length,
    }));
  }, [jobs]);

  return (
    <div className="space-y-4">
      {/* Date strip — easy day navigation (hidden when the Operations shell
          renders the shared full-width DateNavigator above the tabs). */}
      {!hideDateStrip && (
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-soft">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => {
            const d = parseDateSafe(selectedDate) ?? new Date();
            d.setDate(d.getDate() - 1);
            setSelectedDate(toISODateSafe(d));
          }}
          aria-label="Previous day"
        >
          ‹
        </Button>
        <div className="flex flex-1 items-center gap-1 overflow-x-auto">
          {dateStrip.map((d) => {
            const iso = toISODateSafe(d);
            const active = iso === selectedDate;
            const isToday = iso === todayISO();
            const count = jobCountByDay[iso] ?? 0;
            return (
              <button
                key={iso}
                onClick={() => setSelectedDate(iso)}
                className={cn(
                  "min-w-[64px] shrink-0 rounded-lg border px-2 py-1.5 text-center transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary shadow-soft"
                    : "border-border bg-background hover:bg-accent/30",
                )}
              >
                <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {formatWeekdayStable(d)}
                </p>
                <p className="text-base font-bold leading-none">
                  {d.getDate()}
                </p>
                <p className="text-[9px] text-muted-foreground">
                  {isToday ? "today" : `${count} jobs`}
                </p>
              </button>
            );
          })}
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => {
            const d = parseDateSafe(selectedDate) ?? new Date();
            d.setDate(d.getDate() + 1);
            setSelectedDate(toISODateSafe(d));
          }}
          aria-label="Next day"
        >
          ›
        </Button>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            const v = e.target.value;
            // Cleared/invalid picker input must never reach toISOString().
            setSelectedDate(v && parseDateSafe(v) ? v : todayISO());
          }}
          className="h-8 rounded-md border border-border bg-background px-2 text-xs"
        />
        {selectedDate !== todayISO() && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs"
            onClick={() => setSelectedDate(todayISO())}
          >
            Today
          </Button>
        )}
      </div>
      )}

      <PendingDispatchChanges />

      <div className="grid grid-cols-12 gap-4">
      {/* Filters / job list */}
      <aside className="col-span-12 xl:col-span-3">
        <div className="flex h-full flex-col rounded-2xl border bg-card shadow-card">
          <div className="border-b p-4">
            <div className="flex items-center justify-between gap-2 pb-3">
              <div>
                <p className="text-sm font-semibold">Job queue</p>
                <p className="text-xs text-muted-foreground">
                  {jobsOnDate === 0
                    ? "0 jobs on selected date"
                    : filteredJobs.length === jobsOnDate
                      ? `${jobsOnDate} job${jobsOnDate !== 1 ? "s" : ""} on selected date`
                      : `${jobsOnDate} on this date · ${filteredJobs.length} match filters`}
                </p>
              </div>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search job, customer, address"
                className="pl-9"
              />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <FilterSelect
                label="Zone"
                value={zoneFilter}
                onChange={setZoneFilter}
                options={["All Zones", ...zones]}
              />
              <FilterSelect
                label="Type"
                value={typeFilter}
                onChange={setTypeFilter}
                options={[...JOB_TYPES]}
              />
              <FilterSelect
                label="Foreman"
                value={driverFilter}
                onChange={setDriverFilter}
                options={["All Foremen", ...drivers.map((d) => d.name)]}
              />
            </div>

            <div className="mt-3">
              <p className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </p>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setStatusFilter("All")}
                  className={cn(
                    "rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
                    statusFilter === "All"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  All <span className="text-foreground/60">({jobs.length})</span>
                </button>
                {counts.map((c) => (
                  <button
                    key={c.status}
                    onClick={() => setStatusFilter(c.status)}
                    className={cn(
                      "rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
                      statusFilter === c.status
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {c.status}{" "}
                    <span className="text-foreground/60">({c.count})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="max-h-[640px] flex-1 overflow-y-auto scrollbar-thin">
            <ul className="space-y-1.5 p-3">
              {filteredJobs.map((job) => {
                const active = selectedJob?.id === job.id;
                return (
                  <li key={job.id}>
                    <button
                      onClick={() => setSelectedJobId(job.id)}
                      className={cn(
                        "w-full rounded-xl border p-3 text-left transition-colors",
                        active
                          ? "border-primary/60 bg-primary/5 shadow-soft"
                          : "border-border/70 bg-background hover:bg-muted/40",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-mono text-muted-foreground">
                            {job.id}
                          </p>
                          <p className="text-sm font-semibold leading-tight">
                            {job.customer}
                          </p>
                        </div>
                        <JobStatusBadge status={job.status} />
                      </div>
                      <div className="mt-2 space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/15 text-[9px] font-bold text-amber-600">
                            P
                          </span>
                          <span className="truncate">{job.pickup}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15 text-[9px] font-bold text-emerald-600">
                            D
                          </span>
                          <span className="truncate">{job.delivery}</span>
                        </div>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-muted-foreground">
                          {job.type} • {job.zone}
                        </span>
                        <div className="flex items-center gap-2 text-foreground/80">
                          <span>{job.cuFt} CuFt</span>
                          <span>•</span>
                          <span>{job.miles} mi</span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        {job.driverName ? (
                          <div className="flex items-center gap-1.5">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="bg-brand-500/15 text-[9px] text-brand-700 dark:text-brand-300">
                                {initials(job.driverName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[11px] font-medium text-foreground">
                              {job.driverName}
                            </span>
                          </div>
                        ) : (
                          <Badge variant="slate">Needs assignment</Badge>
                        )}
                        <span className="text-xs font-semibold">
                          {formatCurrency(job.price)}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
              {filteredJobs.length === 0 && (
                <li className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">
                  No jobs match these filters.
                </li>
              )}
            </ul>
          </div>
        </div>
      </aside>

      {/* Map + selected job details */}
      <section className="col-span-12 xl:col-span-6">
        <div className="flex h-full flex-col rounded-2xl border bg-card shadow-card">
          <div className="flex items-center justify-between gap-3 border-b p-4">
            <div>
              <p className="text-sm font-semibold">Live dispatch map</p>
              <p className="text-xs text-muted-foreground">
                {drivers.length} foremen • {jobs.length} jobs in scope
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedJob && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => setReassignOpen(true)}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  {selectedJob.driverName ? "Reassign Foreman" : "Assign Foreman"}
                </Button>
              )}
            </div>
          </div>

          <div className="relative min-h-[420px] flex-1 p-4">
            <MapPreview className="h-full min-h-[420px]" />
          </div>

          {selectedJob && (
            <div className="border-t bg-muted/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xs text-muted-foreground">
                      {selectedJob.id}
                    </p>
                    <JobStatusBadge status={selectedJob.status} />
                    <Badge variant="outline">{selectedJob.type}</Badge>
                    <Badge variant="violet">{selectedJob.priority} priority</Badge>
                  </div>
                  <h3 className="mt-1 text-lg font-semibold">
                    {selectedJob.customer}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {selectedJob.customerPhone && (
                    <Button asChild variant="outline" size="sm" className="gap-1.5">
                      <a href={`tel:${selectedJob.customerPhone.replace(/[^0-9+]/g, "")}`}>
                        <Phone className="h-3.5 w-3.5" />
                        Call
                      </a>
                    </Button>
                  )}
                  <Button asChild size="sm">
                    <Link href={`/jobs/${selectedJob.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <DetailBlock
                  icon={MapPin}
                  label="Pickup"
                  value={selectedJob.pickup}
                  tone="amber"
                />
                <DetailBlock
                  icon={MapPin}
                  label="Delivery"
                  value={selectedJob.delivery}
                  tone="emerald"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Metric label="Volume" value={`${selectedJob.cuFt} CuFt`} />
                  <Metric label="Distance" value={`${selectedJob.miles} mi`} />
                  <Metric
                    label="Price"
                    value={formatCurrency(selectedJob.price)}
                  />
                  <Metric label="ETA" value={selectedJob.eta ?? "—"} />
                </div>
              </div>

              {selectedJob.notes && (
                <p className="mt-3 rounded-lg bg-background px-3 py-2 text-xs text-muted-foreground ring-1 ring-border">
                  <span className="font-semibold text-foreground">Notes: </span>
                  {selectedJob.notes}
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Drivers right panel */}
      <aside className="col-span-12 xl:col-span-3">
        <div className="flex h-full flex-col rounded-2xl border bg-card shadow-card">
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Foremen on duty</p>
                <p className="text-xs text-muted-foreground">
                  {drivers.filter((d) => d.status !== "Offline").length} active
                  • {drivers.length} total
                </p>
              </div>
            </div>
          </div>

          <div className="max-h-[640px] flex-1 overflow-y-auto scrollbar-thin">
            <ul className="space-y-2 p-3">
              {drivers.map((d) => (
                <li
                  key={d.id}
                  className="rounded-xl border border-border/70 bg-background p-3 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback
                        className={cn("text-white", d.avatarColor)}
                      >
                        {initials(d.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {d.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {d.vehicleName}
                          </p>
                        </div>
                        <DriverStatusBadge status={d.status} />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {d.currentLocation}
                        </span>
                        {d.eta && (
                          <span className="font-medium text-foreground">
                            ETA {d.eta}
                          </span>
                        )}
                      </div>
                      {d.currentJobId && (
                        <div className="mt-2 flex items-center justify-between rounded-md bg-muted px-2 py-1.5 text-[11px]">
                          <span className="text-muted-foreground">
                            Current job
                          </span>
                          <span className="font-mono font-semibold">
                            {d.currentJobId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t p-3">
            <Button asChild variant="outline" className="w-full gap-2 text-xs">
              <Link href="/fleet">
                <Truck className="h-3.5 w-3.5" />
                View fleet board
              </Link>
            </Button>
          </div>
        </div>
      </aside>
      </div>

      {selectedJob && (
        <ReassignModal
          job={selectedJob}
          open={reassignOpen}
          onOpenChange={setReassignOpen}
        />
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  options: string[];
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="relative">
      <label className="pointer-events-none absolute left-2 top-1 z-10 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="h-12 w-full appearance-none rounded-lg border border-input bg-background pl-7 pr-6 pt-4 text-xs font-medium shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {Icon && (
        <Icon className="pointer-events-none absolute bottom-2.5 left-2 h-3.5 w-3.5 text-muted-foreground" />
      )}
    </div>
  );
}

function DetailBlock({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: "amber" | "emerald";
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background p-3">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full",
            tone === "amber"
              ? "bg-amber-500/15 text-amber-600"
              : "bg-emerald-500/15 text-emerald-600",
          )}
        >
          <Icon className="h-3 w-3" />
        </span>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      </div>
      <p className="mt-1.5 text-xs font-medium text-foreground">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background p-2 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
