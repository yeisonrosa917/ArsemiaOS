"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type NotificationKind =
  | "expense_pending"
  | "expense_missing_receipt"
  | "claim_foreman_response"
  | "claim_evidence_needed"
  | "claim_status_changed"
  | "invoice_overdue"
  | "invoice_paid"
  | "payroll_flag"
  | "payroll_pending"
  | "fleet_maintenance"
  | "fleet_insurance"
  | "fleet_registration"
  | "job_unassigned"
  | "job_reassigned"
  | "adjustment_requested"
  | "quote_saved"
  | "lead_assigned"
  | "lead_followup"
  | "settings_reset"
  | "info";

export type NotificationSeverity = "info" | "warning" | "danger";
export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export interface Notification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  severity: NotificationSeverity;
  href?: string;
  /** Optional role this notification is targeted to. If undefined, visible to all. */
  audience?: string;
  /** Optional dedupe key — derived notifications regenerate if this source still applies. */
  sourceKey?: string;
  /** How urgently someone needs to act. */
  priority?: NotificationPriority;
  /** Optional due date (ISO) for the action. */
  dueDate?: string;
}

interface NotificationsState {
  items: Notification[];
  push: (n: Omit<Notification, "id" | "createdAt" | "read">) => void;
  markRead: (id: string) => void;
  markUnread: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  clear: () => void;
  /** Replace all derived items (those with sourceKey) with the supplied batch, preserving read state. */
  syncDerived: (next: Array<Omit<Notification, "id" | "createdAt" | "read">>) => void;
}

const SEED: Notification[] = [];

export const useNotifications = create<NotificationsState>()(
  persist(
    (set) => ({
      items: SEED,
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
      markUnread: (id) =>
        set((s) => ({
          items: s.items.map((n) => (n.id === id ? { ...n, read: false } : n)),
        })),
      markAllRead: () =>
        set((s) => ({ items: s.items.map((n) => ({ ...n, read: true })) })),
      remove: (id) =>
        set((s) => ({ items: s.items.filter((n) => n.id !== id) })),
      clear: () => set({ items: [] }),
      syncDerived: (next) =>
        set((s) => {
          const readMap = new Map(
            s.items.filter((n) => n.sourceKey).map((n) => [n.sourceKey!, n.read]),
          );
          const manual = s.items.filter((n) => !n.sourceKey);
          const derived = next.map((n) => ({
            ...n,
            id: `n_d_${n.sourceKey ?? Math.random().toString(36).slice(2, 9)}`,
            createdAt: new Date().toISOString(),
            read: n.sourceKey ? (readMap.get(n.sourceKey) ?? false) : false,
          }));
          return { items: [...derived, ...manual] };
        }),
    }),
    {
      name: "arsemia.notifications.v2",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
