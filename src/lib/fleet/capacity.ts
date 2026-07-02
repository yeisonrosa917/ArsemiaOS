import type { VehicleType } from "@/lib/types";

/**
 * Truck CuFt capacity. Every vehicle type has a realistic max and a safe
 * recommended load. These are the defaults; each vehicle can override them in
 * Fleet. The hub uses these to warn/block impossible assignments.
 */
export const DEFAULT_CAPACITY: Record<VehicleType, { max: number; safe: number }> = {
  "Cargo Van": { max: 300, safe: 240 },
  "Ford Transit 250": { max: 350, safe: 290 },
  "Mercedes Sprinter 144": { max: 400, safe: 340 },
  "Mercedes Sprinter 170": { max: 500, safe: 420 },
  "ISUZU NPR 20'": { max: 1000, safe: 850 },
  "Box Truck": { max: 1100, safe: 950 },
  "ISUZU NPR 26'": { max: 1600, safe: 1400 },
  "Freightliner M2 26'": { max: 1700, safe: 1450 },
};

export interface VehicleCapacity {
  max: number;
  safe: number;
}

/** Resolve a vehicle's capacity, preferring explicit overrides over type defaults. */
export function vehicleCapacity(v: {
  type: VehicleType;
  maxCuFtCapacity?: number;
  safeRecommendedCuFt?: number;
}): VehicleCapacity {
  const def = DEFAULT_CAPACITY[v.type] ?? { max: 1000, safe: 850 };
  return {
    max: v.maxCuFtCapacity ?? def.max,
    safe: v.safeRecommendedCuFt ?? def.safe,
  };
}

export type CapacityLevel = "fits" | "tight" | "over";

/** Green (fits ≤ safe) · Yellow (tight ≤ max) · Red (over > max). */
export function capacityLevel(cuFt: number, cap: VehicleCapacity): CapacityLevel {
  if (cuFt > cap.max) return "over";
  if (cuFt > cap.safe) return "tight";
  return "fits";
}

export function capacityMessage(
  cuFt: number,
  cap: VehicleCapacity,
  truckName?: string,
): string {
  const truck = truckName ? truckName.split(" - ")[0] : "This truck";
  const level = capacityLevel(cuFt, cap);
  if (level === "over")
    return `Capacity exceeded. ${truck} safe load is ${cap.safe} CuFt (max ${cap.max}); this job is ${cuFt} CuFt. Assign a larger truck or split into two.`;
  if (level === "tight")
    return `Close to capacity. ${truck} safe load is ${cap.safe} CuFt; this job is ${cuFt} CuFt. Review inventory before confirming.`;
  return `Fits safely. ${truck} safe load is ${cap.safe} CuFt; this job is ${cuFt} CuFt.`;
}

export const CAPACITY_STYLES: Record<CapacityLevel, string> = {
  fits: "border-emerald-500/40 bg-emerald-500/[0.06] text-emerald-700",
  tight: "border-amber-500/40 bg-amber-500/[0.06] text-amber-700",
  over: "border-rose-500/40 bg-rose-500/[0.06] text-rose-700",
};

export const CAPACITY_LABEL: Record<CapacityLevel, string> = {
  fits: "Fits",
  tight: "Tight",
  over: "Over capacity",
};
