"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { allJobs as seedJobs } from "@/lib/data/all-jobs";
import type { Job } from "@/lib/types";

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
      name: "arsemia.jobs.v2",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
