"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { allJobs as seedJobs } from "@/lib/data/all-jobs";
import { logEvent, type EventContext } from "@/lib/store/activity-log";
import { useFleet } from "@/lib/store/fleet";
import type { AssignmentStatus, EventSource, Job } from "@/lib/types";

export interface PendingReassignment {
  jobId: string;
  fromDriverId?: string;
  fromDriverName?: string;
  toDriverId?: string;
  toDriverName?: string;
  reason?: string;
  stagedAt: string;
  stagedBy: string;
}

/** Extra opts for assignment transitions (actor context + unified events). */
export interface AssignmentOpts {
  by?: string;
  reason?: string;
  /** Who the CONFIRMATION belongs to — foreman via portal vs dispatch on their behalf. */
  source?: "dispatcher" | "foreman";
  actorId?: string;
  actorRole?: string;
}

interface JobsState {
  jobs: Job[];
  pendingReassignments: PendingReassignment[];
  /** Prepend a new job (e.g. created from a lead/quote booking). */
  addJob: (job: Job) => Job;
  getById: (id: string) => Job | undefined;
  updateJob: (id: string, patch: Partial<Job>) => void;
  /** Assignments board (Sprint 2.2) — all local/in-app; no real delivery.
   *  Every mutation below emits its own unified timeline event (Sprint 3) —
   *  callers pass actor context, never write events themselves. */
  assignJobToForeman: (
    jobId: string,
    foremanId: string,
    foremanName: string,
    ctx?: EventContext,
  ) => void;
  unassignJob: (jobId: string, ctx?: EventContext) => void;
  /** Set the truck for ALL of a foreman's jobs on a given day. */
  assignTruckForDay: (
    foremanId: string,
    dayIso: string,
    truckId: string | undefined,
    ctx?: EventContext,
  ) => void;
  /** Batch-transition assignment status for a foreman's jobs on a day. */
  setAssignmentForDay: (
    foremanId: string,
    dayIso: string,
    status: AssignmentStatus,
    opts?: AssignmentOpts,
  ) => void;
  /** Per-job transition (used by the Foreman Portal confirm/decline). */
  setJobAssignment: (jobId: string, status: AssignmentStatus, opts?: AssignmentOpts) => void;
  /** Apply an adjustment delta on the job — increments cuFt and price, records baseline. */
  applyAdjustment: (
    id: string,
    delta: { extraCuFt: number; extraBill: number; adjustmentId: string },
  ) => Job | undefined;
  stageReassignment: (
    id: string,
    toDriverId: string | undefined,
    toDriverName: string | undefined,
    by: string,
    reason?: string,
    ctx?: EventContext,
  ) => PendingReassignment;
  cancelPending: (id: string, ctx?: EventContext) => void;
  confirmPending: (id: string, ctx?: EventContext) => PendingReassignment | undefined;
  confirmAllPending: (ctx?: EventContext) => PendingReassignment[];
  /** Reset to seed data — used in tests and "reset demo data" button. */
  reset: () => void;
}

function truckShort(truckId?: string): string | undefined {
  if (!truckId) return undefined;
  const v = useFleet.getState().vehicles.find((x) => x.id === truckId);
  return v ? v.name.split(" - ")[0] : truckId;
}

/** Map assignment-opts (dispatcher/foreman) onto the unified event source. */
function eventSource(opts?: AssignmentOpts): EventSource {
  return opts?.source === "foreman" ? "foreman_portal" : "owner_web";
}

export const useJobsStore = create<JobsState>()(
  persist(
    (set, get) => ({
      jobs: seedJobs,
      pendingReassignments: [],
      addJob: (job) => {
        set((s) => ({ jobs: [job, ...s.jobs] }));
        return job;
      },
      getById: (id) => get().jobs.find((j) => j.id === id),
      updateJob: (id, patch) =>
        set((s) => ({
          jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)),
        })),
      assignJobToForeman: (jobId, foremanId, foremanName, ctx) => {
        const prev = get().jobs.find((j) => j.id === jobId);
        if (!prev) return;
        const prevName = prev.driverName;
        const isMove = Boolean(prev.driverId) && prev.driverId !== foremanId;
        // If the previous foreman already saw this job (sent/confirmed/
        // declined), the change hasn't reached the new foreman yet.
        const wasSent = prev.assignment && prev.assignment.status !== "Draft";
        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  driverId: foremanId,
                  driverName: foremanName,
                  // The old foreman's truck must not silently follow the job.
                  truckId: isMove ? undefined : j.truckId,
                  status: j.status === "Unassigned" ? "Assigned" : j.status,
                  assignment: wasSent
                    ? {
                        status: "Needs Attention",
                        changeNote: `Moved to ${foremanName} after sending — update not sent yet`,
                      }
                    : { status: "Draft" },
                }
              : j,
          ),
        }));
        logEvent({
          eventType: isMove ? "job_reassigned" : "assignment_drafted",
          message: isMove
            ? wasSent
              ? `Job moved from ${prevName} to ${foremanName} after the day plan was sent. Update not sent yet.`
              : `Job moved from ${prevName} to ${foremanName}.`
            : `Assigned to ${foremanName} — draft, not sent to foreman yet.`,
          action: isMove ? "reassigned" : "assigned",
          linkedType: "job",
          linkedId: jobId,
          notes: ctx?.note,
          ...ctx,
        });
      },
      unassignJob: (jobId, ctx) => {
        const prev = get().jobs.find((j) => j.id === jobId);
        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  driverId: undefined,
                  driverName: undefined,
                  truckId: undefined,
                  status: "Unassigned",
                  assignment: undefined,
                }
              : j,
          ),
        }));
        if (prev)
          logEvent({
            eventType: "job_updated",
            message: `Removed from ${prev.driverName ?? "foreman"} — back to unassigned.`,
            action: "updated",
            linkedType: "job",
            linkedId: jobId,
            notes: ctx?.note,
            ...ctx,
          });
      },
      assignTruckForDay: (foremanId, dayIso, truckId, ctx) => {
        // Capture the affected jobs BEFORE mutating so events can say what changed.
        const affected = get().jobs.filter(
          (j) =>
            j.driverId === foremanId &&
            (j.scheduledAt ?? "").slice(0, 10) === dayIso &&
            j.status !== "Cancelled" &&
            j.status !== "Completed" &&
            j.truckId !== truckId,
        );
        set((s) => ({
          jobs: s.jobs.map((j) => {
            if (j.driverId !== foremanId || (j.scheduledAt ?? "").slice(0, 10) !== dayIso)
              return j;
            if (j.status === "Cancelled" || j.status === "Completed") return j;
            if (j.truckId === truckId) return j;
            // A truck change after the plan was sent/confirmed must be re-sent.
            const wasSent =
              j.assignment &&
              (j.assignment.status === "Notified" || j.assignment.status === "Confirmed");
            return {
              ...j,
              truckId,
              assignment: wasSent
                ? {
                    ...j.assignment!,
                    status: "Needs Attention",
                    changeNote: "Truck changed after sending — update not sent yet",
                  }
                : j.assignment,
            };
          }),
        }));
        const newName = truckShort(truckId);
        affected.forEach((j) => {
          const oldName = truckShort(j.truckId);
          const wasSent =
            j.assignment &&
            (j.assignment.status === "Notified" || j.assignment.status === "Confirmed");
          logEvent({
            eventType: "truck_changed",
            message: truckId
              ? `Truck changed${oldName ? ` from ${oldName}` : ""} to ${newName} for ${j.driverName}'s day (${dayIso}).${wasSent ? " Update not sent yet." : ""}`
              : `Truck ${oldName ?? ""} cleared for ${j.driverName}'s day (${dayIso}).`,
            action: "updated",
            linkedType: "job",
            linkedId: j.id,
            notes: ctx?.note,
            ...ctx,
          });
        });
      },
      setAssignmentForDay: (foremanId, dayIso, status, opts) => {
        const now = new Date().toISOString();
        const affected = get().jobs.filter(
          (j) =>
            j.driverId === foremanId &&
            (j.scheduledAt ?? "").slice(0, 10) === dayIso &&
            j.status !== "Cancelled" &&
            j.status !== "Completed" &&
            (j.assignment?.status ?? "Draft") !== status,
        );
        set((s) => ({
          jobs: s.jobs.map((j) => {
            if (j.driverId !== foremanId || (j.scheduledAt ?? "").slice(0, 10) !== dayIso) return j;
            if (j.status === "Cancelled" || j.status === "Completed") return j;
            return {
              ...j,
              assignment: {
                ...(j.assignment ?? { status: "Draft" }),
                status,
                by: opts?.by ?? j.assignment?.by,
                source: opts?.source ?? j.assignment?.source,
                // (Re)sending delivers any pending change to the foreman.
                ...(status === "Notified" ? { notifiedAt: now, changeNote: undefined } : {}),
                ...(status === "Confirmed" ? { confirmedAt: now, changeNote: undefined } : {}),
                ...(status === "Declined"
                  ? { declinedAt: now, declineReason: opts?.reason }
                  : {}),
              },
            };
          }),
        }));
        affected.forEach((j) => emitAssignmentEvent(j, status, opts));
      },
      setJobAssignment: (jobId, status, opts) => {
        const now = new Date().toISOString();
        const prev = get().jobs.find((j) => j.id === jobId);
        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  assignment: {
                    ...(j.assignment ?? { status: "Draft" }),
                    status,
                    by: opts?.by ?? j.assignment?.by,
                    source: opts?.source ?? j.assignment?.source,
                    ...(status === "Notified" ? { notifiedAt: now, changeNote: undefined } : {}),
                    ...(status === "Confirmed" ? { confirmedAt: now, changeNote: undefined } : {}),
                    ...(status === "Declined"
                      ? { declinedAt: now, declineReason: opts?.reason }
                      : {}),
                  },
                }
              : j,
          ),
        }));
        if (prev && (prev.assignment?.status ?? "Draft") !== status)
          emitAssignmentEvent(prev, status, opts);
      },
      applyAdjustment: (id, delta) => {
        const job = get().jobs.find((j) => j.id === id);
        if (!job) return undefined;
        const baselineCuFt = job.baselineCuFt ?? job.cuFt;
        const baselinePrice = job.baselinePrice ?? job.price;
        const updated: Job = {
          ...job,
          baselineCuFt,
          baselinePrice,
          cuFt: job.cuFt + delta.extraCuFt,
          price: job.price + delta.extraBill,
          commissionableBase:
            (job.commissionableBase ?? job.cuFt * 1.25) + delta.extraBill,
        };
        set((s) => ({
          jobs: s.jobs.map((j) => (j.id === id ? updated : j)),
        }));
        return updated;
      },
      stageReassignment: (id, toDriverId, toDriverName, by, reason, ctx) => {
        const job = get().jobs.find((j) => j.id === id);
        const staged: PendingReassignment = {
          jobId: id,
          fromDriverId: job?.driverId,
          fromDriverName: job?.driverName,
          toDriverId,
          toDriverName,
          reason,
          stagedAt: new Date().toISOString(),
          stagedBy: by,
        };
        set((s) => ({
          pendingReassignments: [
            ...s.pendingReassignments.filter((p) => p.jobId !== id),
            staged,
          ],
        }));
        logEvent({
          eventType: "job_updated",
          message: `Reassignment staged: ${staged.fromDriverName ?? "Unassigned"} → ${toDriverName ?? "Unassigned"}${reason ? ` (reason: ${reason})` : ""} — pending dispatcher confirm.`,
          action: "updated",
          linkedType: "job",
          linkedId: id,
          actorName: ctx?.actorName ?? by,
          actorId: ctx?.actorId,
          actorRole: ctx?.actorRole,
          source: ctx?.source,
        });
        return staged;
      },
      cancelPending: (id, ctx) => {
        const pending = get().pendingReassignments.find((p) => p.jobId === id);
        set((s) => ({
          pendingReassignments: s.pendingReassignments.filter(
            (p) => p.jobId !== id,
          ),
        }));
        if (pending)
          logEvent({
            eventType: "job_updated",
            message: `Pending reassignment cancelled (${pending.fromDriverName ?? "Unassigned"} → ${pending.toDriverName ?? "Unassigned"}).`,
            action: "updated",
            linkedType: "job",
            linkedId: id,
            ...ctx,
          });
      },
      confirmPending: (id, ctx) => {
        const pending = get().pendingReassignments.find((p) => p.jobId === id);
        if (!pending) return undefined;
        set((s) => ({
          pendingReassignments: s.pendingReassignments.filter(
            (p) => p.jobId !== id,
          ),
        }));
        // Route through the SAME lifecycle-aware mutations the Assignments
        // board uses — needs-update flip, truck clearing, and the timeline
        // event all happen there. No more direct driverId writes.
        const note = pending.reason ? `Reason: ${pending.reason}` : undefined;
        if (pending.toDriverId) {
          get().assignJobToForeman(id, pending.toDriverId, pending.toDriverName ?? pending.toDriverId, {
            ...ctx,
            note,
          });
        } else {
          get().unassignJob(id, { ...ctx, note });
        }
        return pending;
      },
      confirmAllPending: (ctx) => {
        const list = [...get().pendingReassignments];
        list.forEach((p) => get().confirmPending(p.jobId, ctx));
        return list;
      },
      reset: () => set({ jobs: seedJobs, pendingReassignments: [] }),
    }),
    {
      // v4 — QA patch: Long Distance seed jobs get real long-distance
      // destinations (was: in-city pairs mislabeled LD).
      // v3 — Sprint 2.2: date re-anchored seed + assignment/truck fields.
      name: "arsemia.jobs.v4",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

/** One place that turns an assignment transition into a human timeline event. */
function emitAssignmentEvent(prevJob: Job, status: AssignmentStatus, opts?: AssignmentOpts) {
  const name = prevJob.driverName ?? "the foreman";
  const prevStatus = prevJob.assignment?.status ?? "Draft";
  const base = {
    linkedType: "job" as const,
    linkedId: prevJob.id,
    actorId: opts?.actorId,
    actorName: opts?.by,
    actorRole: opts?.actorRole,
    source: eventSource(opts),
  };
  switch (status) {
    case "Notified":
      logEvent({
        ...base,
        eventType: prevStatus === "Needs Attention" ? "assignment_update_sent" : "assignment_sent",
        message:
          prevStatus === "Needs Attention"
            ? `Update sent to ${name} (in-app).`
            : `Assignment sent to ${name}'s app (in-app demo) — waiting for confirmation.`,
      });
      break;
    case "Confirmed":
      logEvent({
        ...base,
        eventType:
          opts?.source === "foreman"
            ? "assignment_confirmed_by_foreman"
            : "assignment_confirmed_by_dispatch",
        message:
          opts?.source === "foreman"
            ? `${name} confirmed this assignment from the Foreman Portal.`
            : `Assignment confirmed on ${name}'s behalf by dispatch — not confirmed by the foreman personally.`,
      });
      break;
    case "Declined":
      logEvent({
        ...base,
        eventType: "assignment_declined_by_foreman",
        message: `${name} declined this assignment${opts?.reason ? ` — reason: ${opts.reason}` : ""}.`,
        notes: opts?.reason,
      });
      break;
    case "Draft":
      logEvent({
        ...base,
        eventType: "assignment_unconfirmed",
        message: `Assignment set back to draft for ${name}.`,
      });
      break;
    case "Needs Attention":
      logEvent({
        ...base,
        eventType: "assignment_changed_after_sent",
        message: `Assignment for ${name} changed after sending — update not sent yet.`,
      });
      break;
  }
}
