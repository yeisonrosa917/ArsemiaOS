"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { allJobs } from "@/lib/data/all-jobs";
import { logEvent, type EventContext } from "@/lib/store/activity-log";

/**
 * Warehouse preload / load-before-delivery tasks (Sprint 3 QA patch).
 *
 * The smallest useful model for a real field problem: a delivery that ships
 * out of the warehouse usually requires loading the truck THE DAY BEFORE.
 * That load blocks the foreman/truck after their normal jobs, so dispatch
 * and the foreman must both see it.
 *
 * These are INTERNAL OPERATIONAL TASKS, not customer-facing jobs. They are
 * linked to their delivery job and emit unified timeline events on that job.
 *
 * Deliberately NOT built here (deferred): scan sessions, pallets, warehouse
 * inventory, automatic task creation for new bookings, LD travel blocks.
 * Seeded deterministically from the demo jobs; automation is a TODO for the
 * warehouse sprint.
 */

export type PreloadStatus = "Needed" | "Assigned" | "Completed" | "Skipped";

export interface PreloadTask {
  id: string;
  /** The customer-facing delivery job this load feeds. */
  deliveryJobId: string;
  deliveryCustomer: string;
  deliveryDate: string;
  /** The day the truck must be loaded (usually delivery date − 1). */
  date: string;
  warehouse: string;
  foremanId?: string;
  foremanName?: string;
  truckId?: string;
  status: PreloadStatus;
  note?: string;
}

function shiftDay(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + delta)).toISOString().slice(0, 10);
}

/**
 * Deterministic seed: upcoming warehouse-out runs need a preload the day
 * before. Candidates are Delivery / Storage Out jobs plus Long Distance
 * runs (the classic case: load at the warehouse today, drive to Orlando
 * tomorrow). Derived from the date-anchored jobs seed so the demo always
 * has live tasks; if the delivery job has a foreman the task starts
 * Assigned, otherwise Needed.
 */
function buildSeed(): PreloadTask[] {
  const todayIso = new Date().toISOString().slice(0, 10);
  const horizon = shiftDay(todayIso, 14);
  return allJobs
    .filter(
      (j) =>
        (j.type === "Delivery" || j.type === "Storage Out" || j.type === "Long Distance") &&
        j.status !== "Cancelled" &&
        j.status !== "Completed" &&
        (j.scheduledAt ?? "").slice(0, 10) > todayIso &&
        (j.scheduledAt ?? "").slice(0, 10) <= horizon,
    )
    .slice(0, 4)
    .map((j) => {
      const deliveryDate = j.scheduledAt.slice(0, 10);
      return {
        id: `PRE-${j.id}`,
        deliveryJobId: j.id,
        deliveryCustomer: j.customer,
        deliveryDate,
        date: shiftDay(deliveryDate, -1),
        warehouse: "Doral warehouse",
        foremanId: j.driverId,
        foremanName: j.driverName,
        truckId: j.truckId,
        status: j.driverId ? "Assigned" : "Needed",
      };
    });
}

interface PreloadTasksState {
  tasks: PreloadTask[];
  /** Mark loaded / skipped (skip requires a note). Emits a timeline event. */
  setStatus: (
    id: string,
    status: Extract<PreloadStatus, "Completed" | "Skipped">,
    ctx?: EventContext & { note?: string },
  ) => void;
  reset: () => void;
}

export const usePreloadTasks = create<PreloadTasksState>()(
  persist(
    (set, get) => ({
      tasks: buildSeed(),
      setStatus: (id, status, ctx) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task || task.status === status) return;
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, status, note: ctx?.note ?? t.note } : t,
          ),
        }));
        logEvent({
          eventType: status === "Completed" ? "warehouse_preload_completed" : "warehouse_preload_skipped",
          message:
            status === "Completed"
              ? `Warehouse preload completed — truck loaded at ${task.warehouse} for delivery ${task.deliveryJobId} (${task.deliveryDate}).`
              : `Warehouse preload skipped for delivery ${task.deliveryJobId}${ctx?.note ? ` — ${ctx.note}` : ""}.`,
          action: "status_changed",
          linkedType: "job",
          linkedId: task.deliveryJobId,
          notes: ctx?.note,
          actorId: ctx?.actorId,
          actorName: ctx?.actorName,
          actorRole: ctx?.actorRole,
          source: ctx?.source,
        });
      },
      reset: () => set({ tasks: buildSeed() }),
    }),
    {
      name: "arsemia.preload-tasks.v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const PRELOAD_STATUS_STYLE: Record<PreloadStatus, string> = {
  Needed: "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-300",
  Assigned: "border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-300",
  Completed: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  Skipped: "border-slate-400/40 bg-slate-500/10 text-slate-600 dark:text-slate-300",
};
