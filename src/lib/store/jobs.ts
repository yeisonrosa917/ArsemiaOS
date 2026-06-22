"use client";

import { create } from "zustand";
import { jobs as seedJobs } from "@/lib/mock-data";
import type { Job } from "@/lib/types";

interface JobsState {
  jobs: Job[];
  updateJob: (id: string, patch: Partial<Job>) => void;
  reassign: (
    id: string,
    driverId: string | undefined,
    driverName: string | undefined,
  ) => { from?: string; to?: string };
}

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: seedJobs,
  updateJob: (id, patch) =>
    set((s) => ({
      jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)),
    })),
  reassign: (id, driverId, driverName) => {
    const job = get().jobs.find((j) => j.id === id);
    const from = job?.driverName;
    set((s) => ({
      jobs: s.jobs.map((j) =>
        j.id === id
          ? {
              ...j,
              driverId,
              driverName,
              status: driverId ? (j.status === "Unassigned" ? "Assigned" : j.status) : "Unassigned",
            }
          : j,
      ),
    }));
    return { from, to: driverName };
  },
}));
