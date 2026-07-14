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
import { JobStatusBadge } from "@/components/shared/status-badge";
import { MapPreview } from "@/components/shared/map-preview";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ReassignModal } from "@/components/jobs/reassign-modal";
import { PendingDispatchChanges } from "@/components/dispatch/pending-changes";
import { drivers, jobStatuses, zones } from "@/lib/mock-data";
import { useJobsStore } from "@/lib/store/jobs";
import { useFleet } from "@/lib/store/fleet";
import {
  useForemanAvailability,
  AVAILABILITY_LABEL,
  AVAILABILITY_STYLES,
} from "@/lib/store/foreman-availability";
import { useUsers } from "@/lib/store/users";
import {
  buildForemanDayStatuses,
  foremanDayLabel,
  type ForemanDayStatus,
} from "@/lib/operations/day-status";
import type { JobStatus } from "@/lib/types";
import { cn, formatCurrency, telHref } from "@/lib/utils";
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
  // No auto-selection: Reassign and the detail strip only appear once the
  // dispatcher explicitly clicks a job in the queue.
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [reassignOpen, setReassignOpen] = useState(false);
  const availabilityOverrides = useForemanAvailability((s) => s.overrides);
  const users = useUsers((s) => s.users);

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

  const selectedJob = filteredJobs.find((j) => j.id === selectedJobId) ?? null;

  // Crew panel groups (folds the old Foreman Roster info into the Board),
  // derived through the same shared selector Assignments and Foremen use —
  // one source of truth for who actually works on this date.
  const vehicles = useFleet((s) => s.vehicles);
  const crewGroups = useMemo(() => {
    const rows = buildForemanDayStatuses({
      date: selectedDate,
      jobs,
      drivers,
      vehicles,
      users,
      overrides: availabilityOverrides,
    });
    return {
      assigned: rows.filter((r) => r.workingToday),
      available: rows.filter((r) => !r.workingToday && r.availability !== "offline"),
      off: rows.filter((r) => !r.workingToday && r.availability === "offline"),
    };
  }, [jobs, selectedDate, availabilityOverrides, users, vehicles]);

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
                      {/* Operational info first: time · status · crew · route. */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold leading-tight">
                            {job.scheduledAt.slice(11, 16)}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {job.id}
                          </span>
                        </div>
                        <JobStatusBadge status={job.status} />
                      </div>
                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        {job.driverName ? (
                          <div className="flex min-w-0 items-center gap-1.5">
                            <UserAvatar name={job.driverName} size="xs" />
                            <span className="truncate text-[11px] font-semibold text-foreground">
                              {job.driverName}
                            </span>
                          </div>
                        ) : (
                          <Badge variant="danger" className="text-[9px]">Needs foreman</Badge>
                        )}
                        {job.truckId ? (
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {job.truckId}
                          </span>
                        ) : job.driverName ? (
                          <span className="text-[10px] text-amber-500">no truck</span>
                        ) : null}
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-[11px]">
                        <span className="font-medium text-muted-foreground">
                          {job.type} • {job.zone}
                        </span>
                        <div className="flex items-center gap-2 text-foreground/80">
                          <span>{job.cuFt} CuFt</span>
                          <span>•</span>
                          <span>{job.miles} mi</span>
                        </div>
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
                      <div className="flex items-center justify-between">
                        <span className="truncate text-[11px] text-muted-foreground">
                          {job.customer}
                        </span>
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
              <p className="flex items-center gap-2 text-sm font-semibold">
                Planned routes
                <Badge variant="outline" className="text-[9px] uppercase">Simulated</Badge>
              </p>
              <p className="text-xs text-muted-foreground">
                Illustrative demo map — not live GPS. {jobsOnDate} job{jobsOnDate === 1 ? "" : "s"} on this date.
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
                  <Metric
                    label="Start time"
                    value={selectedJob.scheduledAt.slice(11, 16) || "—"}
                  />
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

      {/* Crew panel — foremen grouped by their day, folded from the old
          Foreman Roster tab. */}
      <aside className="col-span-12 xl:col-span-3">
        <div className="flex h-full flex-col rounded-2xl border bg-card shadow-card">
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Foremen — selected date</p>
                <p className="text-xs text-muted-foreground">
                  {crewGroups.assigned.length} assigned • {crewGroups.available.length} available
                  • {crewGroups.off.length} off
                </p>
              </div>
            </div>
          </div>

          <div className="max-h-[640px] flex-1 overflow-y-auto scrollbar-thin">
            <div className="space-y-3 p-3">
              <CrewGroup title="Assigned today" rows={crewGroups.assigned} showPhotoWarning
                empty="No foremen assigned on this date yet." />
              <CrewGroup title="Available" rows={crewGroups.available}
                empty="No idle foremen — everyone is assigned or off." />
              <CrewGroup title="Off duty" rows={crewGroups.off} empty="Nobody is off." />
            </div>
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

const CREW_TONE: Record<string, string> = {
  slate: "border-slate-400/40 bg-slate-500/10 text-slate-600 dark:text-slate-300",
  sky: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-300",
  emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  rose: "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-300",
  amber: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300",
};

function CrewGroup({
  title,
  rows,
  empty,
  showPhotoWarning = false,
}: {
  title: string;
  rows: ForemanDayStatus[];
  empty: string;
  /** Assigned foremen without a profile photo get an identity warning. */
  showPhotoWarning?: boolean;
}) {
  return (
    <div>
      <p className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title} ({rows.length})
      </p>
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-2 py-2 text-[10px] text-muted-foreground">
          {empty}
        </p>
      ) : (
        <ul className="space-y-1.5">
          {rows.map((r) => (
            <li
              key={r.foremanId}
              className="rounded-xl border border-border/70 bg-background p-2.5 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-start gap-2.5">
                <UserAvatar name={r.name} photoUrl={r.photoUrl} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{r.name}</p>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {r.truck
                          ? r.truck.name.split(" - ")[0]
                          : r.workingToday
                            ? "No truck picked yet"
                            : `${r.driver.vehicleName.split(" - ")[0]} (default)`}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded border px-1.5 py-0.5 text-[9px] font-semibold",
                        AVAILABILITY_STYLES[r.availability],
                      )}
                    >
                      {AVAILABILITY_LABEL[r.availability]}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                    {foremanDayLabel(r)}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                    {r.jobs.length > 0 && (
                      <Badge variant="success" className="text-[9px]">
                        {r.jobs.length} job{r.jobs.length === 1 ? "" : "s"}
                      </Badge>
                    )}
                    {r.workingToday && r.assignmentHuman && (
                      <span
                        className={cn(
                          "rounded border px-1.5 py-0.5 text-[9px] font-semibold",
                          CREW_TONE[r.assignmentHuman.tone],
                        )}
                      >
                        {r.assignmentHuman.label}
                      </span>
                    )}
                    {showPhotoWarning && !r.hasPhoto && (
                      <Badge variant="warning" className="text-[9px]">No photo</Badge>
                    )}
                    <a
                      href={telHref(r.driver.phone)}
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <Phone className="h-3 w-3" /> Call
                    </a>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
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
