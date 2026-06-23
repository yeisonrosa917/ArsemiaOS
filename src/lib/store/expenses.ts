"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { EXPENSES as SEED_DATA } from "@/lib/data/expenses";

export type ExpenseStatus =
  | "Submitted"
  | "Needs Receipt"
  | "Under Review"
  | "Approved"
  | "Rejected"
  | "Duplicate"
  | "Paid"
  | "Reimbursed"
  | "On Hold";

export const EXPENSE_STATUSES: ExpenseStatus[] = [
  "Submitted",
  "Needs Receipt",
  "Under Review",
  "Approved",
  "Rejected",
  "Duplicate",
  "Paid",
  "Reimbursed",
  "On Hold",
];

export type ExpenseCategory =
  | "Gas"
  | "Hotel"
  | "Tolls"
  | "Parking"
  | "Packing Material"
  | "Truck Repair"
  | "Emergency Supplies"
  | "Rental Equipment";

export type ExpensePaymentMethod =
  | "Company Card"
  | "Foreman Out-of-Pocket"
  | "Petty Cash"
  | "ACH"
  | "Check";

export interface ExpenseReviewNote {
  id: string;
  authorName: string;
  authorId: string;
  text: string;
  createdAt: string;
}

/**
 * AI/OCR placeholder structure. Real fields ship when receipt intelligence is
 * wired; for now reviewer corrections live in the same shape so the UI is
 * stable.
 */
export interface ExpenseDetection {
  merchant?: string;
  date?: string;
  total?: number;
  tax?: number;
  description?: string;
  /** 0..1 confidence score from the (future) OCR layer. */
  confidence?: number;
  /** 0..1 duplicate-risk score. */
  duplicateRisk?: number;
}

export interface Expense {
  id: string;
  foremanName: string;
  foremanId: string;
  truckId: string;
  truckName: string;
  jobId?: string;
  category: ExpenseCategory;
  vendor?: string;
  paymentMethod: ExpensePaymentMethod;
  amount: number;
  date: string;
  status: ExpenseStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  paidAt?: string;
  reimbursedAt?: string;
  duplicateOf?: string;
  notes?: string;
  receiptUrl?: string;
  reviewNotes: ExpenseReviewNote[];
  /** Foreman/contractor billing flag. */
  reimbursable: boolean;
  detection?: ExpenseDetection;
}

function migrateSeed(): Expense[] {
  const oldToNew = (status: string): ExpenseStatus => {
    if (status === "Deducted") return "Rejected";
    if (EXPENSE_STATUSES.includes(status as ExpenseStatus))
      return status as ExpenseStatus;
    return "Submitted";
  };
  const inferMethod = (
    cat: ExpenseCategory,
    status: string,
  ): ExpensePaymentMethod => {
    if (cat === "Gas" || cat === "Tolls" || cat === "Parking")
      return "Company Card";
    if (cat === "Truck Repair") return "Company Card";
    if (status === "Reimbursed") return "Foreman Out-of-Pocket";
    return "Foreman Out-of-Pocket";
  };
  const vendorByCategory: Record<ExpenseCategory, string[]> = {
    Gas: ["Shell", "Chevron", "Marathon", "Wawa", "Mobil"],
    Hotel: ["Hampton Inn Tampa", "Best Western I-95", "La Quinta Doral"],
    Tolls: ["SunPass Reload", "MDX TollPass"],
    Parking: ["LAZ Parking Coral Gables", "ImPark Brickell"],
    "Packing Material": ["U-Haul Doral", "ULINE", "Lowe's Hialeah"],
    "Truck Repair": ["Pep Boys Brickell", "Bridgestone Service", "Doral Truck Center"],
    "Emergency Supplies": ["Home Depot Wynwood", "Target Coral Gables"],
    "Rental Equipment": ["Sunbelt Rentals", "Home Depot Tool Rental"],
  };
  return SEED_DATA.map((e, idx) => {
    const method = inferMethod(e.category, e.status);
    const reimbursable = method === "Foreman Out-of-Pocket";
    const vendor = vendorByCategory[e.category]?.[idx % 3] ?? undefined;
    return {
      id: e.id,
      foremanName: e.foremanName,
      foremanId: e.foremanId,
      truckId: e.truckId,
      truckName: e.truckName,
      jobId: e.jobId,
      category: e.category,
      vendor,
      paymentMethod: method,
      amount: e.amount,
      date: e.date,
      status: oldToNew(e.status),
      reviewedBy: e.reviewedBy,
      reviewedAt: e.reviewedAt,
      reimbursedAt: e.reimbursedAt,
      paidAt: e.status === "Approved" ? e.reviewedAt : undefined,
      notes: e.notes,
      receiptUrl: e.receiptUrl,
      reviewNotes: [],
      reimbursable,
      detection: e.receiptUrl
        ? {
            merchant: vendor,
            date: e.date.slice(0, 10),
            total: e.amount,
            tax: Number((e.amount * 0.07).toFixed(2)),
            description: e.notes,
            confidence: 0.82 + ((idx % 7) * 0.02),
            duplicateRisk: idx % 4 === 0 ? 0.18 : 0.04,
          }
        : undefined,
    };
  });
}

interface ExpensesState {
  items: Expense[];
  setStatus: (id: string, status: ExpenseStatus, by: string) => Expense | undefined;
  approve: (id: string, by: string) => Expense | undefined;
  reject: (id: string, by: string, reason: string) => Expense | undefined;
  markDuplicate: (id: string, by: string, duplicateOf?: string) => Expense | undefined;
  markPaid: (id: string, by: string) => Expense | undefined;
  markReimbursed: (id: string, by: string) => Expense | undefined;
  addReviewNote: (id: string, note: Omit<ExpenseReviewNote, "id" | "createdAt">) => Expense | undefined;
  setReimbursable: (id: string, reimbursable: boolean) => Expense | undefined;
  updateDetection: (id: string, patch: Partial<ExpenseDetection>) => Expense | undefined;
  getById: (id: string) => Expense | undefined;
  reimbursementsFor: (foremanId: string, from: string, to: string) => Expense[];
}

export const useExpenses = create<ExpensesState>()(
  persist(
    (set, get) => ({
      items: migrateSeed(),
      setStatus: (id, status, by) => {
        let updated: Expense | undefined;
        set((s) => ({
          items: s.items.map((e) => {
            if (e.id !== id) return e;
            updated = {
              ...e,
              status,
              reviewedBy: by,
              reviewedAt: new Date().toISOString(),
            };
            return updated;
          }),
        }));
        return updated;
      },
      approve: (id, by) => {
        let updated: Expense | undefined;
        set((s) => ({
          items: s.items.map((e) => {
            if (e.id !== id) return e;
            updated = {
              ...e,
              status: "Approved",
              reviewedBy: by,
              reviewedAt: new Date().toISOString(),
            };
            return updated;
          }),
        }));
        return updated;
      },
      reject: (id, by, reason) => {
        let updated: Expense | undefined;
        const now = new Date().toISOString();
        set((s) => ({
          items: s.items.map((e) => {
            if (e.id !== id) return e;
            updated = {
              ...e,
              status: "Rejected",
              reviewedBy: by,
              reviewedAt: now,
              reviewNotes: [
                ...e.reviewNotes,
                {
                  id: `rn_${Math.random().toString(36).slice(2, 9)}`,
                  authorName: by,
                  authorId: "",
                  text: `Rejected: ${reason}`,
                  createdAt: now,
                },
              ],
            };
            return updated;
          }),
        }));
        return updated;
      },
      markDuplicate: (id, by, duplicateOf) => {
        let updated: Expense | undefined;
        set((s) => ({
          items: s.items.map((e) => {
            if (e.id !== id) return e;
            updated = {
              ...e,
              status: "Duplicate",
              duplicateOf,
              reviewedBy: by,
              reviewedAt: new Date().toISOString(),
            };
            return updated;
          }),
        }));
        return updated;
      },
      markPaid: (id, by) => {
        let updated: Expense | undefined;
        const now = new Date().toISOString();
        set((s) => ({
          items: s.items.map((e) => {
            if (e.id !== id) return e;
            updated = {
              ...e,
              status: "Paid",
              paidAt: now,
              reviewedBy: by,
              reviewedAt: now,
            };
            return updated;
          }),
        }));
        return updated;
      },
      markReimbursed: (id, by) => {
        let updated: Expense | undefined;
        const now = new Date().toISOString();
        set((s) => ({
          items: s.items.map((e) => {
            if (e.id !== id) return e;
            updated = {
              ...e,
              status: "Reimbursed",
              reimbursedAt: now,
              reviewedBy: by,
              reviewedAt: now,
            };
            return updated;
          }),
        }));
        return updated;
      },
      addReviewNote: (id, note) => {
        let updated: Expense | undefined;
        const now = new Date().toISOString();
        set((s) => ({
          items: s.items.map((e) => {
            if (e.id !== id) return e;
            updated = {
              ...e,
              reviewNotes: [
                ...e.reviewNotes,
                {
                  ...note,
                  id: `rn_${Math.random().toString(36).slice(2, 9)}`,
                  createdAt: now,
                },
              ],
            };
            return updated;
          }),
        }));
        return updated;
      },
      setReimbursable: (id, reimbursable) => {
        let updated: Expense | undefined;
        set((s) => ({
          items: s.items.map((e) => {
            if (e.id !== id) return e;
            updated = { ...e, reimbursable };
            return updated;
          }),
        }));
        return updated;
      },
      updateDetection: (id, patch) => {
        let updated: Expense | undefined;
        set((s) => ({
          items: s.items.map((e) => {
            if (e.id !== id) return e;
            updated = { ...e, detection: { ...(e.detection ?? {}), ...patch } };
            return updated;
          }),
        }));
        return updated;
      },
      getById: (id) => get().items.find((e) => e.id === id),
      reimbursementsFor: (foremanId, from, to) => {
        const fromTs = new Date(from).getTime();
        const toTs = new Date(to).getTime();
        return get().items.filter((e) => {
          if (e.foremanId !== foremanId) return false;
          if (!e.reimbursable) return false;
          if (e.status !== "Approved" && e.status !== "Paid" && e.status !== "Reimbursed") return false;
          const t = new Date(e.date).getTime();
          return t >= fromTs && t <= toTs;
        });
      },
    }),
    {
      name: "arsemia.expenses.v2",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
