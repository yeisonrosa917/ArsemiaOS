"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { allJobs as seedJobs } from "@/lib/data/all-jobs";
import type { AssignmentStatus, Job } from "@/lib/types";

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

interface JobsState {
  jobs: Job[];
  pendingReassignments: PendingReassignment[];
  /** Prepend a new job (e.g. created from a lead/quote booking). */
  addJob: (job: Job) => Job;
  getById: (id: string) => Job | undefined;
  updateJob: (id: string, patch: Partial<Job>) => void;
  /** Assignments board (Sprint 2.2) — all local/in-app; no real delivery. */
  assignJobToForeman: (jobId: string, foremanId: string, foremanName: string) => void;
  unassignJob: (jobId: string) => void;
  /** Set the truck for ALL of a foreman's jobs on a given day. */
  assignTruckForDay: (foremanId: string, dayIso: string, truckId: string | undefined) => void;
  /** Batch-transition assignment status for a foreman's jobs on a day. */
  setAssignmentForDay: (
    foremanId: string,
    dayIso: string,
    status: AssignmentStatus,
    opts?: { by?: string; reason?: string; source?: "dispatcher" | "foreman" },
  ) => void;
  /** Per-job transition (used by the Foreman Portal confirm/decline). */
  setJobAssignment: (
    jobId: string,
    status: AssignmentStatus,
    opts?: { by?: string; reason?: string; source?: "dispatcher" | "foreman" },
  ) => void;
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
  ) => PendingReassignment;
  cancelPending: (id: string) => void;
  confirmPending: (id: string) => PendingReassignment | undefined;
  confirmAllPending: () => PendingReassignment[];
  /** Reset to seed data — used in tests and "reset demo data" button. */
  reset: () => void;
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
      assignJobToForeman: (jobId, foremanId, foremanName) =>
        set((s) => ({
          jobs: s.jobs.map((j) => {
            if (j.id !== jobId) return j;
            // If the previous foreman already saw this job (sent/confirmed/
            // declined), the change hasn't reached the new foreman yet.
            const wasSent = j.assignment && j.assignment.status !== "Draft";
            return {
              ...j,
              driverId: foremanId,
              driverName: foremanName,
              status: j.status === "Unassigned" ? "Assigned" : j.status,
              assignment: wasSent
                ? {
                    status: "Needs Attention",
                    changeNote: `Moved to ${foremanName} after sending — update not sent yet`,
                  }
                : { status: "Draft" },
            };
          }),
        })),
      unassignJob: (jobId) =>
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
        })),
      assignTruckForDay: (foremanId, dayIso, truckId) =>
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
        })),
      setAssignmentForDay: (foremanId, dayIso, status, opts) => {
        const now = new Date().toISOString();
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
      },
      setJobAssignment: (jobId, status, opts) => {
        const now = new Date().toISOString();
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
      stageReassignment: (id, toDriverId, toDriverName, by, reason) => {
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
        return staged;
      },
      cancelPending: (id) =>
        set((s) => ({
          pendingReassignments: s.pendingReassignments.filter(
            (p) => p.jobId !== id,
          ),
        })),
      confirmPending: (id) => {
        const pending = get().pendingReassignments.find((p) => p.jobId === id);
        if (!pending) return undefined;
        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.id === id
              ? {
                  ...j,
                  driverId: pending.toDriverId,
                  driverName: pending.toDriverName,
                  status: pending.toDriverId
                    ? j.status === "Unassigned"
                      ? "Assigned"
                      : j.status
                    : "Unassigned",
                }
              : j,
          ),
          pendingReassignments: s.pendingReassignments.filter(
            (p) => p.jobId !== id,
          ),
        }));
        return pending;
      },
      confirmAllPending: () => {
        const list = [...get().pendingReassignments];
        set((s) => {
          const jobMap = new Map(list.map((p) => [p.jobId, p]));
          return {
            jobs: s.jobs.map((j) => {
              const p = jobMap.get(j.id);
              if (!p) return j;
              return {
                ...j,
                driverId: p.toDriverId,
                driverName: p.toDriverName,
                status: p.toDriverId
                  ? j.status === "Unassigned"
                    ? "Assigned"
                    : j.status
                  : "Unassigned",
              };
            }),
            pendingReassignments: [],
          };
        });
        return list;
      },
      reset: () => set({ jobs: seedJobs, pendingReassignments: [] }),
    }),
    {
      // v3 — Sprint 2.2: date re-anchored seed + assignment/truck fields.
      name: "arsemia.jobs.v3",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
