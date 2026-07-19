"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ActivityAction,
  ActivityEntry,
  ActivityModule,
  EventLinkedType,
  EventSource,
} from "@/lib/types";

/**
 * Unified event/timeline store (Sprint 3 foundation).
 *
 * ONE store, ONE write API. Every meaningful action — assignment lifecycle,
 * reassignments, truck changes, adjustments, documents, settings — lands
 * here via `logEvent()` (or the lower-level `push` for legacy writers).
 * Job Detail timelines and /activity both read from this store; nothing
 * dual-writes at call sites anymore.
 *
 * Persistence note: the key stays `arsemia.activity-log.v1` on purpose so
 * entries users already created are preserved. The Sprint 3 fields
 * (eventType/source/linkedType/linkedId) are optional — readers tolerate
 * old entries by falling back to module/action/objectId.
 */

interface ActivityLogState {
  entries: ActivityEntry[];
  push: (entry: Omit<ActivityEntry, "id" | "timestamp">) => ActivityEntry;
  clear: () => void;
}

const SEED: ActivityEntry[] = [
  {
    id: "act_seed_001",
    timestamp: "2026-06-18T14:23:00",
    actorId: "u_sell",
    actorName: "Carlos Estevez",
    actorRole: "seller",
    module: "Jobs",
    action: "created",
    objectType: "Job",
    objectId: "JOB-10421",
    title: "Job created from accepted quote",
    beforeValue: null,
    afterValue: { customer: "Sofia Martinez", price: 2480, cuFt: 640 },
    notes: "Quote accepted; converted from lead LD-2041.",
    eventType: "job_created",
    source: "owner_web",
    linkedType: "job",
    linkedId: "JOB-10421",
  },
  {
    id: "act_seed_002",
    timestamp: "2026-06-19T08:42:00",
    actorId: "u_disp",
    actorName: "Mariana Castro",
    actorRole: "dispatcher",
    module: "Dispatch",
    action: "assigned",
    objectType: "Job",
    objectId: "JOB-10421",
    title: "Assigned to Marcus Reyes — draft, not sent to foreman yet",
    beforeValue: { foreman: null },
    afterValue: { foreman: "Marcus Reyes", foremanId: "FM-1042" },
    eventType: "assignment_drafted",
    source: "owner_web",
    linkedType: "job",
    linkedId: "JOB-10421",
  },
  {
    id: "act_seed_002b",
    timestamp: "2026-06-19T09:05:00",
    actorId: "u_for",
    actorName: "Marcus Reyes",
    actorRole: "foreman",
    module: "Dispatch",
    action: "status_changed",
    objectType: "Job",
    objectId: "JOB-10421",
    title: "Marcus Reyes accepted this assignment from the Foreman Portal",
    eventType: "assignment_accepted_by_foreman",
    source: "foreman_portal",
    linkedType: "job",
    linkedId: "JOB-10421",
  },
  {
    id: "act_seed_003",
    timestamp: "2026-06-20T11:00:00",
    actorId: "u_disp",
    actorName: "Mariana Castro",
    actorRole: "dispatcher",
    module: "Jobs",
    action: "submitted",
    objectType: "COI",
    objectId: "JOB-10421",
    title: "COI submitted to building",
    afterValue: { building: "1100 Brickell Bay Dr" },
    eventType: "document_event",
    source: "owner_web",
    linkedType: "job",
    linkedId: "JOB-10421",
  },
  {
    id: "act_seed_004",
    timestamp: "2026-06-21T16:42:00",
    actorId: "u_sell",
    actorName: "Carlos Estevez",
    actorRole: "seller",
    module: "Leads",
    action: "status_changed",
    objectType: "Lead",
    objectId: "LD-2042",
    title: "Lead status changed",
    beforeValue: { status: "New" },
    afterValue: { status: "Contacted" },
  },
  {
    id: "act_seed_005",
    timestamp: "2026-06-22T10:14:00",
    actorId: "u_owner",
    actorName: "Marcus Reyes",
    actorRole: "foreman",
    module: "Adjustments",
    action: "submitted",
    objectType: "Adjustment",
    objectId: "ADJ-1001",
    title: "Foreman requested adjustment",
    afterValue: { extraCuFt: 40, extraBill: 305 },
    notes: "10 extra kitchen boxes + wall mirror + extra packing.",
    eventType: "adjustment_event",
    source: "owner_web",
    linkedType: "job",
    linkedId: "JOB-10421",
  },
];

export const useActivityLog = create<ActivityLogState>()(
  persist(
    (set, get) => ({
      entries: SEED,
      push: (entry) => {
        const newEntry: ActivityEntry = {
          ...entry,
          id: `act_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toISOString(),
        };
        set((s) => ({ entries: [newEntry, ...s.entries] }));
        return newEntry;
      },
      clear: () => set({ entries: [] }),
    }),
    {
      name: "arsemia.activity-log.v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

/* ────────────────────────────────────────────────────────────────
 * Unified write API — the ONE way to record an event.
 * ──────────────────────────────────────────────────────────────── */

/** Actor/source context passed from the UI layer into store mutations. */
export interface EventContext {
  actorId?: string;
  actorName?: string;
  actorRole?: string;
  source?: EventSource;
  /** Extra human context appended to the entry notes (e.g. a reason). */
  note?: string;
}

export interface LogEventInput {
  /** Machine-readable type, e.g. "assignment_sent", "job_reassigned". */
  eventType: string;
  /** The human sentence shown on timelines. */
  message: string;
  actorId?: string;
  actorName?: string;
  actorRole?: string;
  source?: EventSource;
  linkedType?: EventLinkedType;
  linkedId?: string;
  /** Legacy /activity classification; sensible defaults applied. */
  module?: ActivityModule;
  action?: ActivityAction;
  notes?: string;
  payload?: Record<string, unknown>;
}

const OBJECT_TYPE: Partial<Record<EventLinkedType, string>> = {
  job: "Job",
  truck: "Vehicle",
  user: "User",
  assignment: "Assignment",
  document: "Document",
  ticket: "Ticket",
  claim: "Claim",
  invoice: "Invoice",
};

/**
 * Append one unified event. Callable from stores and components alike
 * (uses getState, no hook needed). Fills the legacy /activity fields so
 * existing module/action filters keep working.
 */
export function logEvent(input: LogEventInput): ActivityEntry {
  return useActivityLog.getState().push({
    actorId: input.actorId ?? "system",
    actorName: input.actorName ?? "System",
    actorRole: input.actorRole ?? "system",
    module: input.module ?? "Dispatch",
    action: input.action ?? "status_changed",
    objectType: input.linkedType ? (OBJECT_TYPE[input.linkedType] ?? "Record") : "Record",
    objectId: input.linkedId ?? "",
    title: input.message,
    notes: input.notes,
    metadata: input.payload,
    eventType: input.eventType,
    source: input.source ?? "owner_web",
    linkedType: input.linkedType,
    linkedId: input.linkedId,
  });
}

/* ────────────────────────────────────────────────────────────────
 * Timeline reader — tolerant of pre-Sprint-3 entries.
 * ──────────────────────────────────────────────────────────────── */

/** All entries linked to a job, newest first. Tolerates legacy shapes. */
export function timelineForJob(entries: ActivityEntry[], jobId: string): ActivityEntry[] {
  return entries
    .filter(
      (e) =>
        (e.linkedType === "job" && e.linkedId === jobId) ||
        e.objectId === jobId ||
        (e.metadata as { jobId?: string } | undefined)?.jobId === jobId,
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Legacy job-events reader: the pre-Sprint-3 `arsemia.job-events.v1` store
 * was retired, but browsers that used it still hold history worth showing.
 * Read-only, client-only, never written to again.
 */
export interface LegacyJobEvent {
  id: string;
  jobId: string;
  actor: string;
  message: string;
  createdAt: string;
}

export function readLegacyJobEvents(jobId: string): LegacyJobEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("arsemia.job-events.v1");
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { state?: { events?: LegacyJobEvent[] } };
    return (parsed.state?.events ?? []).filter((e) => e.jobId === jobId);
  } catch {
    return [];
  }
}

export type { ActivityEntry, ActivityModule, ActivityAction };
