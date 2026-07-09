"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CatalogCategory } from "@/lib/store/company-config";

/**
 * Pending catalog approvals.
 *
 * When a seller quotes an item the catalog doesn't know yet (typed manually or
 * left over from a pasted list), they can suggest it for the master catalog.
 * The suggestion lands here for the Owner to review in Settings — approve it
 * (which adds it to the company catalog) or reject it. This keeps the catalog
 * curated instead of letting every one-off custom item pollute it.
 */

export type PendingStatus = "Pending" | "Approved" | "Rejected";

export interface PendingCatalogItem {
  id: string;
  name: string;
  /** Seller's rough estimate; the Owner can adjust before approving. */
  cuft: number;
  category: CatalogCategory;
  aliases?: string[];
  submittedBy: string;
  submittedByRole: string;
  submittedAt: string;
  note?: string;
  sourceQuoteId?: string;
  status: PendingStatus;
  reviewedBy?: string;
  reviewedAt?: string;
}

const SEED: PendingCatalogItem[] = [
  {
    id: "PC-1001",
    name: "Wine Fridge (dual-zone)",
    cuft: 22,
    category: "Appliance",
    aliases: ["wine cooler"],
    submittedBy: "Diego Ramirez",
    submittedByRole: "Seller / Sales",
    submittedAt: "2026-06-30T15:20:00",
    note: "Kendall high-rise job — customer has two of these.",
    status: "Pending",
  },
  {
    id: "PC-1002",
    name: "Massage Chair (full-body)",
    cuft: 40,
    category: "Bulky",
    submittedBy: "Diego Ramirez",
    submittedByRole: "Seller / Sales",
    submittedAt: "2026-07-01T11:05:00",
    note: "Heavy, reclines — probably special handling.",
    status: "Pending",
  },
  {
    id: "PC-1003",
    name: "Peloton Bike",
    cuft: 18,
    category: "Specialty",
    aliases: ["exercise bike", "spin bike"],
    submittedBy: "Camila Ortiz",
    submittedByRole: "Seller / Sales",
    submittedAt: "2026-07-02T09:40:00",
    status: "Pending",
  },
];

let seq = 2000;
function mkId(): string {
  seq += 1;
  return `PC-${seq}`;
}

interface CatalogPendingState {
  items: PendingCatalogItem[];
  submit: (
    input: {
      name: string;
      cuft?: number;
      category?: CatalogCategory;
      aliases?: string[];
      submittedBy: string;
      submittedByRole: string;
      note?: string;
      sourceQuoteId?: string;
    },
  ) => PendingCatalogItem;
  approve: (id: string, by: string) => PendingCatalogItem | undefined;
  reject: (id: string, by: string) => PendingCatalogItem | undefined;
  removeReviewed: (id: string) => void;
}

export const useCatalogPending = create<CatalogPendingState>()(
  persist(
    (set, get) => ({
      items: SEED,
      submit: (input) => {
        const item: PendingCatalogItem = {
          id: mkId(),
          name: input.name.trim(),
          cuft: input.cuft ?? 20,
          category: input.category ?? "Other",
          aliases: input.aliases,
          submittedBy: input.submittedBy,
          submittedByRole: input.submittedByRole,
          submittedAt: new Date().toISOString(),
          note: input.note,
          sourceQuoteId: input.sourceQuoteId,
          status: "Pending",
        };
        set((s) => ({ items: [item, ...s.items] }));
        return item;
      },
      approve: (id, by) => {
        let updated: PendingCatalogItem | undefined;
        set((s) => ({
          items: s.items.map((i) => {
            if (i.id !== id) return i;
            updated = { ...i, status: "Approved", reviewedBy: by, reviewedAt: new Date().toISOString() };
            return updated;
          }),
        }));
        return updated;
      },
      reject: (id, by) => {
        let updated: PendingCatalogItem | undefined;
        set((s) => ({
          items: s.items.map((i) => {
            if (i.id !== id) return i;
            updated = { ...i, status: "Rejected", reviewedBy: by, reviewedAt: new Date().toISOString() };
            return updated;
          }),
        }));
        return updated;
      },
      removeReviewed: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
    }),
    {
      name: "arsemia.catalog-pending.v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function pendingCount(items: PendingCatalogItem[]): number {
  return items.filter((i) => i.status === "Pending").length;
}
