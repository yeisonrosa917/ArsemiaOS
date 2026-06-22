"use client";

import { create } from "zustand";

export type AdjustmentStatus =
  | "Requested by Foreman"
  | "Pending Sales Review"
  | "Sales Confirming with Foreman"
  | "Waiting for Client Payment"
  | "Paid / Approved"
  | "Applied to Job"
  | "Rejected / Cancelled";

export const ADJUSTMENT_FLOW: AdjustmentStatus[] = [
  "Requested by Foreman",
  "Pending Sales Review",
  "Sales Confirming with Foreman",
  "Waiting for Client Payment",
  "Paid / Approved",
  "Applied to Job",
];

export interface AdjustmentItem {
  name: string;
  qty: number;
  cuft: number;
  unitPrice: number;
}

export interface Adjustment {
  id: string;
  jobId: string;
  customer: string;
  foremanName: string;
  items: AdjustmentItem[];
  extraCuFt: number;
  extraBill: number;
  status: AdjustmentStatus;
  requestedAt: string;
  requestedBy: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  paidAt?: string;
  beforeCuFt: number;
  beforeBill: number;
  afterCuFt: number;
  afterBill: number;
  notes?: string;
  rejectReason?: string;
}

interface AdjustmentsState {
  items: Adjustment[];
  forJob: (jobId: string) => Adjustment[];
  advance: (id: string, by: string) => void;
  reject: (id: string, by: string, reason: string) => void;
  add: (a: Omit<Adjustment, "id" | "requestedAt" | "status">) => Adjustment;
}

const SEED: Adjustment[] = [
  {
    id: "ADJ-1001",
    jobId: "JOB-10421",
    customer: "Sofia Martinez",
    foremanName: "Marcus Reyes",
    items: [
      { name: "Box (medium)", qty: 10, cuft: 3, unitPrice: 16 },
      { name: "Mirror (medium)", qty: 1, cuft: 10, unitPrice: 25 },
      { name: "Extra packing service", qty: 1, cuft: 0, unitPrice: 120 },
    ],
    extraCuFt: 40,
    extraBill: 305,
    status: "Pending Sales Review",
    requestedAt: "2026-06-22T10:14:00",
    requestedBy: "Marcus Reyes",
    beforeCuFt: 640,
    beforeBill: 2480,
    afterCuFt: 680,
    afterBill: 2785,
    notes:
      "Customer found 10 extra kitchen boxes + a wall mirror not in the inventory. Asked for extra packing on the dining room.",
  },
  {
    id: "ADJ-1002",
    jobId: "JOB-10422",
    customer: "Hayward Logistics LLC",
    foremanName: "Sofia Hernandez",
    items: [
      { name: "Office chair", qty: 6, cuft: 10, unitPrice: 0 },
      { name: "Filing cabinet (2-drawer)", qty: 3, cuft: 8, unitPrice: 0 },
    ],
    extraCuFt: 84,
    extraBill: 420,
    status: "Waiting for Client Payment",
    requestedAt: "2026-06-21T09:22:00",
    requestedBy: "Sofia Hernandez",
    reviewedBy: "Carlos Estevez",
    reviewedAt: "2026-06-21T09:48:00",
    beforeCuFt: 1240,
    beforeBill: 4625,
    afterCuFt: 1324,
    afterBill: 5045,
    notes:
      "On-site discovery of 6 additional chairs and 3 cabinets. Office manager wants them added to delivery.",
  },
  {
    id: "ADJ-1003",
    jobId: "JOB-10438",
    customer: "Ava Aronson",
    foremanName: "Ravi Shankar",
    items: [{ name: "Crating — large art piece", qty: 2, cuft: 30, unitPrice: 175 }],
    extraCuFt: 60,
    extraBill: 350,
    status: "Applied to Job",
    requestedAt: "2026-06-20T13:40:00",
    requestedBy: "Ravi Shankar",
    reviewedBy: "Carlos Estevez",
    reviewedAt: "2026-06-20T14:02:00",
    approvedBy: "Yeison Rosa",
    approvedAt: "2026-06-20T15:18:00",
    paidAt: "2026-06-20T16:05:00",
    beforeCuFt: 1080,
    beforeBill: 4280,
    afterCuFt: 1140,
    afterBill: 4630,
    notes:
      "Two large modern art pieces require custom crating. Client paid via Stripe link within the hour.",
  },
];

export const useAdjustments = create<AdjustmentsState>((set, get) => ({
  items: SEED,
  forJob: (jobId) => get().items.filter((a) => a.jobId === jobId),
  advance: (id, by) =>
    set((s) => ({
      items: s.items.map((a) => {
        if (a.id !== id) return a;
        const idx = ADJUSTMENT_FLOW.indexOf(a.status);
        if (idx === -1 || idx >= ADJUSTMENT_FLOW.length - 1) return a;
        const next = ADJUSTMENT_FLOW[idx + 1];
        const stampField =
          next === "Pending Sales Review"
            ? { reviewedBy: by, reviewedAt: new Date().toISOString() }
            : next === "Paid / Approved"
              ? { approvedBy: by, approvedAt: new Date().toISOString() }
              : next === "Applied to Job"
                ? { paidAt: new Date().toISOString() }
                : {};
        return { ...a, status: next, ...stampField };
      }),
    })),
  reject: (id, by, reason) =>
    set((s) => ({
      items: s.items.map((a) =>
        a.id === id
          ? {
              ...a,
              status: "Rejected / Cancelled",
              rejectReason: reason,
              reviewedBy: by,
              reviewedAt: new Date().toISOString(),
            }
          : a,
      ),
    })),
  add: (a) => {
    const newItem: Adjustment = {
      ...a,
      id: `ADJ-${1100 + Math.floor(Math.random() * 900)}`,
      requestedAt: new Date().toISOString(),
      status: "Requested by Foreman",
    };
    set((s) => ({ items: [newItem, ...s.items] }));
    return newItem;
  },
}));
