"use client";

import { create } from "zustand";
import { jobs as seedJobs } from "@/lib/mock-data";
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
  updateJob: (id: string, patch: Partial<Job>) => void;
  /** Stage a reassignment — does NOT modify the job yet. */
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
}

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: seedJobs,
  pendingReassignments: [],
  updateJob: (id, patch) =>
    set((s) => ({
      jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)),
    })),
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
}));
