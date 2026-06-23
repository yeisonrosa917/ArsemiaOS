"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type InvoiceStatus =
  | "Draft"
  | "Sent"
  | "Viewed"
  | "Partially Paid"
  | "Paid"
  | "Overdue"
  | "Void"
  | "Refunded";

export const INVOICE_STATUSES: InvoiceStatus[] = [
  "Draft",
  "Sent",
  "Viewed",
  "Partially Paid",
  "Paid",
  "Overdue",
  "Void",
  "Refunded",
];

export type InvoiceType =
  | "Client Invoice"
  | "Quote Invoice"
  | "Job Invoice"
  | "Adjustment Invoice"
  | "Receipt";

export interface InvoiceLine {
  description: string;
  qty: number;
  unitPrice: number;
  /** Admin charge, packing, mileage, handling, taxes etc. */
  category: "CuFt" | "Mileage" | "Packing" | "Handling" | "Admin" | "Adjustment" | "Other";
}

export interface InvoicePayment {
  id: string;
  amount: number;
  method: "Card" | "Cash" | "ACH" | "Check" | "Zelle" | "Stripe";
  receivedAt: string;
  receivedBy: string;
  reference?: string;
}

export interface Invoice {
  id: string;
  type: InvoiceType;
  customerName: string;
  customerId?: string;
  quoteId?: string;
  jobId?: string;
  lines: InvoiceLine[];
  total: number;
  paid: number;
  balance: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  payments: InvoicePayment[];
  notes?: string;
  createdBy: string;
}

const SEED: Invoice[] = [
  {
    id: "INV-1001",
    type: "Job Invoice",
    customerName: "Sofia Martinez",
    customerId: "CUS-401",
    jobId: "JOB-10421",
    lines: [
      { description: "Local Move — 640 ft³", qty: 1, unitPrice: 960, category: "CuFt" },
      { description: "Mileage — 4.2 mi @ $7/mi", qty: 1, unitPrice: 29.4, category: "Mileage" },
      { description: "Stairs (1 flight)", qty: 1, unitPrice: 35, category: "Handling" },
      { description: "Piano handling (upright)", qty: 1, unitPrice: 200, category: "Handling" },
      { description: "Administrative Surcharge", qty: 1, unitPrice: 150, category: "Admin" },
    ],
    total: 1374.4,
    paid: 1374.4,
    balance: 0,
    status: "Paid",
    issueDate: "2026-06-22",
    dueDate: "2026-07-06",
    paidDate: "2026-06-22",
    payments: [
      {
        id: "p_001",
        amount: 1374.4,
        method: "Card",
        receivedAt: "2026-06-22T16:30:00",
        receivedBy: "Luis Mendoza",
        reference: "stripe_pi_3Nxk...",
      },
    ],
    createdBy: "u_acc",
  },
  {
    id: "INV-1002",
    type: "Client Invoice",
    customerName: "Hayward Logistics LLC",
    customerId: "CUS-402",
    jobId: "JOB-10422",
    lines: [
      { description: "Commercial Move — 1240 ft³", qty: 1, unitPrice: 1860, category: "CuFt" },
      { description: "Mileage — 18.6 mi @ $7/mi", qty: 1, unitPrice: 130.2, category: "Mileage" },
      { description: "Administrative Surcharge", qty: 1, unitPrice: 250, category: "Admin" },
    ],
    total: 2240.2,
    paid: 0,
    balance: 2240.2,
    status: "Sent",
    issueDate: "2026-06-22",
    dueDate: "2026-07-22",
    payments: [],
    createdBy: "u_acc",
  },
  {
    id: "INV-1003",
    type: "Adjustment Invoice",
    customerName: "Sofia Martinez",
    customerId: "CUS-401",
    jobId: "JOB-10421",
    lines: [
      { description: "10 extra medium boxes", qty: 10, unitPrice: 16, category: "Adjustment" },
      { description: "Extra packing — dining room", qty: 1, unitPrice: 120, category: "Packing" },
      { description: "Wall mirror handling", qty: 1, unitPrice: 25, category: "Handling" },
    ],
    total: 305,
    paid: 305,
    balance: 0,
    status: "Paid",
    issueDate: "2026-06-22",
    dueDate: "2026-06-22",
    paidDate: "2026-06-22",
    payments: [
      {
        id: "p_002",
        amount: 305,
        method: "Stripe",
        receivedAt: "2026-06-22T14:10:00",
        receivedBy: "System (auto)",
        reference: "stripe_link_adj_1001",
      },
    ],
    notes: "Linked to adjustment ADJ-1001.",
    createdBy: "u_sell",
  },
  {
    id: "INV-1004",
    type: "Job Invoice",
    customerName: "Marcus Thompson",
    customerId: "CUS-404",
    jobId: "JOB-10424",
    lines: [
      { description: "Local Move — 920 ft³", qty: 1, unitPrice: 1380, category: "CuFt" },
      { description: "Mileage — 8.4 mi @ $7/mi", qty: 1, unitPrice: 58.8, category: "Mileage" },
      { description: "Crew packing", qty: 1, unitPrice: 480, category: "Packing" },
      { description: "Stairs (2 flights pickup)", qty: 1, unitPrice: 70, category: "Handling" },
      { description: "Administrative Surcharge", qty: 1, unitPrice: 200, category: "Admin" },
    ],
    total: 2188.8,
    paid: 0,
    balance: 2188.8,
    status: "Overdue",
    issueDate: "2026-05-30",
    dueDate: "2026-06-14",
    payments: [],
    notes: "Customer has not responded to 2 follow-ups.",
    createdBy: "u_acc",
  },
  {
    id: "INV-1005",
    type: "Receipt",
    customerName: "Olivia Chen",
    customerId: "CUS-403",
    jobId: "JOB-10423",
    lines: [
      { description: "Storage move-in 285 ft³", qty: 1, unitPrice: 427.5, category: "CuFt" },
      { description: "First month storage", qty: 1, unitPrice: 285, category: "Other" },
    ],
    total: 712.5,
    paid: 712.5,
    balance: 0,
    status: "Paid",
    issueDate: "2026-06-21",
    dueDate: "2026-06-21",
    paidDate: "2026-06-21",
    payments: [
      {
        id: "p_003",
        amount: 712.5,
        method: "ACH",
        receivedAt: "2026-06-21T11:00:00",
        receivedBy: "Luis Mendoza",
      },
    ],
    createdBy: "u_acc",
  },
];

interface InvoicesState {
  items: Invoice[];
  setStatus: (id: string, status: InvoiceStatus, by: string) => Invoice | undefined;
  recordPayment: (id: string, payment: Omit<InvoicePayment, "id">) => Invoice | undefined;
  voidInvoice: (id: string) => Invoice | undefined;
  getById: (id: string) => Invoice | undefined;
}

export const useInvoices = create<InvoicesState>()(
  persist(
    (set, get) => ({
      items: SEED,
      setStatus: (id, status) => {
        let updated: Invoice | undefined;
        set((s) => ({
          items: s.items.map((inv) => {
            if (inv.id !== id) return inv;
            const patch: Partial<Invoice> = { status };
            if (status === "Paid") patch.paidDate = new Date().toISOString().slice(0, 10);
            updated = { ...inv, ...patch };
            return updated;
          }),
        }));
        return updated;
      },
      recordPayment: (id, payment) => {
        let updated: Invoice | undefined;
        set((s) => ({
          items: s.items.map((inv) => {
            if (inv.id !== id) return inv;
            const newPayment: InvoicePayment = {
              ...payment,
              id: `p_${Math.random().toString(36).slice(2, 9)}`,
            };
            const payments = [...inv.payments, newPayment];
            const paid = payments.reduce((sum, p) => sum + p.amount, 0);
            const balance = Math.max(0, inv.total - paid);
            const status: InvoiceStatus =
              balance === 0 ? "Paid" : paid > 0 ? "Partially Paid" : inv.status;
            updated = {
              ...inv,
              payments,
              paid,
              balance,
              status,
              paidDate:
                balance === 0
                  ? new Date().toISOString().slice(0, 10)
                  : inv.paidDate,
            };
            return updated;
          }),
        }));
        return updated;
      },
      voidInvoice: (id) => {
        let updated: Invoice | undefined;
        set((s) => ({
          items: s.items.map((inv) => {
            if (inv.id !== id) return inv;
            updated = { ...inv, status: "Void" };
            return updated;
          }),
        }));
        return updated;
      },
      getById: (id) => get().items.find((i) => i.id === id),
    }),
    {
      name: "arsemia.invoices.v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
