"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createId } from "@/lib/id";
import { vehicles as SEED } from "@/lib/mock-data";
import type { Vehicle, VehicleStatus } from "@/lib/types";
import { DEFAULT_CAPACITY } from "@/lib/fleet/capacity";

export type FleetVehicle = Vehicle & {
  make?: string;
  model?: string;
  year?: number;
  notes?: string;
  /** CuFt the truck can physically hold. */
  maxCuFtCapacity?: number;
  /** CuFt we recommend loading (leaves margin). */
  safeRecommendedCuFt?: number;
};

/* ---------------- Maintenance & inspections ---------------- */

export type MaintenanceKind = "Maintenance" | "Inspection" | "Repair";
export type MaintenanceOutcome = "Completed" | "Passed" | "Failed" | "Scheduled";

export const MAINTENANCE_KINDS: MaintenanceKind[] = ["Maintenance", "Inspection", "Repair"];
export const MAINTENANCE_OUTCOMES: MaintenanceOutcome[] = ["Completed", "Passed", "Failed", "Scheduled"];

export const MAINTENANCE_OUTCOME_STYLE: Record<MaintenanceOutcome, string> = {
  Completed: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
  Passed: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
  Failed: "border-rose-500/40 bg-rose-500/10 text-rose-600",
  Scheduled: "border-sky-500/40 bg-sky-500/10 text-sky-600",
};

export const MAINTENANCE_KIND_STYLE: Record<MaintenanceKind, string> = {
  Maintenance: "border-indigo-500/40 bg-indigo-500/10 text-indigo-600",
  Inspection: "border-amber-500/40 bg-amber-500/10 text-amber-600",
  Repair: "border-violet-500/40 bg-violet-500/10 text-violet-600",
};

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  kind: MaintenanceKind;
  title: string;
  date: string;
  odometer?: number;
  cost?: number;
  vendor?: string;
  outcome: MaintenanceOutcome;
  /** If set, becomes the vehicle's next-maintenance date. */
  nextDue?: string;
  notes?: string;
}

const SEED_RECORDS: MaintenanceRecord[] = [
  { id: "MNT-5001", vehicleId: "VEH-204", kind: "Maintenance", title: "Oil change + brake inspection", date: "2026-05-14", odometer: 82150, cost: 240, vendor: "Doral Fleet Service", outcome: "Completed", nextDue: "2026-06-12" },
  { id: "MNT-5002", vehicleId: "VEH-204", kind: "Inspection", title: "Annual DOT inspection", date: "2026-03-02", odometer: 78900, cost: 180, vendor: "FL DOT Certified", outcome: "Passed" },
  { id: "MNT-5003", vehicleId: "VEH-212", kind: "Repair", title: "Liftgate hydraulic cylinder replacement", date: "2026-06-20", odometer: 60800, cost: 620, vendor: "Hialeah Truck Repair", outcome: "Completed" },
  { id: "MNT-5004", vehicleId: "VEH-230", kind: "Inspection", title: "Annual DOT inspection — brake wear flagged", date: "2026-06-28", odometer: 71200, cost: 180, vendor: "FL DOT Certified", outcome: "Failed", notes: "Rear brakes below spec — re-inspect after pad replacement." },
  { id: "MNT-5005", vehicleId: "VEH-218", kind: "Maintenance", title: "Tire rotation + fluids", date: "2026-06-05", odometer: 47100, cost: 130, vendor: "Doral Fleet Service", outcome: "Completed", nextDue: "2026-07-09" },
];

function migrateSeed(): FleetVehicle[] {
  const parse = (name: string, type: string) => {
    const yearMatch = name.match(/(20\d{2})/);
    return {
      year: yearMatch ? Number(yearMatch[1]) : undefined,
      make: type.split(" ")[0],
      model: type,
    };
  };
  return SEED.map((v) => {
    const cap = DEFAULT_CAPACITY[v.type] ?? { max: 1000, safe: 850 };
    return {
      ...v,
      ...parse(v.name, v.type),
      maxCuFtCapacity: cap.max,
      safeRecommendedCuFt: cap.safe,
    };
  });
}

interface FleetState {
  vehicles: FleetVehicle[];
  records: MaintenanceRecord[];
  update: (id: string, patch: Partial<FleetVehicle>) => FleetVehicle | undefined;
  setStatus: (id: string, status: VehicleStatus) => FleetVehicle | undefined;
  getById: (id: string) => FleetVehicle | undefined;
  addRecord: (input: Omit<MaintenanceRecord, "id">) => MaintenanceRecord;
  recordsForVehicle: (vehicleId: string) => MaintenanceRecord[];
}

function mkRecordId(): string {
  return createId("maintenance");
}

export const useFleet = create<FleetState>()(
  persist(
    (set, get) => ({
      vehicles: migrateSeed(),
      records: SEED_RECORDS,
      addRecord: (input) => {
        const record: MaintenanceRecord = { ...input, id: mkRecordId() };
        set((s) => {
          // A logged next-due date advances the vehicle's next-maintenance date.
          const vehicles = record.nextDue
            ? s.vehicles.map((v) => (v.id === record.vehicleId ? { ...v, nextMaintenance: record.nextDue as string } : v))
            : s.vehicles;
          return { records: [record, ...s.records], vehicles };
        });
        return record;
      },
      recordsForVehicle: (vehicleId) =>
        get()
          .records.filter((r) => r.vehicleId === vehicleId)
          .sort((a, b) => b.date.localeCompare(a.date)),
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
      name: "arsemia.fleet.v2",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
