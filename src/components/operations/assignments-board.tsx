"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BellRing,
  CheckCheck,
  CheckCircle2,
  Clock,
  Undo2,
  Wrench,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { drivers } from "@/lib/mock-data";
import { useJobsStore } from "@/lib/store/jobs";
import { useFleet } from "@/lib/store/fleet";
import {
  useForemanAvailability,
  AVAILABILITY_LABEL,
  AVAILABILITY_STYLES,
} from "@/lib/store/foreman-availability";
import { useUsers } from "@/lib/store/users";
import { useActivityLog } from "@/lib/store/activity-log";
import { usePreferences } from "@/lib/store/preferences";
import { getUserByRole } from "@/lib/auth/users";
import { vehicleCapacity, capacityLevel } from "@/lib/fleet/capacity";
import type { ActivityAction, AssignmentStatus, Job } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";

/**
 * Daily Assignment Board (Sprint 2.2) — who works, on what truck, on which
 * jobs, and whether they confirmed. Everything is local demo state:
 * "Notify" sets an in-app status only (no SMS/push/email is ever sent).
 */

const ASSIGN_BADGE: Record<AssignmentStatus, string> = {
  Draft: "border-slate-400/40 bg-slate-500/10 text-slate-600 dark:text-slate-300",
  Notified: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-300",
  Confirmed: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  Declined: "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-300",
  "Needs Attention": "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300",
};

function AssignmentBadge({ status }: { status: AssignmentStatus }) {
  return (
    <span className={cn("rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase", ASSIGN_BADGE[status])}>
      {status}
    </span>
  );
}

export function AssignmentsBoard({
  selectedDate,
  focus,
}: {
  selectedDate: string;
  /** Deep-link target from Alerts: "unassigned" or a foreman id (FM-####). */
  focus?: string | null;
}) {
  const jobs = useJobsStore((s) => s.jobs);
  const assignJobToForeman = useJobsStore((s) => s.assignJobToForeman);
  const unassignJob = useJobsStore((s) => s.unassignJob);
  const assignTruckForDay = useJobsStore((s) => s.assignTruckForDay);
  const setAssignmentForDay = useJobsStore((s) => s.setAssignmentForDay);
  const vehicles = useFleet((s) => s.vehicles);
  const overrides = useForemanAvailability((s) => s.overrides);
  const users = useUsers((s) => s.users);
  const pushActivity = useActivityLog((s) => s.push);
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const actor = getUserByRole(activeRoleId);

  const userByForeman = useMemo(() => {
    const m = new Map<string, (typeof users)[number]>();
    users.forEach((u) => {
      if (u.foremanId) m.set(u.foremanId, u);
    });
    return m;
  }, [users]);

  const dayJobs = useMemo(
    () =>
      jobs.filter(
        (j) => (j.scheduledAt ?? "").slice(0, 10) === selectedDate && j.status !== "Cancelled",
      ),
    [jobs, selectedDate],
  );

  const unassigned = useMemo(
    () =>
      dayJobs
        .filter((j) => !j.driverId || j.status === "Unassigned")
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    [dayJobs],
  );

  const lanes = useMemo(() => {
    return drivers.map((d) => {
      const laneJobs = dayJobs
        .filter((j) => j.driverId === d.id || (!j.driverId && j.driverName === d.name))
        .filter((j) => Boolean(j.driverId) && j.status !== "Unassigned")
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
      const truckId = laneJobs.find((j) => j.truckId)?.truckId;
      const truck = truckId ? vehicles.find((v) => v.id === truckId) : undefined;
      const load = laneJobs.reduce((s, j) => s + j.cuFt, 0);
      const cap = truck ? vehicleCapacity(truck) : undefined;
      const level = truck && laneJobs.length > 0 ? capacityLevel(load, cap!) : null;
      const truckInShop =
        truck && (truck.status === "Maintenance" || truck.status === "Out of Service");

      // Overlapping time windows (start + estimated hours, 4h when unknown).
      const conflictIds = new Set<string>();
      for (let i = 0; i < laneJobs.length - 1; i++) {
        const a = laneJobs[i];
        const b = laneJobs[i + 1];
        const startA = Number(a.scheduledAt.slice(11, 13)) + Number(a.scheduledAt.slice(14, 16)) / 60;
        const startB = Number(b.scheduledAt.slice(11, 13)) + Number(b.scheduledAt.slice(14, 16)) / 60;
        if (startB < startA + (a.hours ?? 4)) {
          conflictIds.add(a.id);
          conflictIds.add(b.id);
        }
      }

      const open = laneJobs.filter((j) => j.status !== "Completed");
      const statuses = open.map((j) => j.assignment?.status ?? "Draft");
      const laneStatus: AssignmentStatus | null =
        laneJobs.length === 0
          ? null
          : statuses.includes("Declined")
            ? "Declined"
            : statuses.includes("Needs Attention")
              ? "Needs Attention"
              : statuses.every((s) => s === "Confirmed")
                ? "Confirmed"
                : statuses.every((s) => s === "Notified" || s === "Confirmed")
                  ? "Notified"
                  : "Draft";
      const declineReason = laneJobs.find((j) => j.assignment?.status === "Declined")
        ?.assignment?.declineReason;

      const override = overrides[d.id];
      const availability =
        override ??
        (d.status === "Offline" ? "offline" : d.status === "Break" ? "break" : "available");
      const off = availability === "offline";
      const linkedUser = userByForeman.get(d.id);
      return {
        d,
        laneJobs,
        truckId,
        truck,
        truckInShop,
        load,
        cap,
        level,
        conflictIds,
        laneStatus,
        declineReason,
        availability,
        off,
        photoUrl: linkedUser?.photoUrl,
        hasPhoto: Boolean(linkedUser?.photoUrl),
      };
    });
  }, [dayJobs, vehicles, overrides, userByForeman]);

  // Confirm-all is blocked while critical assignment gaps remain.
  const criticalIssues = useMemo(() => {
    const issues: string[] = [];
    if (unassigned.length > 0) issues.push(`${unassigned.length} job(s) have no foreman`);
    lanes.forEach((l) => {
      if (l.laneJobs.length === 0) return;
      if (!l.truck) issues.push(`${l.d.name} has no truck for the day`);
      else if (l.truckInShop) issues.push(`${l.d.name}'s truck (${l.truck.name}) is in shop`);
      if (l.off) issues.push(`${l.d.name} is off duty but assigned`);
    });
    return issues;
  }, [lanes, unassigned]);

  const log = (action: ActivityAction, objectId: string, title: string, notes?: string) =>
    pushActivity({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.roleId,
      module: "Dispatch",
      action,
      objectType: "Assignment",
      objectId,
      title,
      notes,
    });

  const handleAssign = (job: Job, foremanId: string) => {
    const f = drivers.find((d) => d.id === foremanId);
    if (!f) return;
    assignJobToForeman(job.id, f.id, f.name);
    log("assigned", job.id, `Job assigned to ${f.name}`, `${selectedDate} · via Assignments board`);
  };

  const handleRemove = (job: Job) => {
    unassignJob(job.id);
    log("updated", job.id, `Job removed from ${job.driverName ?? "foreman"}`, `${selectedDate} · via Assignments board`);
  };

  const handleTruck = (foremanId: string, foremanName: string, truckId: string) => {
    assignTruckForDay(foremanId, selectedDate, truckId || undefined);
    const truckName = vehicles.find((v) => v.id === truckId)?.name;
    log(
      "updated",
      foremanId,
      truckId ? `Truck ${truckName ?? truckId} assigned to ${foremanName}` : `Truck cleared for ${foremanName}`,
      `${selectedDate} · day-level truck assignment`,
    );
  };

  const handleDayStatus = (foremanId: string, foremanName: string, status: AssignmentStatus) => {
    setAssignmentForDay(foremanId, selectedDate, status, { by: actor.name });
    const title =
      status === "Notified"
        ? `${foremanName} notified of day assignment (in-app)`
        : status === "Confirmed"
          ? `Day assignment confirmed for ${foremanName}`
          : `Day assignment set back to draft for ${foremanName}`;
    log("status_changed", foremanId, title, `${selectedDate}`);
  };

  const handleConfirmAll = () => {
    lanes
      .filter((l) => l.laneJobs.length > 0 && l.laneStatus !== "Confirmed")
      .forEach((l) => handleDayStatus(l.d.id, l.d.name, "Confirmed"));
  };

  // Deep-link focus from Alerts: scroll the target lane / panel into view.
  useEffect(() => {
    if (!focus) return;
    const id = focus === "unassigned" ? "assignments-unassigned" : `lane-${focus}`;
    const t = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
    return () => clearTimeout(t);
  }, [focus]);

  // ── Header KPIs (folded from the old Capacity & Load tab) ──
  const kpi = useMemo(() => {
    const assigned = dayJobs.filter((j) => Boolean(j.driverId) && j.status !== "Unassigned");
    const workingLanes = lanes.filter((l) => l.laneJobs.length > 0);
    const foremenAvailable = drivers.filter((d) => {
      const ov = overrides[d.id];
      return ov ? ov !== "offline" : d.status !== "Offline";
    }).length;
    const trucksAvailable = vehicles.filter(
      (v) => v.status === "Active" || v.status === "Idle",
    ).length;
    const trucksAssigned = new Set(workingLanes.map((l) => l.truckId).filter(Boolean)).size;
    const open = assigned.filter((j) => j.status !== "Completed");
    const byStatus = (s: AssignmentStatus) =>
      open.filter((j) => (j.assignment?.status ?? "Draft") === s).length;
    return {
      total: dayJobs.length,
      unassigned: unassigned.length,
      foremenWorking: workingLanes.length,
      foremenAvailable,
      trucksAssigned,
      trucksAvailable,
      overloaded: workingLanes.filter((l) => l.level === "over").length,
      confirmed: byStatus("Confirmed"),
      notified: byStatus("Notified"),
      draft: byStatus("Draft") + byStatus("Needs Attention"),
      declined: byStatus("Declined"),
      openTotal: open.length,
    };
  }, [dayJobs, lanes, unassigned, overrides, vehicles]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">
          Assignments are local demo state — &ldquo;Notify&rdquo; marks an in-app status only,
          no SMS or email is sent.
        </p>
        <div className="flex flex-col items-end gap-1">
          <Button
            size="sm"
            className="gap-1.5 text-xs"
            disabled={criticalIssues.length > 0 || kpi.openTotal === 0 || kpi.confirmed === kpi.openTotal}
            onClick={handleConfirmAll}
          >
            <CheckCheck className="h-3.5 w-3.5" /> Confirm all assignments
          </Button>
          {criticalIssues.length > 0 && (
            <p className="max-w-xs text-right text-[10px] text-rose-500">
              Blocked: {criticalIssues.slice(0, 2).join(" · ")}
              {criticalIssues.length > 2 ? ` · +${criticalIssues.length - 2} more` : ""}
            </p>
          )}
        </div>
      </div>

      {/* KPI strip — folded from Capacity & Load */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi label="Jobs this day" value={String(kpi.total)} />
        <Kpi
          label="Unassigned"
          value={String(kpi.unassigned)}
          tone={kpi.unassigned > 0 ? "danger" : undefined}
          sub={kpi.unassigned > 0 ? "need a foreman" : "all covered"}
        />
        <Kpi label="Foremen working / avail." value={`${kpi.foremenWorking} / ${kpi.foremenAvailable}`} />
        <Kpi
          label="Trucks assigned / avail."
          value={`${kpi.trucksAssigned} / ${kpi.trucksAvailable}`}
          tone={kpi.overloaded > 0 ? "danger" : undefined}
          sub={kpi.overloaded > 0 ? `${kpi.overloaded} over capacity` : "no breaches"}
        />
        <Kpi
          label="Confirmed"
          value={`${kpi.confirmed} / ${kpi.openTotal}`}
          tone={kpi.declined > 0 ? "danger" : kpi.confirmed < kpi.openTotal ? "warn" : undefined}
          sub={`${kpi.notified} notified · ${kpi.draft} draft${kpi.declined > 0 ? ` · ${kpi.declined} declined` : ""}`}
        />
      </div>

      {/* Unassigned jobs */}
      <Card
        id="assignments-unassigned"
        className={cn(
          unassigned.length > 0 && "border-rose-500/40",
          focus === "unassigned" && "ring-2 ring-primary",
        )}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Unassigned jobs — {selectedDate}
            </p>
            <Badge variant={unassigned.length > 0 ? "danger" : "success"} className="text-[9px]">
              {unassigned.length === 0 ? "All assigned" : `${unassigned.length} open`}
            </Badge>
          </div>
          {unassigned.length === 0 ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Every job on this date has a foreman.
            </p>
          ) : (
            <ul className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {unassigned.map((j) => (
                <li key={j.id} className="rounded-xl border border-border/70 bg-background p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold">{j.scheduledAt.slice(11, 16)}</span>
                    <Link href={`/jobs/${j.id}`} className="font-mono text-[10px] text-muted-foreground hover:underline">
                      {j.id}
                    </Link>
                  </div>
                  <p className="mt-1 text-[11px] font-medium">
                    {j.type} · {j.zone} · {j.cuFt} cuft
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">{j.customer}</p>
                  <select
                    className="mt-2 h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                    value=""
                    onChange={(e) => e.target.value && handleAssign(j, e.target.value)}
                  >
                    <option value="">Assign to foreman…</option>
                    {lanes
                      .filter((l) => !l.off)
                      .map((l) => (
                        <option key={l.d.id} value={l.d.id}>
                          {l.d.name} ({l.laneJobs.length} job{l.laneJobs.length === 1 ? "" : "s"})
                        </option>
                      ))}
                  </select>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Foreman lanes */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {lanes.map((l) => (
          <Card
            key={l.d.id}
            id={`lane-${l.d.id}`}
            className={cn(
              l.laneStatus === "Declined" && "border-rose-500/50",
              l.off && l.laneJobs.length > 0 && "border-rose-500/50",
              focus === l.d.id && "ring-2 ring-primary",
            )}
          >
            <CardContent className="p-3">
              <div className="flex items-start gap-2.5">
                <UserAvatar name={l.d.name} photoUrl={l.photoUrl} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{l.d.name}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{l.d.id}</p>
                    </div>
                    <span
                      className={cn(
                        "rounded border px-1.5 py-0.5 text-[9px] font-semibold",
                        AVAILABILITY_STYLES[l.availability],
                      )}
                    >
                      {AVAILABILITY_LABEL[l.availability]}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    {l.laneStatus && <AssignmentBadge status={l.laneStatus} />}
                    {l.laneJobs.length > 0 && !l.hasPhoto && (
                      <Badge variant="warning" className="text-[9px]">No profile photo</Badge>
                    )}
                    {l.off && l.laneJobs.length > 0 && (
                      <Badge variant="danger" className="text-[9px]">Off duty but assigned</Badge>
                    )}
                  </div>
                </div>
              </div>

              {l.declineReason && (
                <p className="mt-2 rounded-md border border-rose-500/40 bg-rose-500/[0.05] px-2 py-1 text-[10px] text-rose-600 dark:text-rose-300">
                  Declined: {l.declineReason}
                </p>
              )}

              {l.laneJobs.length === 0 ? (
                <p className="mt-3 rounded-lg border border-dashed border-border p-3 text-center text-[11px] text-muted-foreground">
                  No jobs this day — assign from the panel above.
                </p>
              ) : (
                <>
                  {/* Truck for the day */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Truck
                    </span>
                    <select
                      className={cn(
                        "h-8 flex-1 rounded-md border bg-background px-2 text-xs",
                        !l.truck ? "border-rose-500/60" : "border-input",
                      )}
                      value={l.truckId ?? ""}
                      onChange={(e) => handleTruck(l.d.id, l.d.name, e.target.value)}
                    >
                      <option value="">— no truck —</option>
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                          {v.status === "Maintenance" || v.status === "Out of Service"
                            ? " · in shop"
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  {l.truckInShop && (
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-rose-500">
                      <Wrench className="h-3 w-3" /> {l.truck?.name} is in shop — pick another truck.
                    </p>
                  )}

                  {/* Load vs capacity */}
                  {l.truck && l.cap && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>Load vs safe capacity</span>
                        <span className="font-mono">
                          {formatNumber(l.load)} / {formatNumber(l.cap.safe)} cuft
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            l.level === "over"
                              ? "bg-rose-500"
                              : l.level === "tight"
                                ? "bg-amber-500"
                                : "bg-emerald-500",
                          )}
                          style={{
                            width: `${Math.min(100, l.cap.safe > 0 ? (l.load / l.cap.safe) * 100 : 0)}%`,
                          }}
                        />
                      </div>
                      {l.level === "over" && (
                        <p className="mt-1 flex items-center gap-1 text-[10px] text-rose-500">
                          <AlertTriangle className="h-3 w-3" /> Over capacity — split the load.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Jobs */}
                  <ul className="mt-2 space-y-1">
                    {l.laneJobs.map((j) => (
                      <li
                        key={j.id}
                        className={cn(
                          "flex items-center gap-2 rounded-md bg-muted px-2 py-1.5 text-[11px]",
                          l.conflictIds.has(j.id) && "ring-1 ring-amber-500/60",
                        )}
                      >
                        <span className="font-mono font-semibold">{j.scheduledAt.slice(11, 16)}</span>
                        <Link href={`/jobs/${j.id}`} className="font-mono text-muted-foreground hover:underline">
                          {j.id}
                        </Link>
                        <span className="min-w-0 flex-1 truncate text-muted-foreground">
                          {j.type} · {j.cuFt} cuft
                        </span>
                        {l.conflictIds.has(j.id) && (
                          <Clock className="h-3 w-3 shrink-0 text-amber-500" aria-label="Time overlap" />
                        )}
                        <AssignmentBadge status={j.assignment?.status ?? "Draft"} />
                        {j.status !== "Completed" && (
                          <button
                            onClick={() => handleRemove(j)}
                            className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-background hover:text-rose-500"
                            aria-label={`Remove ${j.id} from ${l.d.name}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>

                  {/* Day actions — all in-app/local only */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {l.laneStatus !== "Confirmed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1 text-[11px]"
                        onClick={() => handleDayStatus(l.d.id, l.d.name, "Notified")}
                      >
                        <BellRing className="h-3 w-3" /> Notify (in-app)
                      </Button>
                    )}
                    {l.laneStatus !== "Confirmed" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1 text-[11px]"
                        onClick={() => handleDayStatus(l.d.id, l.d.name, "Confirmed")}
                      >
                        <CheckCircle2 className="h-3 w-3" /> Mark confirmed
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1 text-[11px]"
                        onClick={() => handleDayStatus(l.d.id, l.d.name, "Draft")}
                      >
                        <Undo2 className="h-3 w-3" /> Unconfirm
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "danger" | "warn";
}) {
  return (
    <Card
      className={cn(
        "border p-2.5",
        tone === "danger" && "border-rose-500/40 bg-rose-500/[0.04]",
        tone === "warn" && "border-amber-500/40 bg-amber-500/[0.04]",
      )}
    >
      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-mono text-lg font-bold leading-tight">{value}</p>
      {sub && <p className="text-[9px] text-muted-foreground">{sub}</p>}
    </Card>
  );
}
