"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  FileWarning,
  Mail,
  MapPin,
  Phone,
  Search,
  Star,
  Truck,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { JobStatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ReassignModal } from "@/components/jobs/reassign-modal";
import { drivers } from "@/lib/mock-data";
import { useJobsStore } from "@/lib/store/jobs";
import { useFleet } from "@/lib/store/fleet";
import { useUsers } from "@/lib/store/users";
import {
  useForemanAvailability,
  AVAILABILITY_LABEL,
  AVAILABILITY_STYLES,
  type Availability,
} from "@/lib/store/foreman-availability";
import { usePreferences } from "@/lib/store/preferences";
import { resolveCapabilities } from "@/lib/auth/roles";
import { vehicleCapacity } from "@/lib/fleet/capacity";
import {
  buildForemanDayStatuses,
  getAssignmentHumanStatus,
  foremanDayLabel,
  LIVE_WORK_LABEL,
  type ForemanDayStatus,
} from "@/lib/operations/day-status";
import { cn, telHref } from "@/lib/utils";
import { toISODateSafe, parseDateSafe, formatDateStable, formatDateTimeStable } from "@/lib/dates";
import type { Job } from "@/lib/types";

/**
 * Foremen & contractors — the people view of the operational day.
 * SOURCE OF TRUTH: who is working/on job/confirmed comes from the jobs store
 * (assignments) for the selected date via buildForemanDayStatuses — the same
 * selector Operations uses — never from the roster's static status field.
 */

const TONE_CHIP: Record<string, string> = {
  slate: "border-slate-400/40 bg-slate-500/10 text-slate-600 dark:text-slate-300",
  sky: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-300",
  emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  rose: "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-300",
  amber: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300",
};

interface StatusFilter {
  id: string;
  label: string;
  test: (s: ForemanDayStatus) => boolean;
}

const STATUS_FILTERS: StatusFilter[] = [
  { id: "all", label: "All", test: () => true },
  { id: "working", label: "Working today", test: (s) => s.workingToday },
  { id: "scheduled", label: "Scheduled today", test: (s) => s.liveWork === "scheduled" },
  { id: "confirmed", label: "Confirmed", test: (s) => s.workingToday && s.assignment === "Confirmed" },
  {
    id: "not-confirmed",
    label: "Not confirmed",
    test: (s) =>
      s.workingToday &&
      (s.assignment === "Draft" || s.assignment === "Notified" || s.assignment === "Needs Attention"),
  },
  { id: "declined", label: "Declined", test: (s) => s.assignment === "Declined" },
  { id: "needs-update", label: "Update not sent", test: (s) => s.needsUpdateCount > 0 },
  { id: "en-route", label: "En route", test: (s) => s.liveWork === "en_route" },
  { id: "on-job", label: "On job", test: (s) => s.liveWork === "on_job" },
  { id: "available", label: "Available — no job today", test: (s) => !s.workingToday && s.availability === "available" },
  { id: "off-duty", label: "Off duty", test: (s) => s.availability === "break" },
  { id: "offline", label: "Offline", test: (s) => s.availability === "offline" },
  { id: "attention", label: "Needs attention", test: (s) => s.needsAttentionReasons.length > 0 },
];

export default function ForemenPage() {
  const jobs = useJobsStore((s) => s.jobs);
  const vehicles = useFleet((s) => s.vehicles);
  const users = useUsers((s) => s.users);
  const overrides = useForemanAvailability((s) => s.overrides);
  const setAvailability = useForemanAvailability((s) => s.setAvailability);
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const caps = resolveCapabilities(activeRoleId);
  const canManage = activeRoleId === "owner" || activeRoleId === "dispatcher";
  const canSeePayroll = caps.includes("payroll.view_all");

  const [tab, setTab] = useState<"roster" | "directory">("roster");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [docFilter, setDocFilter] = useState("All");
  const [selectedDate, setSelectedDate] = useState(() => toISODateSafe(new Date()));
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reassignJob, setReassignJob] = useState<Job | null>(null);

  const locations = useMemo(
    () => ["All", ...Array.from(new Set(drivers.map((d) => d.currentLocation)))],
    [],
  );
  const [locationFilter, setLocationFilter] = useState("All");

  // One derivation for the whole page — same selector Operations uses.
  const dayStatuses = useMemo(
    () =>
      buildForemanDayStatuses({
        date: selectedDate,
        jobs,
        drivers,
        vehicles,
        users,
        overrides,
      }),
    [selectedDate, jobs, vehicles, users, overrides],
  );

  const searched = useMemo(() => {
    const q = search.toLowerCase();
    return dayStatuses.filter((s) => {
      const d = s.driver;
      if (locationFilter !== "All" && d.currentLocation !== locationFilter) return false;
      if (docFilter === "Valid" && !d.documentsOk) return false;
      if (docFilter === "Expiring" && d.documentsOk) return false;
      if (q) return `${d.name} ${d.vehicleName} ${d.currentLocation} ${d.id}`.toLowerCase().includes(q);
      return true;
    });
  }, [dayStatuses, search, locationFilter, docFilter]);

  const filterCounts = useMemo(
    () => STATUS_FILTERS.map((f) => ({ ...f, count: searched.filter(f.test).length })),
    [searched],
  );

  const filtered = useMemo(() => {
    const f = STATUS_FILTERS.find((x) => x.id === statusFilter) ?? STATUS_FILTERS[0];
    return searched.filter(f.test);
  }, [searched, statusFilter]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Foremen & contractors"
        description="Who is actually working on the selected date — derived from jobs and assignments, not a static roster status. Switch to Directory for the full contact database."
      />

      {/* Tabs + date */}
      <div className="flex flex-col gap-2 rounded-2xl border bg-card p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex overflow-hidden rounded-md border border-border text-xs">
          {(["roster", "directory"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-3 py-1.5 font-semibold capitalize transition-colors",
                tab === t ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-accent/40",
              )}
            >
              {t === "roster" ? "Roster / Today" : "Directory"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setSelectedDate(toISODateSafe(new Date()))}>Today</Button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value && parseDateSafe(e.target.value) ? e.target.value : toISODateSafe(new Date()))}
            className="h-8 rounded-md border border-border bg-background px-2 text-xs"
          />
          <span className="text-xs font-semibold">{formatDateStable(selectedDate)}</span>
        </div>
      </div>

      {/* Search + secondary filters */}
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search foreman, truck, base..." className="h-9 pl-9" />
        </div>
        <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="h-9 rounded-lg border border-input bg-background px-3 text-xs font-medium">
          {locations.map((l) => <option key={l} value={l}>{l === "All" ? "All bases" : l}</option>)}
        </select>
        <select value={docFilter} onChange={(e) => setDocFilter(e.target.value)} className="h-9 rounded-lg border border-input bg-background px-3 text-xs font-medium">
          {["All", "Valid", "Expiring"].map((d) => <option key={d} value={d}>{d === "All" ? "All documents" : `Docs ${d}`}</option>)}
        </select>
      </div>

      {/* Day-status filter chips — counts always match the visible cards. */}
      <div className="flex flex-wrap gap-1">
        {filterCounts.map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id)}
            className={cn(
              "rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
              statusFilter === f.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted",
              f.count === 0 && statusFilter !== f.id && "opacity-50",
            )}
          >
            {f.label} <span className="text-foreground/60">({f.count})</span>
          </button>
        ))}
      </div>

      {tab === "roster" ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((s) => {
            const d = s.driver;
            const human = s.assignmentHuman;
            const truckLabel = s.truck
              ? s.truck.name.split(" - ")[0]
              : s.workingToday
                ? "No truck picked yet"
                : `${d.vehicleName.split(" - ")[0]} (default)`;
            const isOpen = expanded === d.id;
            const avail: Availability = s.availability;
            return (
              <Card key={d.id} className={cn("overflow-hidden", s.assignment === "Declined" && "border-rose-500/50")}>
                <CardContent className="p-4">
                  {/* Header — identity left, two aligned status chips right */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <UserAvatar name={d.name} photoUrl={s.photoUrl} size="lg" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{d.name}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{d.id}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold", TONE_CHIP[s.workingToday ? (human?.tone ?? "slate") : "slate"])}>
                        {foremanDayLabel(s)}
                      </span>
                      <span className={cn("rounded border px-1.5 py-0.5 text-[9px] font-semibold", AVAILABILITY_STYLES[avail])}>
                        {AVAILABILITY_LABEL[avail]}
                      </span>
                    </div>
                  </div>

                  {/* Operational — the selected date's plan */}
                  <div className="mt-3 rounded-lg border border-border/60 bg-muted/20 p-2.5">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {formatDateStable(selectedDate, { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                    {s.workingToday && human ? (
                      <>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <span className={cn("rounded border px-1.5 py-0.5 text-[9px] font-semibold", TONE_CHIP[human.tone])}>
                            {human.label}
                          </span>
                          <span className="text-[11px] font-medium">
                            {s.jobs.length} job{s.jobs.length !== 1 ? "s" : ""}
                          </span>
                          {s.jobs[0] && (
                            <span className="text-[11px] text-muted-foreground">
                              · first at {formatDateTimeStable(s.jobs[0].scheduledAt, { hour: "numeric", minute: "2-digit" })}
                            </span>
                          )}
                          <span className="text-[11px] text-muted-foreground">· {LIVE_WORK_LABEL[s.liveWork]}</span>
                        </div>
                        {(human.detail || human.next) && (
                          <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
                            {human.detail}
                            {human.next && <span className="font-medium text-foreground"> Next: {human.next}</span>}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="mt-1 text-[11px] text-muted-foreground">{foremanDayLabel(s)}.</p>
                    )}
                    {s.needsAttentionReasons.length > 0 && (
                      <p className="mt-1 text-[10px] text-amber-600 dark:text-amber-400">
                        ⚠ {s.needsAttentionReasons.join(" · ")}
                      </p>
                    )}
                  </div>

                  {/* Logistics + compliance */}
                  <dl className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                    <div className="flex items-center gap-1.5 truncate">
                      <Truck className="h-3 w-3 shrink-0 text-muted-foreground" />
                      <span className="truncate">{truckLabel}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
                      <span className="truncate">{d.currentLocation}</span>
                    </div>
                    <div className="text-muted-foreground">
                      Docs:{" "}
                      {d.documentsOk ? <span className="font-medium text-emerald-600">OK</span> : <span className="font-medium text-amber-600">Expiring</span>}
                    </div>
                    <div className="truncate text-muted-foreground">
                      Rating: <span className="font-medium text-foreground">{d.rating}</span>
                    </div>
                  </dl>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t pt-3">
                    <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => setExpanded(isOpen ? null : d.id)}>
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")} />
                      {s.jobs.length} job{s.jobs.length !== 1 ? "s" : ""} this date
                    </Button>
                    <Button asChild size="sm" variant="outline" className="h-7 gap-1 text-xs">
                      <a href={telHref(d.phone)}><Phone className="h-3.5 w-3.5" />Call</a>
                    </Button>
                    {canManage && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline" className="h-7 text-xs">Set availability</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {(["available", "break", "offline"] as Availability[]).map((a) => (
                            <DropdownMenuItem key={a} onClick={() => setAvailability(d.id, a)}>
                              {AVAILABILITY_LABEL[a]}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    {canManage && s.workingToday && (
                      <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                        <Link href={`/operations?tab=assignments&focus=${d.id}`}>Open on board</Link>
                      </Button>
                    )}
                  </div>

                  {isOpen && (
                    <div className="mt-3 space-y-1.5 border-t pt-3">
                      {s.jobs.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-border bg-muted/10 p-3 text-center text-[11px] text-muted-foreground">
                          No jobs on {formatDateStable(selectedDate)}.
                        </p>
                      ) : (
                        s.jobs.map((j) => {
                          const jh = getAssignmentHumanStatus(j.assignment, d.name.split(" ")[0]);
                          return (
                            <div key={j.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border/60 bg-background p-2 text-[11px]">
                              <span className="font-mono font-semibold">{formatDateTimeStable(j.scheduledAt, { hour: "numeric", minute: "2-digit" })}</span>
                              <JobStatusBadge status={j.status} />
                              <span className={cn("rounded border px-1.5 py-0.5 text-[9px] font-semibold", TONE_CHIP[jh.tone])}>
                                {jh.label}
                              </span>
                              <span className="flex-1 truncate font-medium">{j.customer}</span>
                              <span className="truncate text-muted-foreground">{j.pickupCity} → {j.deliveryCity}</span>
                              <div className="flex gap-1">
                                <Button asChild size="sm" variant="ghost" className="h-6 px-2 text-[10px]">
                                  <Link href={`/jobs/${j.id}`}>Open</Link>
                                </Button>
                                {canManage && (
                                  <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => setReassignJob(j)}>
                                    Reassign
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <p className="col-span-full rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">No foremen match these filters.</p>
          )}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Foreman</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Default truck</TableHead>
                <TableHead>Selected date</TableHead>
                <TableHead>Base</TableHead>
                <TableHead className="text-right">Rating</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead className="pr-5"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => {
                const d = s.driver;
                const truck = vehicles.find((v) => v.id === d.vehicleId);
                const cap = truck ? vehicleCapacity(truck) : null;
                return (
                  <TableRow key={d.id} className="hover:bg-accent/30">
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-2">
                        <UserAvatar name={d.name} photoUrl={s.photoUrl} size="sm" />
                        <div>
                          <p className="text-xs font-semibold">{d.name}</p>
                          <p className="font-mono text-[10px] text-muted-foreground">{d.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-[11px]">
                      <p className="flex items-center gap-1"><Phone className="h-3 w-3" />{d.phone}</p>
                      <p className="flex items-center gap-1 text-muted-foreground"><Mail className="h-3 w-3" />{d.email}</p>
                    </TableCell>
                    <TableCell className="text-[11px]">
                      {d.vehicleName.split(" - ")[0]}
                      {cap && <span className="block text-[10px] text-muted-foreground">safe {cap.safe} / max {cap.max} CuFt</span>}
                    </TableCell>
                    <TableCell>
                      <span className={cn("rounded border px-1.5 py-0.5 text-[9px] font-semibold", TONE_CHIP[s.workingToday ? (s.assignmentHuman?.tone ?? "slate") : "slate"])}>
                        {foremanDayLabel(s)}
                      </span>
                    </TableCell>
                    <TableCell className="text-[11px] text-muted-foreground">{d.currentLocation}</TableCell>
                    <TableCell className="text-right text-xs font-semibold">
                      <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{d.rating}</span>
                    </TableCell>
                    <TableCell>
                      {d.documentsOk ? (
                        <Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" />Valid</Badge>
                      ) : (
                        <Badge variant="warning" className="gap-1"><FileWarning className="h-3 w-3" />Expiring</Badge>
                      )}
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      {canSeePayroll ? (
                        <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                          <Link href={`/payroll/foreman/${d.id}`}>Open payroll</Link>
                        </Button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {reassignJob && (
        <ReassignModal
          job={reassignJob}
          open={!!reassignJob}
          onOpenChange={(o) => !o && setReassignJob(null)}
        />
      )}
    </div>
  );
}
