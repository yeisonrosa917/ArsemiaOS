"use client";

import { create } from "zustand";

export type JobEventType =
  | "created"
  | "assigned"
  | "reassigned"
  | "status_changed"
  | "edited"
  | "confirmed_by_customer"
  | "confirmed_by_foreman"
  | "coi_submitted"
  | "adjustment_added"
  | "note_added";

export interface JobEvent {
  id: string;
  jobId: string;
  type: JobEventType;
  actor: string;
  message: string;
  createdAt: string;
}

interface JobEventsState {
  events: JobEvent[];
  push: (e: Omit<JobEvent, "id" | "createdAt">) => void;
  forJob: (jobId: string) => JobEvent[];
}

// Seed history per job — populated on demand
const SEED: JobEvent[] = [
  {
    id: "ev_s1",
    jobId: "JOB-10421",
    type: "created",
    actor: "Carlos Estevez",
    message: "Quote accepted; job created from lead LD-2041.",
    createdAt: "2026-06-18T14:23:00",
  },
  {
    id: "ev_s2",
    jobId: "JOB-10421",
    type: "assigned",
    actor: "Mariana Castro",
    message: "Assigned to Marcus Reyes (DRV-1042).",
    createdAt: "2026-06-19T08:42:00",
  },
  {
    id: "ev_s3",
    jobId: "JOB-10421",
    type: "coi_submitted",
    actor: "Mariana Castro",
    message: "COI submitted to 1100 Brickell Bay Dr management.",
    createdAt: "2026-06-20T11:00:00",
  },
  {
    id: "ev_s4",
    jobId: "JOB-10421",
    type: "status_changed",
    actor: "Marcus Reyes",
    message: "Status: Assigned → Pickup Started.",
    createdAt: "2026-06-22T08:15:00",
  },
];

export const useJobEvents = create<JobEventsState>((set, get) => ({
  events: SEED,
  push: (e) =>
    set((s) => ({
      events: [
        {
          ...e,
          id: `ev_${Math.random().toString(36).slice(2, 9)}`,
          createdAt: new Date().toISOString(),
        },
        ...s.events,
      ],
    })),
  forJob: (jobId) =>
    get()
      .events.filter((ev) => ev.jobId === jobId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
}));
