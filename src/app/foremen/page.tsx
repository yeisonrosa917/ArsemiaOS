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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { DriverStatusBadge } from "@/components/shared/status-badge";
import { JobStatusBadge } from "@/components/shared/status-badge";
import { ReassignModal } from "@/components/jobs/reassign-modal";
import { drivers, jobs } from "@/lib/mock-data";
import { useFleet } from "@/lib/store/fleet";
import {
  useForemanAvailability,
  AVAILABILITY_LABEL,
  AVAILABILITY_STYLES,
  type Availability,
} from "@/lib/store/foreman-availability";
import { usePreferences } from "@/lib/store/preferences";
import { resolveCapabilities } from "@/lib/auth/roles";
import { vehicleCapacity } from "@/lib/fleet/capacity";
import { cn, initials, telHref } from "@/lib/utils";
import { toISODateSafe, parseDateSafe, formatDateStable, formatDateTimeStable } from "@/lib/dates";
import { addDays } from "@/lib/payroll/period";
import type { Job } from "@/lib/types";

function defaultAvailability(status: string): Availability {
  if (status === "Offline") return "offline";
  if (status === "Available" || status === "Idle") return "available";
  return "available";
}

export default function ForemenPage() {
  const vehicles = useFleet((s) => s.vehicles);
  const overrides = useForemanAvailability((s) => s.overrides);
  const setAvailability = useForemanAvailability((s) => s.setAvailability);
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const caps = resolveCapabilities(activeRoleId);
  const canManage = activeRoleId === "owner" || activeRoleId === "dispatcher";
  const canSeePayroll = caps.includes("payroll.view_all");

  const [tab, setTab] = useState<"roster" | "directory">("roster");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [docFilter, setDocFilter] = useState("All");
  const [selectedDate, setSelectedDate] = useState(() => {
    const days = new Set(jobs.map((j) => (j.scheduledAt ?? "").slice(0, 10)));
    const today = toISODateSafe(new Date());
    if (days.has(today)) return today;
    return [...days].filter(Boolean).sort().pop() ?? today;
  });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reassignJob, setReassignJob] = useState<Job | null>(null);

  const locations = useMemo(
    () => ["All", ...Array.from(new Set(drivers.map((d) => d.currentLocation)))],
    [],
  );
  const [locationFilter, setLocationFilter] = useState("All");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return drivers.filter((d) => {
      if (statusFilter !== "All" && d.status !== statusFilter) return false;
      if (locationFilter !== "All" && d.currentLocation !== locationFilter) return false;
      if (docFilter === "Valid" && !d.documentsOk) return false;
      if (docFilter === "Expiring" && d.documentsOk) return false;
      if (q) return `${d.name} ${d.vehicleName} ${d.currentLocation} ${d.id}`.toLowerCase().includes(q);
      return true;
    });
  }, [search, statusFilter, locationFilter, docFilter]);

  const jobsToday = (d: (typeof drivers)[number]) =>
    jobs
      .filter(
        (j) =>
          (j.driverId === d.id || j.driverName === d.name) &&
          (j.scheduledAt ?? "").slice(0, 10) === selectedDate,
      )
      .sort((a, b) => (a.scheduledAt ?? "").localeCompare(b.scheduledAt ?? ""));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Foremen & contractors"
        description="Operational roster — who is working, on which truck, and their jobs for the day. Switch to Directory for the full contact database."
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
        {tab === "roster" && (
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
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search foreman, truck, base..." className="h-9 pl-9" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 rounded-lg border border-input bg-background px-3 text-xs font-medium">
          {["All", "Available", "On Job", "En Route", "Idle", "Offline"].map((s) => <option key={s} value={s}>{s === "All" ? "All statuses" : s}</option>)}
        </select>
        <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="h-9 rounded-lg border border-input bg-background px-3 text-xs font-medium">
          {locations.map((l) => <option key={l} value={l}>{l === "All" ? "All bases" : l}</option>)}
        </select>
        <select value={docFilter} onChange={(e) => setDocFilter(e.target.value)} className="h-9 rounded-lg border border-input bg-background px-3 text-xs font-medium">
          {["All", "Valid", "Expiring"].map((d) => <option key={d} value={d}>{d === "All" ? "All documents" : `Docs ${d}`}</option>)}
        </select>
      </div>

      {tab === "roster" ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((d) => {
            const today = jobsToday(d);
            const nextJob = today.find((j) => j.status !== "Completed") ?? today[0];
            const truck = vehicles.find((v) => v.id === d.vehicleId);
            const avail: Availability = overrides[d.id] ?? defaultAvailability(d.status);
            const isOpen = expanded === d.id;
            return (
              <Card key={d.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback className={cn("text-white", d.avatarColor)}>{initials(d.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">{d.name}</p>
                        <DriverStatusBadge status={d.status} />
                        <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-semibold", AVAILABILITY_STYLES[avail])}>
                          {AVAILABILITY_LABEL[avail]}
                        </span>
                      </div>
                      <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1 truncate"><Truck className="h-3 w-3 shrink-0" />{truck?.name?.split(" - ")[0] ?? d.vehicleName}</span>
                        <span className="flex items-center gap-1 truncate"><MapPin className="h-3 w-3 shrink-0" />{d.currentLocation}</span>
                        <span>Jobs today: <span className="font-semibold text-foreground">{today.length}</span></span>
                        <span>Next: <span className="font-semibold text-foreground">{nextJob ? formatDateTimeStable(nextJob.scheduledAt, { hour: "numeric", minute: "2-digit" }) : "—"}</span></span>
                        <span className="flex items-center gap-1">
                          Docs: {d.documentsOk ? <span className="text-emerald-600">OK</span> : <span className="text-amber-600">Expiring</span>}
                        </span>
                        <span className="truncate">Now: {nextJob ? nextJob.status : "No active job"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => setExpanded(isOpen ? null : d.id)}>
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")} />
                      {today.length} job{today.length !== 1 ? "s" : ""} today
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
                  </div>

                  {isOpen && (
                    <div className="mt-3 space-y-1.5 border-t pt-3">
                      {today.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-border bg-muted/10 p-3 text-center text-[11px] text-muted-foreground">
                          No jobs on {formatDateStable(selectedDate)}.
                        </p>
                      ) : (
                        today.map((j) => (
                          <div key={j.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border/60 bg-background p-2 text-[11px]">
                            <span className="font-mono font-semibold">{formatDateTimeStable(j.scheduledAt, { hour: "numeric", minute: "2-digit" })}</span>
                            <JobStatusBadge status={j.status} />
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
                        ))
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
                <TableHead>Vehicle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Base</TableHead>
                <TableHead className="text-right">Rating</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead className="pr-5"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => {
                const truck = vehicles.find((v) => v.id === d.vehicleId);
                const cap = truck ? vehicleCapacity(truck) : null;
                return (
                  <TableRow key={d.id} className="hover:bg-accent/30">
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7"><AvatarFallback className={cn("text-white text-[10px]", d.avatarColor)}>{initials(d.name)}</AvatarFallback></Avatar>
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
                    <TableCell><DriverStatusBadge status={d.status} /></TableCell>
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
