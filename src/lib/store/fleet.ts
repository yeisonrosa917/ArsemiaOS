"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { vehicles as SEED } from "@/lib/mock-data";
import type { Vehicle, VehicleStatus } from "@/lib/types";

export type FleetVehicle = Vehicle & {
  make?: string;
  model?: string;
  year?: number;
  notes?: string;
};

function migrateSeed(): FleetVehicle[] {
  const parse = (name: string, type: string) => {
    const yearMatch = name.match(/(20\d{2})/);
    return {
      year: yearMatch ? Number(yearMatch[1]) : undefined,
      make: type.split(" ")[0],
      model: type,
    };
  };
  return SEED.map((v) => ({ ...v, ...parse(v.name, v.type) }));
}

interface FleetState {
  vehicles: FleetVehicle[];
  update: (id: string, patch: Partial<FleetVehicle>) => FleetVehicle | undefined;
  setStatus: (id: string, status: VehicleStatus) => FleetVehicle | undefined;
  getById: (id: string) => FleetVehicle | undefined;
}

export const useFleet = create<FleetState>()(
  persist(
    (set, get) => ({
      vehicles: migrateSeed(),
      update: (id, patch) => {
        let updated: FleetVehicle | undefined;
        set((s) => ({
          vehicles: s.vehicles.map((v) => {
            if (v.id !== id) return v;
            updated = { ...v, ...patch };
            return updated;
          }),
        }));
        return updated;
      },
      setStatus: (id, status) => {
        let updated: FleetVehicle | undefined;
        set((s) => ({
          vehicles: s.vehicles.map((v) => {
            if (v.id !== id) return v;
            updated = { ...v, status };
            return updated;
          }),
        }));
        return updated;
      },
      getById: (id) => get().vehicles.find((v) => v.id === id),
    }),
    {
      name: "arsemia.fleet.v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
