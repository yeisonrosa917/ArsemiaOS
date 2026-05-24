"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Filter,
  MapPin,
  Maximize2,
  Navigation,
  Phone,
  Plus,
  Route as RouteIcon,
  Search,
  Truck,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  JobStatusBadge,
  DriverStatusBadge,
} from "@/components/shared/status-badge";
import { MapPreview } from "@/components/shared/map-preview";
import {
  drivers,
  jobs,
  jobStatuses,
  zones,
} from "@/lib/mock-data";
import type { JobStatus } from "@/lib/types";
import { cn, formatCurrency, initials } from "@/lib/utils";

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

export function DispatchBoard() {
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState<string>("All Zones");
  const [typeFilter, setTypeFilter] = useState<string>("All Types");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "All">("All");
  const [driverFilter, setDriverFilter] = useState<string>("All Drivers");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(
    jobs[0]?.id ?? null,
  );

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (statusFilter !== "All" && j.status !== statusFilter) return false;
      if (zoneFilter !== "All Zones" && j.zone !== zoneFilter) return false;
      if (typeFilter !== "All Types" && j.type !== typeFilter) return false;
      if (driverFilter !== "All Drivers" && j.driverName !== driverFilter)
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
  }, [search, zoneFilter, typeFilter, statusFilter, driverFilter]);

  const selectedJob =
    filteredJobs.find((j) => j.id === selectedJobId) ??
    filteredJobs[0] ??
    null;

  const counts = useMemo(() => {
    return jobStatuses.map((s) => ({
      status: s,
      count: jobs.filter((j) => j.status === s).length,
    }));
  }, []);

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Filters / job list */}
      <aside className="col-span-12 xl:col-span-3">
        <div className="flex h-full flex-col rounded-2xl border bg-card shadow-card">
          <div className="border-b p-4">
            <div className="flex items-center justify-between gap-2 pb-3">
              <div>
                <p className="text-sm font-semibold">Job queue</p>
                <p className="text-xs text-muted-foreground">
                  {filteredJobs.length} of {jobs.length} jobs
                </p>
              </div>
              <Button size="sm" variant="outline" className="h-7 gap-1 text-xs">
                <Filter className="h-3 w-3" />
                Saved
              </Button>
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
                label="Date"
                value="Today"
                icon={CalendarDays}
                options={["Today", "Tomorrow", "This week", "Custom"]}
              />
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
                label="Driver"
                value={driverFilter}
                onChange={setDriverFilter}
                options={["All Drivers", ...drivers.map((d) => d.name)]}
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

          <ScrollArea className="max-h-[640px] flex-1">
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
          </ScrollArea>
        </div>
      </aside>

      {/* Map + selected job details */}
      <section className="col-span-12 xl:col-span-6">
        <div className="flex h-full flex-col rounded-2xl border bg-card shadow-card">
          <div className="flex items-center justify-between gap-3 border-b p-4">
            <div>
              <p className="text-sm font-semibold">Live dispatch map</p>
              <p className="text-xs text-muted-foreground">
                7 vehicles • 4 active routes • Updated 12s ago
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Navigation className="h-3.5 w-3.5" />
                Optimize Route
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <UserPlus className="h-3.5 w-3.5" />
                Assign Driver
              </Button>
              <Button size="sm" className="gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" />
                Create Job
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Maximize2 className="h-4 w-4" />
              </Button>
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
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    Call
                  </Button>
                  <Button size="sm">View Details</Button>
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
                <p className="text-sm font-semibold">Drivers on duty</p>
                <p className="text-xs text-muted-foreground">
                  {drivers.filter((d) => d.status !== "Offline").length} active
                  • {drivers.length} total
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <RouteIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="max-h-[640px] flex-1">
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
          </ScrollArea>

          <div className="border-t p-3">
            <Button variant="outline" className="w-full gap-2 text-xs">
              <Truck className="h-3.5 w-3.5" />
              View fleet board
            </Button>
          </div>
        </div>
      </aside>
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
