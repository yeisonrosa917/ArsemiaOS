"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ActivityAction,
  ActivityEntry,
  ActivityModule,
} from "@/lib/types";

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
    title: "Foreman assigned",
    beforeValue: { foreman: null },
    afterValue: { foreman: "Marcus Reyes", foremanId: "FM-1042" },
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

export type { ActivityEntry, ActivityModule, ActivityAction };
