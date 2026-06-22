"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/* ─────────────────────────────────────────────────────────────
 * Quote schema — clean downstream data on save.
 * ────────────────────────────────────────────────────────── */

export type JobType =
  | "Local Move"
  | "Hourly"
  | "Long Distance"
  | "LD Pick Up"
  | "LD Delivery"
  | "LD Consolidated Delivery"
  | "Delivery"
  | "Pick Up"
  | "Storage"
  | "Storage Move In"
  | "Storage Move Out"
  | "Driving Day"
  | "2nd Day"
  | "Commercial"
  | "Other";

export const JOB_TYPES: JobType[] = [
  "Local Move",
  "Hourly",
  "Long Distance",
  "LD Pick Up",
  "LD Delivery",
  "LD Consolidated Delivery",
  "Delivery",
  "Pick Up",
  "Storage",
  "Storage Move In",
  "Storage Move Out",
  "Driving Day",
  "2nd Day",
  "Commercial",
  "Other",
];

export type QuoteStatus =
  | "Draft"
  | "Sent"
  | "Booked"
  | "Converted to Job"
  | "Lost"
  | "Cancelled";

export interface QuoteInventoryLine {
  itemName: string;
  qty: number;
  cuftEach: number;
  packByCrew?: boolean;
}

export interface QuoteFee {
  id: string;
  name: string;
  amount: number;
  commissionable: boolean;
  customerVisible: boolean;
  /** If true, this is the Administrative Surcharge — special-cased in UI. */
  isAdminCharge?: boolean;
}

export interface QuoteNotes {
  customer?: string;
  foreman?: string;
  internal?: string;
  accounting?: string;
}

export interface QuoteMileage {
  miles: number;
  customerRatePerMile: number;
  internalRatePerMile: number;
}

export interface Quote {
  id: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  leadId?: string;
  jobType: JobType;
  otherDescription?: string;
  moveDate?: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  estimatedCuFt: number;
  inventory: QuoteInventoryLine[];
  fees: QuoteFee[];
  mileage: QuoteMileage;
  notes: QuoteNotes;
  customerTotal: number;
  commissionableBase: number;
  nonCommissionableTotal: number;
  status: QuoteStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface QuotesStoreState {
  quotes: Quote[];
  saveQuote: (q: Omit<Quote, "id" | "createdAt" | "updatedAt">) => Quote;
  updateQuote: (id: string, patch: Partial<Quote>) => Quote | undefined;
  /** Clone an existing quote OR job inventory into a fresh draft. */
  cloneAsDraft: (
    source: Partial<Quote> & { customerName: string },
    overrides?: Partial<Quote>,
  ) => Quote;
  getById: (id: string) => Quote | undefined;
}

let counter = 1000;

function nextId(): string {
  counter += 1;
  return `QT-${counter + Math.floor(Math.random() * 100)}`;
}

export const useQuotesStore = create<QuotesStoreState>()(
  persist(
    (set, get) => ({
      quotes: [],
      saveQuote: (q) => {
        const now = new Date().toISOString();
        const newQuote: Quote = {
          ...q,
          id: nextId(),
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ quotes: [newQuote, ...s.quotes] }));
        return newQuote;
      },
      updateQuote: (id, patch) => {
        let updated: Quote | undefined;
        set((s) => ({
          quotes: s.quotes.map((q) => {
            if (q.id !== id) return q;
            updated = { ...q, ...patch, updatedAt: new Date().toISOString() };
            return updated;
          }),
        }));
        return updated;
      },
      cloneAsDraft: (source, overrides) => {
        const now = new Date().toISOString();
        const clone: Quote = {
          id: nextId(),
          customerId: source.customerId,
          customerName: source.customerName,
          customerPhone: source.customerPhone,
          customerEmail: source.customerEmail,
          leadId: source.leadId,
          jobType: source.jobType ?? "Local Move",
          otherDescription: source.otherDescription,
          moveDate: undefined,
          pickupAddress: source.pickupAddress,
          deliveryAddress: source.deliveryAddress,
          estimatedCuFt: source.estimatedCuFt ?? 0,
          inventory: source.inventory ?? [],
          fees: source.fees ?? [],
          mileage: source.mileage ?? {
            miles: 0,
            customerRatePerMile: 7,
            internalRatePerMile: 3,
          },
          notes: source.notes ?? {},
          customerTotal: source.customerTotal ?? 0,
          commissionableBase: source.commissionableBase ?? 0,
          nonCommissionableTotal: source.nonCommissionableTotal ?? 0,
          status: "Draft",
          createdAt: now,
          updatedAt: now,
          createdBy: source.createdBy ?? "u_owner",
          ...overrides,
        };
        set((s) => ({ quotes: [clone, ...s.quotes] }));
        return clone;
      },
      getById: (id) => get().quotes.find((q) => q.id === id),
    }),
    {
      name: "arsemia.quotes.v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
