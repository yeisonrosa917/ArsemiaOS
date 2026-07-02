"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SalesStage } from "@/lib/types";
import { LEAD_SEED, type Lead } from "@/lib/seeds/leads";

export type { Lead } from "@/lib/seeds/leads";

interface LeadsState {
  leads: Lead[];
  getById: (id: string) => Lead | undefined;
  /** Assign / reassign a single lead to a seller (or null to unassign). */
  assign: (id: string, sellerId: string | null, sellerName: string | null, by: string) => void;
  /** Assign many leads to one seller. */
  bulkAssign: (ids: string[], sellerId: string, sellerName: string, by: string) => void;
  /** Distribute the given leads evenly (round-robin) across active sellers. */
  distributeEvenly: (
    ids: string[],
    sellers: { id: string; name: string }[],
    by: string,
  ) => void;
  setStage: (id: string, stage: SalesStage, by: string) => void;
  bulkSetStage: (ids: string[], stage: SalesStage, by: string) => void;
  markContacted: (id: string, by: string) => void;
  scheduleFollowUp: (id: string, dateISO: string) => void;
  addNote: (id: string, text: string, by: string) => void;
  markLost: (id: string, by: string) => void;
  linkQuote: (id: string, quoteId: string) => void;
  linkJob: (id: string, jobId: string) => void;
}

function nowISO() {
  return new Date().toISOString();
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export const useLeads = create<LeadsState>()(
  persist(
    (set, get) => ({
      leads: LEAD_SEED,

      getById: (id) => get().leads.find((l) => l.id === id),

      assign: (id, sellerId, sellerName, by) =>
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === id
              ? {
                  ...l,
                  assignedSellerId: sellerId,
                  assignedSellerName: sellerName,
                  ownershipHistory: [
                    ...l.ownershipHistory,
                    { at: nowISO(), sellerId, sellerName: sellerName ?? "Unassigned", by },
                  ],
                }
              : l,
          ),
        })),

      bulkAssign: (ids, sellerId, sellerName, by) =>
        set((s) => ({
          leads: s.leads.map((l) =>
            ids.includes(l.id)
              ? {
                  ...l,
                  assignedSellerId: sellerId,
                  assignedSellerName: sellerName,
                  ownershipHistory: [
                    ...l.ownershipHistory,
                    { at: nowISO(), sellerId, sellerName, by },
                  ],
                }
              : l,
          ),
        })),

      distributeEvenly: (ids, sellers, by) =>
        set((s) => {
          if (sellers.length === 0) return {};
          let i = 0;
          const target = new Map<string, { id: string; name: string }>();
          for (const id of ids) {
            target.set(id, sellers[i % sellers.length]);
            i++;
          }
          return {
            leads: s.leads.map((l) => {
              const t = target.get(l.id);
              if (!t) return l;
              return {
                ...l,
                assignedSellerId: t.id,
                assignedSellerName: t.name,
                ownershipHistory: [
                  ...l.ownershipHistory,
                  { at: nowISO(), sellerId: t.id, sellerName: t.name, by },
                ],
              };
            }),
          };
        }),

      setStage: (id, stage, by) =>
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === id
              ? {
                  ...l,
                  stage,
                  noteLog: [
                    { at: nowISO(), by, text: `Stage → ${stage}` },
                    ...l.noteLog,
                  ],
                }
              : l,
          ),
        })),

      bulkSetStage: (ids, stage, by) =>
        set((s) => ({
          leads: s.leads.map((l) =>
            ids.includes(l.id)
              ? {
                  ...l,
                  stage,
                  noteLog: [{ at: nowISO(), by, text: `Stage → ${stage}` }, ...l.noteLog],
                }
              : l,
          ),
        })),

      markContacted: (id, by) =>
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === id
              ? {
                  ...l,
                  lastContactedAt: nowISO(),
                  stage: l.stage === "New Lead" ? "Contacted" : l.stage,
                  noteLog: [{ at: nowISO(), by, text: "Marked contacted" }, ...l.noteLog],
                }
              : l,
          ),
        })),

      scheduleFollowUp: (id, dateISO) =>
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === id ? { ...l, nextFollowUpAt: dateISO } : l,
          ),
        })),

      addNote: (id, text, by) =>
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === id
              ? { ...l, noteLog: [{ at: nowISO(), by, text }, ...l.noteLog] }
              : l,
          ),
        })),

      markLost: (id, by) =>
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === id
              ? {
                  ...l,
                  stage: "Lost",
                  noteLog: [{ at: nowISO(), by, text: "Marked lost" }, ...l.noteLog],
                }
              : l,
          ),
        })),

      linkQuote: (id, quoteId) =>
        set((s) => ({
          leads: s.leads.map((l) => (l.id === id ? { ...l, quoteId } : l)),
        })),

      linkJob: (id, jobId) =>
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === id ? { ...l, jobId, stage: "Converted to Job" } : l,
          ),
        })),
    }),
    {
      name: "arsemia.leads.v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

/** Follow-up helpers used across sales surfaces. */
export function followUpState(l: Lead): "overdue" | "today" | "upcoming" | "none" {
  if (!l.nextFollowUpAt) return "none";
  const d = l.nextFollowUpAt.slice(0, 10);
  const t = todayISO();
  if (d < t) return "overdue";
  if (d === t) return "today";
  return "upcoming";
}

export const OPEN_STAGES: SalesStage[] = [
  "New Lead",
  "Contacted",
  "Quote Requested",
  "Quote Drafted",
  "Quote Sent",
  "Follow-Up Needed",
  "Booked",
];

export function isOpenStage(stage: SalesStage): boolean {
  return OPEN_STAGES.includes(stage);
}
