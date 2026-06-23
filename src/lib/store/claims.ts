"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ClaimStatus =
  | "New"
  | "Under Review"
  | "Waiting for Evidence"
  | "Foreman Response Needed"
  | "Insurance Review"
  | "Approved"
  | "Rejected"
  | "Reimbursed"
  | "Deducted"
  | "Closed";

export const CLAIM_STATUSES: ClaimStatus[] = [
  "New",
  "Under Review",
  "Waiting for Evidence",
  "Foreman Response Needed",
  "Insurance Review",
  "Approved",
  "Rejected",
  "Reimbursed",
  "Deducted",
  "Closed",
];

export type ClaimType =
  | "Scratched Wall"
  | "Broken Dresser"
  | "Cracked TV"
  | "Damaged Floor"
  | "Broken Table"
  | "Missing Box"
  | "Elevator Damage"
  | "Furniture Damage"
  | "Lost Item";

export interface ClaimEvidence {
  id: string;
  side: "customer" | "foreman" | "internal" | "insurance";
  kind: "photo" | "note" | "document" | "video";
  caption: string;
  placeholderTone: "rose" | "amber" | "slate" | "emerald" | "violet" | "cyan";
  uploadedBy: string;
  uploadedAt: string;
  /** When kind === "note" or "document", store the text. */
  body?: string;
}

export interface Claim {
  id: string;
  customerName: string;
  customerId?: string;
  jobId: string;
  foremanName: string;
  foremanId: string;
  truckName: string;
  truckId: string;
  claimType: ClaimType;
  claimAmount: number;
  status: ClaimStatus;
  assignedReviewer: string;
  openedAt: string;
  evidence: ClaimEvidence[];
  internalReviewNote?: string;
  insuranceNote?: string;
  resolutionNote?: string;
  reimbursedAmount?: number;
  deductedAmount?: number;
}

const SEED: Claim[] = [
  {
    id: "CLM-1001",
    customerName: "Sofia Martinez",
    customerId: "CUS-401",
    jobId: "JOB-10421",
    foremanName: "Marcus Reyes",
    foremanId: "FM-1042",
    truckName: "Truck #04 - ISUZU NPR 20'",
    truckId: "VEH-204",
    claimType: "Scratched Wall",
    claimAmount: 450,
    status: "Foreman Response Needed",
    assignedReviewer: "Andrea Velazquez",
    openedAt: "2026-06-22T15:14:00",
    evidence: [
      {
        id: "ev_c1",
        side: "customer",
        kind: "photo",
        caption: "Wall scratch near elevator on delivery floor",
        placeholderTone: "rose",
        uploadedBy: "Sofia Martinez",
        uploadedAt: "2026-06-22T15:14:00",
      },
      {
        id: "ev_c2",
        side: "customer",
        kind: "photo",
        caption: "Close-up of damage",
        placeholderTone: "rose",
        uploadedBy: "Sofia Martinez",
        uploadedAt: "2026-06-22T15:15:00",
      },
      {
        id: "ev_c3",
        side: "customer",
        kind: "note",
        caption: "Customer statement",
        placeholderTone: "slate",
        uploadedBy: "Sofia Martinez",
        uploadedAt: "2026-06-22T15:18:00",
        body: "The wall was perfectly fine before the crew brought up the dresser. They scratched it while turning the corner.",
      },
    ],
  },
  {
    id: "CLM-1002",
    customerName: "Lucas Beltran",
    customerId: "CUS-409",
    jobId: "JOB-10429",
    foremanName: "Jamal Carter",
    foremanId: "FM-1046",
    truckName: "Truck #20 - ISUZU NPR 26'",
    truckId: "VEH-220",
    claimType: "Broken Dresser",
    claimAmount: 1200,
    status: "Insurance Review",
    assignedReviewer: "Andrea Velazquez",
    openedAt: "2026-06-21T10:42:00",
    evidence: [
      {
        id: "ev_d1",
        side: "customer",
        kind: "photo",
        caption: "Dresser drawer cracked at delivery",
        placeholderTone: "amber",
        uploadedBy: "Lucas Beltran",
        uploadedAt: "2026-06-21T10:42:00",
      },
      {
        id: "ev_d2",
        side: "foreman",
        kind: "photo",
        caption: "Pre-existing crack — photo taken at pickup",
        placeholderTone: "emerald",
        uploadedBy: "Jamal Carter",
        uploadedAt: "2026-06-21T08:30:00",
      },
      {
        id: "ev_d3",
        side: "foreman",
        kind: "note",
        caption: "Foreman defense statement",
        placeholderTone: "emerald",
        uploadedBy: "Jamal Carter",
        uploadedAt: "2026-06-21T11:10:00",
        body: "I documented the crack at pickup. The customer signed the inventory acknowledging pre-existing damage.",
      },
      {
        id: "ev_d4",
        side: "foreman",
        kind: "document",
        caption: "Signed pickup inventory with damage note",
        placeholderTone: "emerald",
        uploadedBy: "Jamal Carter",
        uploadedAt: "2026-06-21T11:12:00",
        body: "Signed pickup inventory document (placeholder).",
      },
    ],
    internalReviewNote: "Foreman provided strong pre-existing damage evidence. Forwarding to insurance.",
  },
  {
    id: "CLM-1003",
    customerName: "Mia Patel",
    customerId: "CUS-407",
    jobId: "JOB-10427",
    foremanName: "Elena Park",
    foremanId: "FM-1047",
    truckName: "Truck #24 - Mercedes Sprinter 144",
    truckId: "VEH-224",
    claimType: "Cracked TV",
    claimAmount: 850,
    status: "Under Review",
    assignedReviewer: "Andrea Velazquez",
    openedAt: "2026-06-22T09:00:00",
    evidence: [
      {
        id: "ev_t1",
        side: "customer",
        kind: "photo",
        caption: "55\" TV with cracked screen",
        placeholderTone: "rose",
        uploadedBy: "Mia Patel",
        uploadedAt: "2026-06-22T09:00:00",
      },
      {
        id: "ev_t2",
        side: "customer",
        kind: "photo",
        caption: "TV box without protective padding",
        placeholderTone: "rose",
        uploadedBy: "Mia Patel",
        uploadedAt: "2026-06-22T09:02:00",
      },
    ],
  },
  {
    id: "CLM-1004",
    customerName: "Ava Aronson",
    customerId: "CUS-418",
    jobId: "JOB-10438",
    foremanName: "Ravi Shankar",
    foremanId: "FM-1048",
    truckName: "Truck #30 - Freightliner M2 26'",
    truckId: "VEH-230",
    claimType: "Missing Box",
    claimAmount: 300,
    status: "Reimbursed",
    assignedReviewer: "Andrea Velazquez",
    openedAt: "2026-06-20T17:30:00",
    evidence: [
      {
        id: "ev_m1",
        side: "customer",
        kind: "note",
        caption: "Customer reported missing box",
        placeholderTone: "amber",
        uploadedBy: "Ava Aronson",
        uploadedAt: "2026-06-20T17:30:00",
        body: "Box marked KITCHEN-7 not delivered. Contains glassware.",
      },
      {
        id: "ev_m2",
        side: "internal",
        kind: "document",
        caption: "Inventory reconciliation",
        placeholderTone: "violet",
        uploadedBy: "Andrea Velazquez",
        uploadedAt: "2026-06-20T18:45:00",
        body: "Box found in storage facility, returned to customer next day. Reimbursement issued for inconvenience.",
      },
    ],
    reimbursedAmount: 150,
    resolutionNote: "Box recovered and delivered. $150 inconvenience reimbursement.",
  },
  {
    id: "CLM-1005",
    customerName: "Noah Goldstein",
    customerId: "CUS-419",
    jobId: "JOB-10439",
    foremanName: "Jamal Carter",
    foremanId: "FM-1046",
    truckName: "Truck #20 - ISUZU NPR 26'",
    truckId: "VEH-220",
    claimType: "Damaged Floor",
    claimAmount: 2500,
    status: "Waiting for Evidence",
    assignedReviewer: "Andrea Velazquez",
    openedAt: "2026-06-23T08:00:00",
    evidence: [
      {
        id: "ev_f1",
        side: "customer",
        kind: "photo",
        caption: "Hardwood floor scratch in living room",
        placeholderTone: "rose",
        uploadedBy: "Noah Goldstein",
        uploadedAt: "2026-06-23T08:00:00",
      },
    ],
  },
  {
    id: "CLM-1006",
    customerName: "Isabella Fernandez",
    customerId: "CUS-405",
    jobId: "JOB-10426",
    foremanName: "Ravi Shankar",
    foremanId: "FM-1048",
    truckName: "Truck #30 - Freightliner M2 26'",
    truckId: "VEH-230",
    claimType: "Elevator Damage",
    claimAmount: 600,
    status: "Closed",
    assignedReviewer: "Andrea Velazquez",
    openedAt: "2026-06-15T14:00:00",
    evidence: [
      {
        id: "ev_e1",
        side: "internal",
        kind: "note",
        caption: "Resolution",
        placeholderTone: "violet",
        uploadedBy: "Andrea Velazquez",
        uploadedAt: "2026-06-16T11:00:00",
        body: "Building manager confirmed damage was pre-existing. Claim closed without charge to Arsemia.",
      },
    ],
    resolutionNote: "Pre-existing damage. Closed.",
  },
];

interface ClaimsState {
  items: Claim[];
  setStatus: (id: string, status: ClaimStatus, by: string) => Claim | undefined;
  addEvidence: (id: string, evidence: Omit<ClaimEvidence, "id" | "uploadedAt">) => Claim | undefined;
  setInternalNote: (id: string, note: string) => void;
  setResolutionNote: (id: string, note: string, by: string) => void;
  getById: (id: string) => Claim | undefined;
}

export const useClaims = create<ClaimsState>()(
  persist(
    (set, get) => ({
      items: SEED,
      setStatus: (id, status) => {
        let updated: Claim | undefined;
        set((s) => ({
          items: s.items.map((c) => {
            if (c.id !== id) return c;
            updated = { ...c, status };
            return updated;
          }),
        }));
        return updated;
      },
      addEvidence: (id, ev) => {
        let updated: Claim | undefined;
        set((s) => ({
          items: s.items.map((c) => {
            if (c.id !== id) return c;
            const newEv: ClaimEvidence = {
              ...ev,
              id: `ev_${Math.random().toString(36).slice(2, 9)}`,
              uploadedAt: new Date().toISOString(),
            };
            updated = { ...c, evidence: [...c.evidence, newEv] };
            return updated;
          }),
        }));
        return updated;
      },
      setInternalNote: (id, note) =>
        set((s) => ({
          items: s.items.map((c) =>
            c.id === id ? { ...c, internalReviewNote: note } : c,
          ),
        })),
      setResolutionNote: (id, note) =>
        set((s) => ({
          items: s.items.map((c) =>
            c.id === id ? { ...c, resolutionNote: note } : c,
          ),
        })),
      getById: (id) => get().items.find((c) => c.id === id),
    }),
    {
      name: "arsemia.claims.v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
