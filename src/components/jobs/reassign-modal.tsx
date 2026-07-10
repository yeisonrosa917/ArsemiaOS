"use client";

import { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { drivers } from "@/lib/mock-data";
import { useJobsStore as useJobs } from "@/lib/store/jobs";
import { useFleet } from "@/lib/store/fleet";
import { useActivityLog } from "@/lib/store/activity-log";
import { useNotifications } from "@/lib/store/notifications";
import { usePreferences } from "@/lib/store/preferences";
import { getUserByRole } from "@/lib/auth/users";
import { cn, initials } from "@/lib/utils";
import {
  vehicleCapacity,
  capacityLevel,
  capacityMessage,
  CAPACITY_STYLES,
} from "@/lib/fleet/capacity";
import type { Job } from "@/lib/types";

const REASONS = [
  "Running late",
  "Truck issue",
  "Customer rescheduled",
  "Foreman unavailable",
  "Workload balance",
  "Emergency reassignment",
  "Other",
] as const;

type Reason = (typeof REASONS)[number];

export function ReassignModal({
  job,
  open,
  onOpenChange,
}: {
  job: Job;
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const stageReassignment = useJobs((s) => s.stageReassignment);
  const confirmPending = useJobs((s) => s.confirmPending);
  const cancelPending = useJobs((s) => s.cancelPending);
  const pending = useJobs((s) =>
    s.pendingReassignments.find((p) => p.jobId === job.id),
  );

  const pushActivity = useActivityLog((s) => s.push);
  const pushNotif = useNotifications((s) => s.push);
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const actor = getUserByRole(activeRoleId);

  const vehicles = useFleet((s) => s.vehicles);
  const jobs = useJobs((s) => s.jobs);

  // Smart assignment — group foremen by fit for THIS job on its date.
  const jobDay = (job.scheduledAt ?? "").slice(0, 10);
  type FitCat = "recommended" | "available" | "review" | "conflict";
  const grouped = useMemo(() => {
    const g: Record<FitCat, { d: (typeof drivers)[number]; sameDay: number; warnings: string[] }[]> = {
      recommended: [], available: [], review: [], conflict: [],
    };
    drivers
      .filter((d) => d.id !== job.driverId)
      .forEach((d) => {
        const sameDay = jobs.filter(
          (j) => j.id !== job.id && j.driverId === d.id && (j.scheduledAt ?? "").slice(0, 10) === jobDay,
        ).length;
        const truck = vehicles.find((v) => v.id === d.vehicleId);
        const lvl = truck ? capacityLevel(job.cuFt, vehicleCapacity(truck)) : null;
        const warnings: string[] = [];
        let cat: FitCat;
        if (d.status === "Offline") { cat = "conflict"; warnings.push("Off duty"); }
        else if (lvl === "over") { cat = "conflict"; warnings.push("Over truck capacity"); }
        else if (sameDay >= 2) { cat = "review"; warnings.push(`${sameDay} jobs already today`); }
        else if (d.status === "Available" && sameDay === 0) { cat = "recommended"; }
        else { cat = "available"; if (sameDay === 1) warnings.push("1 job today — check timing"); }
        g[cat].push({ d, sameDay, warnings });
      });
    return g;
  }, [jobs, vehicles, job.id, job.driverId, job.cuFt, jobDay]);

  const [nextForemanId, setNextForemanId] = useState<string>("");
  const [reason, setReason] = useState<Reason>("Workload balance");
  const [ackOver, setAckOver] = useState(false);

  const target = drivers.find((d) => d.id === nextForemanId);
  const current = job.driverId
    ? drivers.find((d) => d.id === job.driverId)
    : null;

  const conflicts =
    target?.currentJobId && target.currentJobId !== job.id
      ? `${target.name} already has ${target.currentJobId} in progress.`
      : null;

  // Truck capacity guardrail — compare the job's CuFt against the new foreman's
  // truck. An over-capacity assignment must be explicitly acknowledged.
  const targetTruck = target ? vehicles.find((v) => v.id === target.vehicleId) : null;
  const cap = targetTruck ? vehicleCapacity(targetTruck) : null;
  const capLevel = cap ? capacityLevel(job.cuFt, cap) : null;
  const blockedByCapacity = capLevel === "over" && !ackOver;

  const handleStage = () => {
    if (!target) return;
    stageReassignment(
      job.id,
      target.id,
      target.name,
      actor.name,
      reason,
    );
    pushActivity({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: activeRoleId,
      module: "Dispatch",
      action: "reassigned",
      objectType: "Job",
      objectId: job.id,
      title: `Reassignment staged for ${job.id}`,
      beforeValue: { foreman: current?.name ?? null },
      afterValue: { foreman: target.name, reason },
    });
    pushNotif({
      kind: "job_reassigned",
      severity: "warning",
      title: `Pending reassignment — ${job.id}`,
      body: `${current?.name ?? "Unassigned"} → ${target.name}. Reason: ${reason}.`,
      href: `/jobs/${job.id}`,
    });
  };

  const handleConfirm = () => {
    const p = confirmPending(job.id);
    if (!p) return;
    pushActivity({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: activeRoleId,
      module: "Dispatch",
      action: "reassigned",
      objectType: "Job",
      objectId: job.id,
      title: `Job ${job.id} reassigned`,
      beforeValue: { foreman: p.fromDriverName ?? null },
      afterValue: { foreman: p.toDriverName ?? null, reason: p.reason },
    });
    pushNotif({
      kind: "job_reassigned",
      severity: "info",
      title: `Job ${job.id} reassigned`,
      body: p.toDriverName
        ? `${p.fromDriverName ?? "Unassigned"} → ${p.toDriverName}.`
        : `Unassigned from ${p.fromDriverName ?? "—"}.`,
      href: `/jobs/${job.id}`,
    });
    onOpenChange(false);
  };

  const handleCancelPending = () => {
    cancelPending(job.id);
    pushActivity({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: activeRoleId,
      module: "Dispatch",
      action: "updated",
      objectType: "Job",
      objectId: job.id,
      title: `Pending reassignment cancelled for ${job.id}`,
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm data-[state=open]:animate-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-[640px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-popover shadow-elevated">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <Dialog.Title className="text-base font-semibold">
              Transfer / reassign foreman
            </Dialog.Title>
            <Dialog.Close className="rounded-md p-1 hover:bg-accent">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <div className="space-y-4 p-4">
            <div className="grid items-center gap-2 sm:grid-cols-[1fr_auto_1fr]">
              <ForemanSlot
                label="Current foreman"
                name={current?.name}
                color={current?.avatarColor}
                truck={current?.vehicleName}
              />
              <ArrowRight className="hidden h-4 w-4 text-muted-foreground sm:block" />
              <ForemanSlot
                label="New foreman"
                name={target?.name}
                color={target?.avatarColor}
                truck={target?.vehicleName}
              />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Smart assignment — foremen ranked for this job on {jobDay}
              </p>
              <div className="mt-1 max-h-[240px] space-y-2 overflow-y-auto pr-1">
                {([
                  ["recommended", "Recommended", "text-emerald-600"],
                  ["available", "Available / good fit", "text-sky-600"],
                  ["review", "Possible — review timing", "text-amber-600"],
                  ["conflict", "Not recommended", "text-rose-600"],
                ] as const).map(([cat, label, cls]) =>
                  grouped[cat].length === 0 ? null : (
                    <div key={cat}>
                      <p className={cn("mb-1 text-[10px] font-semibold uppercase tracking-wider", cls)}>{label} ({grouped[cat].length})</p>
                      <div className="space-y-1">
                        {grouped[cat].map(({ d, sameDay, warnings }) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setNextForemanId(d.id)}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left transition-colors",
                              nextForemanId === d.id ? "border-primary bg-primary/10" : "border-border hover:bg-accent/30",
                            )}
                          >
                            <Avatar className="h-7 w-7"><AvatarFallback className="text-[9px]">{initials(d.name)}</AvatarFallback></Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold">{d.name}</span>
                                <span className="font-mono text-[9px] text-muted-foreground">{d.id}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground">{d.status} · {sameDay} job(s) this day</p>
                            </div>
                            <div className="flex shrink-0 flex-wrap justify-end gap-1">
                              {warnings.map((w) => <Badge key={w} variant={cat === "conflict" ? "danger" : "warning"} className="text-[8px]">{w}</Badge>)}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Reason
              </p>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as Reason)}
                className="mt-1 h-10 w-full rounded-md border border-border bg-background px-2 text-sm"
              >
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {conflicts && (
              <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/[0.06] p-2 text-xs text-amber-700">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{conflicts}</span>
              </div>
            )}

            {cap && capLevel && targetTruck && (
              <div className={cn("space-y-2 rounded-md border p-2 text-xs", CAPACITY_STYLES[capLevel])}>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{capacityMessage(job.cuFt, cap, targetTruck.name)}</span>
                </div>
                {capLevel === "over" && (
                  <label className="flex items-center gap-2 font-semibold">
                    <input
                      type="checkbox"
                      checked={ackOver}
                      onChange={(e) => setAckOver(e.target.checked)}
                    />
                    I understand this exceeds truck capacity and want to proceed
                    anyway.
                  </label>
                )}
              </div>
            )}

            {pending ? (
              <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/[0.04] p-3">
                <p className="text-xs font-semibold">
                  Pending reassignment staged
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {pending.fromDriverName ?? "Unassigned"} →{" "}
                  {pending.toDriverName ?? "Unassigned"} · Reason:{" "}
                  {pending.reason ?? "—"} · Staged by {pending.stagedBy}
                </p>
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={handleCancelPending}>
                    Cancel pending
                  </Button>
                  <Button size="sm" onClick={handleConfirm}>
                    Confirm reassignment
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleStage} disabled={!target || blockedByCapacity}>
                  Stage reassignment
                </Button>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground">
              Staging records the proposed change without altering the job.
              Confirmation writes the new foreman + activity log + notification.
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ForemanSlot({
  label,
  name,
  color,
  truck,
}: {
  label: string;
  name?: string;
  color?: string;
  truck?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {name ? (
        <div className="mt-1 flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className={cn("text-white text-[10px]", color)}>
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{name}</p>
            {truck && (
              <p className="truncate text-[10px] text-muted-foreground">{truck}</p>
            )}
          </div>
        </div>
      ) : (
        <Badge variant="slate" className="mt-1">
          Unassigned
        </Badge>
      )}
    </div>
  );
}
