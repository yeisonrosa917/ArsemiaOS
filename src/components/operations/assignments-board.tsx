"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRightLeft,
  BellRing,
  CheckCircle2,
  Clock,
  Send,
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
import { usePreferences } from "@/lib/store/preferences";
import { getUserByRole } from "@/lib/auth/users";
import { capacityLevel } from "@/lib/fleet/capacity";
import {
  buildForemanDayStatuses,
  buildAssignmentDaySummary,
  getAvailableTrucksForDate,
  getAssignmentHumanStatus,
  type ForemanDayStatus,
} from "@/lib/operations/day-status";
import type { Job } from "@/lib/types";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

/**
 * Daily Dispatch Control Board (Sprint 2.2 + QA patch). Four human areas:
 * Day Plan header · Unassigned jobs · Foreman lanes · Trucks for the day.
 * All state is local demo data — "Send" marks in-app status only, no real
 * SMS/push/email ever leaves the browser.
 */

const TONE_CHIP: Record<string, string> = {
  slate: "border-slate-400/40 bg-slate-500/10 text-slate-600 dark:text-slate-300",
  sky: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-300",
  emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  rose: "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-300",
  amber: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300",
};

function LifecycleChip({ label, tone }: { label: string; tone: string }) {
  return (
    <span className={cn("rounded border px-1.5 py-0.5 text-[9px] font-semibold", TONE_CHIP[tone])}>
      {label}
    </span>
  );
}

const IN_PROGRESS = new Set(["En Route", "Pickup Started", "Pickup Completed", "Delivery Started"]);

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
  const setJobAssignment = useJobsStore((s) => s.setJobAssignment);
  const vehicles = useFleet((s) => s.vehicles);
  const overrides = useForemanAvailability((s) => s.overrides);
  const users = useUsers((s) => s.users);
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const actor = getUserByRole(activeRoleId);
  // Actor context passed into store mutations — the store writes the
  // unified timeline events itself (Sprint 3); this board never dual-logs.
  const ctx = {
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.roleId,
    source: "owner_web" as const,
  };

  const [movingJobId, setMovingJobId] = useState<string | null>(null);

  const lanes = useMemo(
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

  const summary = useMemo(
    () => buildAssignmentDaySummary({ date: selectedDate, jobs }),
    [selectedDate, jobs],
  );

  const unassigned = useMemo(
    () =>
      jobs
        .filter(
          (j) =>
            (j.scheduledAt ?? "").slice(0, 10) === selectedDate &&
            j.status !== "Cancelled" &&
            (!j.driverId || j.status === "Unassigned"),
        )
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    [jobs, selectedDate],
  );

  // Critical conflicts that a dispatcher must resolve before the day is safe.
  const critical = useMemo(() => {
    const issues: string[] = [];
    if (summary.unassigned > 0) issues.push(`${summary.unassigned} job(s) have no foreman`);
    lanes.forEach((l) => {
      if (!l.workingToday) return;
      if (!l.truck) issues.push(`${l.name} has no truck for the day`);
      else if (l.truckInShop) issues.push(`${l.name}'s truck (${l.truck.name.split(" - ")[0]}) is in shop`);
      if (l.availability === "offline") issues.push(`${l.name} is off duty but assigned`);
      if (l.level === "over") issues.push(`${l.name}'s truck is over capacity`);
    });
    return issues;
  }, [lanes, summary.unassigned]);

  const sendable = summary.draft + summary.needsUpdate;

  /* ── actions — every mutation writes its own timeline event in the store ── */

  const handleAssign = (job: Job, foremanId: string) => {
    const lane = lanes.find((l) => l.foremanId === foremanId);
    if (!lane) return;
    assignJobToForeman(job.id, lane.foremanId, lane.name, ctx);

    // Suggest the foreman's default truck automatically: apply it when the
    // lane has no truck yet and the default is actually usable today.
    if (!lane.truck && lane.defaultTruckId) {
      const options = getAvailableTrucksForDate({
        date: selectedDate,
        jobs,
        vehicles,
        drivers,
        foremanId: lane.foremanId,
        loadCuFt: lane.load + job.cuFt,
      });
      const def = options.find((o) => o.vehicle.id === lane.defaultTruckId);
      if (def && (def.kind === "suggested" || def.kind === "good" || def.kind === "current")) {
        assignTruckForDay(lane.foremanId, selectedDate, lane.defaultTruckId, {
          ...ctx,
          note: "Default truck auto-suggested",
        });
      }
    }
  };

  const handleMove = (job: Job, target: ForemanDayStatus) => {
    assignJobToForeman(job.id, target.foremanId, target.name, ctx);
    setMovingJobId(null);
  };

  const handleRemove = (job: Job) => {
    unassignJob(job.id, ctx);
  };

  const handleTruck = (lane: ForemanDayStatus, truckId: string) => {
    assignTruckForDay(lane.foremanId, selectedDate, truckId || undefined, ctx);
  };

  /** Send drafts + unsent changes for one lane (in-app only). */
  const sendLane = (lane: ForemanDayStatus) => {
    lane.jobs
      .filter((j) => {
        const s = j.assignment?.status ?? "Draft";
        return j.status !== "Completed" && (s === "Draft" || s === "Needs Attention");
      })
      .forEach((j) => {
        setJobAssignment(j.id, "Notified", {
          by: actor.name,
          source: "dispatcher",
          actorId: actor.id,
          actorRole: actor.roleId,
        });
      });
  };

  const sendJobUpdate = (job: Job) => {
    setJobAssignment(job.id, "Notified", {
      by: actor.name,
      source: "dispatcher",
      actorId: actor.id,
      actorRole: actor.roleId,
    });
  };

  const confirmOnBehalf = (lane: ForemanDayStatus) => {
    setAssignmentForDay(lane.foremanId, selectedDate, "Confirmed", {
      by: actor.name,
      source: "dispatcher",
      actorId: actor.id,
      actorRole: actor.roleId,
    });
  };

  const unconfirm = (lane: ForemanDayStatus) => {
    setAssignmentForDay(lane.foremanId, selectedDate, "Draft", {
      by: actor.name,
      source: "dispatcher",
      actorId: actor.id,
      actorRole: actor.roleId,
    });
  };

  const publishDayPlan = () => {
    lanes.filter((l) => l.workingToday).forEach(sendLane);
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

  const workingLanes = lanes.filter((l) => l.workingToday);
  const benchLanes = lanes.filter((l) => !l.workingToday);

  return (
    <div className="space-y-4">
      {/* ── 1. Day Plan header ── */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold">Day plan — {selectedDate}</p>
              <p className="text-[11px] text-muted-foreground">
                Local demo state — &ldquo;send&rdquo; marks an in-app status only; no SMS or email leaves the browser.
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <PlanChip label="Jobs" value={summary.totalJobs} />
                <PlanChip label="Unassigned" value={summary.unassigned} tone={summary.unassigned > 0 ? "rose" : "emerald"} />
                <PlanChip label="Draft — not sent" value={summary.draft} tone={summary.draft > 0 ? "slate" : undefined} />
                <PlanChip label="Sent to app" value={summary.sent} tone={summary.sent > 0 ? "sky" : undefined} />
                <PlanChip label="Confirmed" value={summary.confirmed} tone="emerald" />
                <PlanChip label="Declined" value={summary.declined} tone={summary.declined > 0 ? "rose" : undefined} />
                <PlanChip label="Update not sent" value={summary.needsUpdate} tone={summary.needsUpdate > 0 ? "amber" : undefined} />
                <PlanChip label="Critical conflicts" value={critical.length} tone={critical.length > 0 ? "rose" : "emerald"} />
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Button
                size="sm"
                className="gap-1.5 text-xs"
                disabled={sendable === 0}
                onClick={publishDayPlan}
                title={
                  sendable === 0
                    ? "Nothing to send — every assignment is already sent or confirmed."
                    : `Sends ${summary.draft} draft(s) and ${summary.needsUpdate} unsent change(s) to their foremen (in-app).`
                }
              >
                <Send className="h-3.5 w-3.5" /> Send day plan{sendable > 0 ? ` (${sendable})` : ""}
              </Button>
              {critical.length > 0 && (
                <p className="max-w-xs text-right text-[10px] text-rose-500">
                  Fix first: {critical.slice(0, 2).join(" · ")}
                  {critical.length > 2 ? ` · +${critical.length - 2} more` : ""}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Unassigned jobs ── */}
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
              Unassigned jobs
            </p>
            <Badge variant={unassigned.length > 0 ? "danger" : "success"} className="text-[9px]">
              {unassigned.length === 0 ? "All covered" : `${unassigned.length} need a foreman`}
            </Badge>
          </div>
          {unassigned.length === 0 ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Every job on this date has a foreman.
            </p>
          ) : (
            <ul className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {unassigned.map((j) => (
                <UnassignedJobCard key={j.id} job={j} lanes={lanes} onAssign={handleAssign} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* ── 3. Foreman lanes ── */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Working this day ({workingLanes.length})
        </p>
        {workingLanes.length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">
            Nobody is assigned on this date yet — start from the unassigned jobs above.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {workingLanes.map((l) => (
              <ForemanLane
                key={l.foremanId}
                lane={l}
                lanes={lanes}
                focus={focus}
                selectedDate={selectedDate}
                jobs={jobs}
                movingJobId={movingJobId}
                setMovingJobId={setMovingJobId}
                onMove={handleMove}
                onRemove={handleRemove}
                onTruck={handleTruck}
                onSendLane={sendLane}
                onSendJobUpdate={sendJobUpdate}
                onConfirmOnBehalf={confirmOnBehalf}
                onUnconfirm={unconfirm}
              />
            ))}
          </div>
        )}

        <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Not working this day ({benchLanes.length})
        </p>
        <div className="flex flex-wrap gap-2">
          {benchLanes.map((l) => (
            <div
              key={l.foremanId}
              id={`lane-${l.foremanId}`}
              className={cn(
                "flex items-center gap-2 rounded-xl border border-border/70 bg-card px-2.5 py-1.5",
                focus === l.foremanId && "ring-2 ring-primary",
              )}
            >
              <UserAvatar name={l.name} photoUrl={l.photoUrl} size="sm" />
              <div>
                <p className="text-xs font-semibold leading-tight">{l.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {l.availability === "offline"
                    ? "Offline — no job today"
                    : l.availability === "break"
                      ? "Off duty — no job today"
                      : "Available — no job today"}
                </p>
              </div>
              <span
                className={cn(
                  "ml-1 rounded border px-1.5 py-0.5 text-[9px] font-semibold",
                  AVAILABILITY_STYLES[l.availability],
                )}
              >
                {AVAILABILITY_LABEL[l.availability]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Trucks for the day ── */}
      <TrucksToday lanes={lanes} selectedDate={selectedDate} />
    </div>
  );
}

/* ────────────────────────────── pieces ────────────────────────────── */

function PlanChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "rose" | "amber" | "sky" | "emerald" | "slate";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
        tone ? TONE_CHIP[tone] : "border-border text-muted-foreground",
      )}
    >
      <span className="font-mono font-bold">{value}</span> {label}
    </span>
  );
}

function UnassignedJobCard({
  job,
  lanes,
  onAssign,
}: {
  job: Job;
  lanes: ForemanDayStatus[];
  onAssign: (job: Job, foremanId: string) => void;
}) {
  const candidates = lanes.filter((l) => l.availability !== "offline");
  return (
    <li className="flex flex-col rounded-xl border border-border/70 bg-background p-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="font-mono text-xs font-bold">{job.scheduledAt.slice(11, 16)}</span>
          <Link href={`/jobs/${job.id}`} className="font-mono text-[10px] text-muted-foreground hover:underline">
            {job.id}
          </Link>
        </div>
        <LifecycleChip label="Unassigned" tone="rose" />
      </div>
      <p className="mt-1 truncate text-xs font-semibold">{job.customer}</p>
      <p className="truncate text-[11px] text-muted-foreground">
        {(job.pickupCity || job.pickup) ?? "—"} → {(job.deliveryCity || job.delivery) ?? "—"}
      </p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">
        {job.type}
        {job.zone ? ` · ${job.zone}` : ""} · {job.cuFt} cuft · {job.miles} mi ·{" "}
        <span className="font-semibold text-foreground">{formatCurrency(job.price)}</span>
      </p>
      <p className="mt-1 text-[10px] text-rose-500">Needs a foreman — no foreman means no truck either.</p>
      <div className="mt-2 flex items-center gap-1.5">
        <select
          className="h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-xs"
          value=""
          onChange={(e) => e.target.value && onAssign(job, e.target.value)}
        >
          <option value="">Assign to…</option>
          {candidates.map((l) => (
            <option key={l.foremanId} value={l.foremanId}>
              {l.name} — {l.jobs.length === 0 ? "free today" : `${l.jobs.length} job${l.jobs.length === 1 ? "" : "s"}`}
            </option>
          ))}
        </select>
        <Button asChild size="sm" variant="outline" className="h-8 shrink-0 text-xs">
          <Link href={`/jobs/${job.id}`}>View job</Link>
        </Button>
      </div>
    </li>
  );
}

function jobStart(j: Job): number {
  return Number(j.scheduledAt.slice(11, 13)) + Number(j.scheduledAt.slice(14, 16)) / 60;
}

/** Honest warnings shown BEFORE moving a job onto another foreman's day. */
function moveWarnings(job: Job, target: ForemanDayStatus): string[] {
  const w: string[] = [];
  if (target.availability === "offline") w.push("off duty");
  else if (target.availability === "break") w.push("on break");
  const s = jobStart(job);
  const e = s + (job.hours ?? 4);
  if (target.jobs.some((t) => {
    const ts = jobStart(t);
    return ts < e && s < ts + (t.hours ?? 4);
  }))
    w.push("time conflict");
  if (target.truckInShop) w.push("truck in shop");
  else if (target.truck && target.cap) {
    if (capacityLevel(target.load + job.cuFt, target.cap) === "over") w.push("truck too small");
  } else if (target.workingToday) {
    w.push("no truck yet");
  }
  if (target.assignment === "Notified" || target.assignment === "Confirmed")
    w.push("day already sent — will need update");
  return w;
}

function ForemanLane({
  lane,
  lanes,
  focus,
  selectedDate,
  jobs,
  movingJobId,
  setMovingJobId,
  onMove,
  onRemove,
  onTruck,
  onSendLane,
  onSendJobUpdate,
  onConfirmOnBehalf,
  onUnconfirm,
}: {
  lane: ForemanDayStatus;
  lanes: ForemanDayStatus[];
  focus?: string | null;
  selectedDate: string;
  jobs: Job[];
  movingJobId: string | null;
  setMovingJobId: (id: string | null) => void;
  onMove: (job: Job, target: ForemanDayStatus) => void;
  onRemove: (job: Job) => void;
  onTruck: (lane: ForemanDayStatus, truckId: string) => void;
  onSendLane: (lane: ForemanDayStatus) => void;
  onSendJobUpdate: (job: Job) => void;
  onConfirmOnBehalf: (lane: ForemanDayStatus) => void;
  onUnconfirm: (lane: ForemanDayStatus) => void;
}) {
  const vehicles = useFleet((s) => s.vehicles);
  const truckOptions = useMemo(
    () =>
      getAvailableTrucksForDate({
        date: selectedDate,
        jobs,
        vehicles,
        drivers,
        foremanId: lane.foremanId,
        loadCuFt: lane.load,
      }),
    [selectedDate, jobs, vehicles, lane.foremanId, lane.load],
  );

  const human = lane.assignmentHuman;
  const sendableJobs = lane.jobs.filter((j) => {
    const s = j.assignment?.status ?? "Draft";
    return j.status !== "Completed" && (s === "Draft" || s === "Needs Attention");
  });

  return (
    <Card
      id={`lane-${lane.foremanId}`}
      className={cn(
        lane.assignment === "Declined" && "border-rose-500/50",
        lane.availability === "offline" && "border-rose-500/50",
        focus === lane.foremanId && "ring-2 ring-primary",
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2.5">
          <UserAvatar name={lane.name} photoUrl={lane.photoUrl} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{lane.name}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{lane.foremanId}</p>
              </div>
              <span
                className={cn(
                  "rounded border px-1.5 py-0.5 text-[9px] font-semibold",
                  AVAILABILITY_STYLES[lane.availability],
                )}
              >
                {AVAILABILITY_LABEL[lane.availability]}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1">
              {human && <LifecycleChip label={human.label} tone={human.tone} />}
              {!lane.hasPhoto && <Badge variant="warning" className="text-[9px]">No profile photo</Badge>}
              {lane.availability === "offline" && (
                <Badge variant="danger" className="text-[9px]">Off duty but assigned</Badge>
              )}
            </div>
          </div>
        </div>

        {/* What this status means + what's next */}
        {human && (human.detail || human.next) && (
          <p className="mt-2 text-[10px] leading-snug text-muted-foreground">
            {human.detail}
            {human.next && <span className="font-medium text-foreground"> Next: {human.next}</span>}
          </p>
        )}

        {/* Declined — who, when, why, and what to do about it */}
        {lane.assignment === "Declined" && (
          <div className="mt-2 rounded-md border border-rose-500/40 bg-rose-500/[0.05] p-2">
            <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-300">
              {lane.name} declined{lane.declinedAt ? ` at ${lane.declinedAt.slice(11, 16)}` : ""}
            </p>
            {lane.declineReason && (
              <p className="text-[10px] text-rose-600/90 dark:text-rose-300/90">Reason: {lane.declineReason}</p>
            )}
            <p className="mt-1 text-[10px] text-muted-foreground">
              Next action: move the job to another foreman, change the truck, or call to resolve.
            </p>
          </div>
        )}

        {/* Truck for the day — suggested first, hints on every option */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Truck</span>
          <select
            className={cn(
              "h-8 min-w-0 flex-1 rounded-md border bg-background px-2 text-xs",
              !lane.truck ? "border-rose-500/60" : "border-input",
            )}
            value={lane.truckId ?? ""}
            onChange={(e) => onTruck(lane, e.target.value)}
          >
            <option value="">— no truck picked —</option>
            {truckOptions.map((o) => (
              <option key={o.vehicle.id} value={o.vehicle.id} disabled={o.kind === "blocked"}>
                {o.kind === "current" ? "✓ " : o.kind === "suggested" ? "★ " : o.kind === "blocked" ? "✕ " : o.kind === "conflict" || o.kind === "warning" ? "⚠ " : ""}
                {o.vehicle.name.split(" - ")[0]} — {o.hint}
              </option>
            ))}
          </select>
        </div>
        {!lane.truck && (
          <p className="mt-1 text-[10px] text-rose-500">
            No truck picked. {truckOptions.find((o) => o.kind === "suggested") ? `Suggested: ${truckOptions.find((o) => o.kind === "suggested")!.vehicle.name.split(" - ")[0]} (${lane.name.split(" ")[0]}'s default).` : "Their default truck is unavailable today — pick another."}
          </p>
        )}
        {lane.truckInShop && (
          <p className="mt-1 flex items-center gap-1 text-[10px] text-rose-500">
            <Wrench className="h-3 w-3" /> {lane.truck?.name.split(" - ")[0]} is in shop — pick another truck.
          </p>
        )}

        {/* Load vs capacity */}
        {lane.truck && lane.cap && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Load vs safe capacity</span>
              <span className="font-mono">
                {formatNumber(lane.load)} / {formatNumber(lane.cap.safe)} cuft
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full",
                  lane.level === "over" ? "bg-rose-500" : lane.level === "tight" ? "bg-amber-500" : "bg-emerald-500",
                )}
                style={{ width: `${Math.min(100, lane.cap.safe > 0 ? (lane.load / lane.cap.safe) * 100 : 0)}%` }}
              />
            </div>
            {lane.level === "over" && (
              <p className="mt-1 flex items-center gap-1 text-[10px] text-rose-500">
                <AlertTriangle className="h-3 w-3" /> Over capacity — move a job or pick a bigger truck.
              </p>
            )}
          </div>
        )}

        {/* Jobs */}
        <ul className="mt-2 space-y-1">
          {lane.jobs.map((j) => {
            const jh = getAssignmentHumanStatus(j.assignment, lane.name.split(" ")[0]);
            const moving = movingJobId === j.id;
            const inProgress = IN_PROGRESS.has(j.status);
            return (
              <li key={j.id}>
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-md bg-muted px-2 py-1.5 text-[11px]",
                    lane.conflictIds.has(j.id) && "ring-1 ring-amber-500/60",
                  )}
                >
                  <span className="font-mono font-semibold">{j.scheduledAt.slice(11, 16)}</span>
                  <Link href={`/jobs/${j.id}`} className="font-mono text-muted-foreground hover:underline">
                    {j.id}
                  </Link>
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">
                    {j.customer} · {j.cuFt} cuft
                  </span>
                  {lane.conflictIds.has(j.id) && (
                    <Clock className="h-3 w-3 shrink-0 text-amber-500" aria-label="Time overlap" />
                  )}
                  <LifecycleChip label={jh.label} tone={jh.tone} />
                  {j.status !== "Completed" && (
                    <>
                      <button
                        onClick={() => setMovingJobId(moving ? null : j.id)}
                        className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-background hover:text-primary"
                        aria-label={`Move ${j.id} to another foreman`}
                        title="Move to another foreman"
                      >
                        <ArrowRightLeft className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => onRemove(j)}
                        className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-background hover:text-rose-500"
                        aria-label={`Remove ${j.id} from ${lane.name}`}
                        title="Remove from this foreman"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>
                {j.assignment?.status === "Needs Attention" && j.status !== "Completed" && (
                  <div className="mt-0.5 flex items-center justify-between gap-2 rounded-md border border-amber-500/40 bg-amber-500/[0.05] px-2 py-1">
                    <span className="text-[10px] text-amber-600 dark:text-amber-300">
                      {j.assignment.changeNote ?? "Changed after sending — foreman has not seen this."}
                    </span>
                    <Button size="sm" variant="outline" className="h-6 shrink-0 gap-1 px-2 text-[10px]" onClick={() => onSendJobUpdate(j)}>
                      <Send className="h-3 w-3" /> Send update
                    </Button>
                  </div>
                )}
                {moving && (
                  <div className="mt-1 rounded-md border border-border bg-background p-2">
                    <p className="text-[10px] font-semibold text-muted-foreground">
                      Move {j.id} to:
                      {inProgress && (
                        <span className="ml-1 text-rose-500">this job is already in progress — the customer may need a call.</span>
                      )}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {lanes
                        .filter((t) => t.foremanId !== lane.foremanId)
                        .map((t) => {
                          const warns = moveWarnings(j, t);
                          return (
                            <button
                              key={t.foremanId}
                              onClick={() => onMove(j, t)}
                              className={cn(
                                "rounded-md border px-2 py-1 text-left text-[10px] transition-colors hover:bg-accent/40",
                                warns.length > 0 ? "border-amber-500/50" : "border-emerald-500/50",
                              )}
                            >
                              <span className="font-semibold">{t.name}</span>
                              <span className="text-muted-foreground"> · {t.jobs.length} job{t.jobs.length === 1 ? "" : "s"}</span>
                              {warns.length > 0 && (
                                <span className="block text-amber-600 dark:text-amber-400">⚠ {warns.join(" · ")}</span>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* Day actions — all in-app/local only */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {sendableJobs.length > 0 && (
            <Button size="sm" variant="outline" className="h-7 gap-1 text-[11px]" onClick={() => onSendLane(lane)}>
              <BellRing className="h-3 w-3" />
              {lane.needsUpdateCount > 0 ? "Send update" : "Send to foreman"} ({sendableJobs.length})
            </Button>
          )}
          {lane.assignment !== "Confirmed" ? (
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-[11px]"
              title="Marks the day confirmed on the foreman's behalf — not the same as the foreman accepting."
              onClick={() => onConfirmOnBehalf(lane)}
            >
              <CheckCircle2 className="h-3 w-3" /> Confirm on behalf
            </Button>
          ) : (
            <Button size="sm" variant="ghost" className="h-7 gap-1 text-[11px]" onClick={() => onUnconfirm(lane)}>
              <Undo2 className="h-3 w-3" /> Unconfirm
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TrucksToday({
  lanes,
  selectedDate,
}: {
  lanes: ForemanDayStatus[];
  selectedDate: string;
}) {
  const vehicles = useFleet((s) => s.vehicles);
  const rows = useMemo(() => {
    const holders = new Map<string, string[]>();
    lanes.forEach((l) => {
      if (l.truckId) holders.set(l.truckId, [...(holders.get(l.truckId) ?? []), l.name]);
    });
    return vehicles.map((v) => {
      const inShop = v.status === "Maintenance" || v.status === "Out of Service";
      const who = holders.get(v.id) ?? [];
      return { v, inShop, who };
    });
  }, [vehicles, lanes]);

  const inUse = rows.filter((r) => r.who.length > 0).length;
  const free = rows.filter((r) => !r.inShop && r.who.length === 0).length;
  const shop = rows.filter((r) => r.inShop).length;

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Trucks — {selectedDate}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {inUse} in use · {free} free · {shop} in shop ·{" "}
            <Link href="/operations?tab=alerts" className="text-primary hover:underline">
              see everything that needs attention →
            </Link>
          </p>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {rows.map(({ v, inShop, who }) => (
            <Link
              key={v.id}
              href={`/fleet/${v.id}`}
              className={cn(
                "rounded-md border px-2 py-1 text-[10px] transition-colors hover:bg-accent/40",
                inShop
                  ? "border-rose-500/40 bg-rose-500/[0.05] text-rose-600 dark:text-rose-300"
                  : who.length > 0
                    ? "border-sky-500/40 bg-sky-500/[0.05] text-sky-700 dark:text-sky-300"
                    : "border-emerald-500/40 bg-emerald-500/[0.05] text-emerald-700 dark:text-emerald-300",
              )}
            >
              <span className="font-semibold">{v.name.split(" - ")[0]}</span>{" "}
              {inShop ? `— in shop (${v.status.toLowerCase()})` : who.length > 0 ? `— ${who.join(", ")}` : "— free"}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
