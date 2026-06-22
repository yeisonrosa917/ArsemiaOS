"use client";

import { create } from "zustand";

export type NotificationKind =
  | "job_reassigned"
  | "job_updated"
  | "lead_new"
  | "payroll_flag"
  | "claim_new"
  | "info";

export interface Notification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  /** Target route to open when clicked, if any. */
  href?: string;
}

interface NotificationsState {
  items: Notification[];
  push: (n: Omit<Notification, "id" | "createdAt" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clear: () => void;
}

const initial: Notification[] = [
  {
    id: "n_001",
    kind: "lead_new",
    title: "New lead from Yelp",
    body: "Sofia Martinez — Brickell → Coral Gables, ~480 ft³.",
    href: "/leads",
    createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    read: false,
  },
  {
    id: "n_002",
    kind: "payroll_flag",
    title: "Payroll variance",
    body: "Job #1479260 underpaid by $35.12 vs expected.",
    href: "/payroll",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
  },
  {
    id: "n_003",
    kind: "claim_new",
    title: "Claim opened",
    body: "Hayward Logistics flagged minor furniture damage.",
    href: "/claims",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: true,
  },
];

export const useNotifications = create<NotificationsState>((set) => ({
  items: initial,
  push: (n) =>
    set((s) => ({
      items: [
        {
          ...n,
          id: `n_${Math.random().toString(36).slice(2, 9)}`,
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...s.items,
      ],
    })),
  markRead: (id) =>
    set((s) => ({
      items: s.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markAllRead: () =>
    set((s) => ({ items: s.items.map((n) => ({ ...n, read: true })) })),
  clear: () => set({ items: [] }),
}));
