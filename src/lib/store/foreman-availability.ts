"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Availability = "available" | "break" | "offline";

interface AvailabilityState {
  /** foremanId → availability override set by dispatch/owner. */
  overrides: Record<string, Availability>;
  setAvailability: (foremanId: string, value: Availability) => void;
}

export const useForemanAvailability = create<AvailabilityState>()(
  persist(
    (set) => ({
      overrides: {},
      setAvailability: (foremanId, value) =>
        set((s) => ({ overrides: { ...s.overrides, [foremanId]: value } })),
    }),
    {
      name: "arsemia.foreman-availability.v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  available: "Available",
  break: "On break",
  offline: "Offline",
};

export const AVAILABILITY_STYLES: Record<Availability, string> = {
  available: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  break: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  offline: "bg-slate-500/15 text-slate-600 border-slate-500/30",
};
