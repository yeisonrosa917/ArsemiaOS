"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  Boxes,
  ClipboardList,
  Truck as TruckIcon,
  UserSquare2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { drivers } from "@/lib/mock-data";
import { useJobsStore } from "@/lib/store/jobs";
import { useFleet } from "@/lib/store/fleet";
import { vehicleCapacity, capacityLevel } from "@/lib/fleet/capacity";
import { cn, formatNumber } from "@/lib/utils";

/**
 * Capacity & Load tab — is the selected day physically doable?
 * Pure derivation from the existing jobs/roster/fleet stores. Demo data,
 * local only — labelled as such in the UI.
 */
export function CapacityLoad({ selectedDate }: { selectedDate: string }) {
  const jobs = useJobsStore((s) => s.jobs);
  const vehicles = useFleet((s) => s.vehicles);

  const m = useMemo(() => {
    const dayJobs = jobs.filter(
      (j) => (j.scheduledAt ?? "").slice(0, 10) === selectedDate && j.status !== "Cancelled",
    );
    const assigned = dayJobs.filter((j) => Boolean(j.driverId) && j.status !== "Unassigned");
    const unassigned = dayJobs.length - assigned.length;

    const workingForemanIds = new Set(assigned.map((j) => j.driverId));
    const foremenAvailable = drivers.filter((d) => d.status !== "Offline").length;

    const trucksAvailable = vehicles.filter(
      (v) => v.status === "Active" || v.status === "Idle",
    ).length;
    const trucksAssigned = new Set(
      [...workingForemanIds]
        .map((id) => drivers.find((d) => d.id === id)?.vehicleId)
        .filter(Boolean),
    ).size;

    const totalCuFt = dayJobs.reduce((s, j) => s + j.cuFt, 0);
    const fleetSafeCuFt = vehicles
      .filter((v) => v.status === "Active" || v.status === "Idle")
      .reduce((s, v) => s + vehicleCapacity(v).safe, 0);

    // Over-capacity: per assigned foreman, day load vs their truck's capacity.
    let overloadedTrucks = 0;
    workingForemanIds.forEach((fid) => {
      const d = drivers.find((x) => x.id === fid);
      const truck = d ? vehicles.find((v) => v.id === d.vehicleId) : undefined;
      if (!truck) return;
      const load = assigned
        .filter((j) => j.driverId === fid)
        .reduce((s, j) => s + j.cuFt, 0);
      if (capacityLevel(load, vehicleCapacity(truck)) === "over") overloadedTrucks += 1;
    });

    const longDistance = dayJobs.filter((j) => j.type === "Long Distance").length;
    const storageMoves = dayJobs.filter(
      (j) => j.type === "Storage In" || j.type === "Storage Out",
    ).length;

    return {
      dayJobs: dayJobs.length,
      assigned: assigned.length,
      unassigned,
      foremenAvailable,
      foremenWorking: workingForemanIds.size,
      trucksAvailable,
      trucksAssigned,
      totalCuFt,
      fleetSafeCuFt,
      overloadedTrucks,
      longDistance,
      storageMoves,
    };
  }, [jobs, vehicles, selectedDate]);

  const loadPct = m.fleetSafeCuFt > 0 ? Math.round((m.totalCuFt / m.fleetSafeCuFt) * 100) : 0;

  return (
    <div className="space-y-4">
      <p className="text-[11px] text-muted-foreground">
        Operational summary for the selected date · derived from demo data (local only)
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={ClipboardList} label="Jobs this day" value={String(m.dayJobs)} sub={`${m.longDistance} long-distance · ${m.storageMoves} storage`} />
        <Kpi
          icon={AlertTriangle}
          label="Assigned / Unassigned"
          value={`${m.assigned} / ${m.unassigned}`}
          tone={m.unassigned > 0 ? "danger" : undefined}
          sub={m.unassigned > 0 ? "unassigned jobs need dispatch" : "all jobs have a foreman"}
        />
        <Kpi
          icon={UserSquare2}
          label="Foremen working / available"
          value={`${m.foremenWorking} / ${m.foremenAvailable}`}
          sub={`${drivers.length} on roster`}
        />
        <Kpi
          icon={TruckIcon}
          label="Trucks assigned / available"
          value={`${m.trucksAssigned} / ${m.trucksAvailable}`}
          tone={m.overloadedTrucks > 0 ? "danger" : undefined}
          sub={m.overloadedTrucks > 0 ? `${m.overloadedTrucks} over capacity!` : "no capacity breaches"}
        />
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-semibold">
            <Boxes className="h-4 w-4 text-muted-foreground" />
            Day load vs available fleet capacity (safe)
          </span>
          <span className="font-mono text-xs font-semibold">
            {formatNumber(m.totalCuFt)} / {formatNumber(m.fleetSafeCuFt)} cuft · {loadPct}%
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full",
              loadPct > 100 ? "bg-rose-500" : loadPct > 85 ? "bg-amber-500" : "bg-emerald-500",
            )}
            style={{ width: `${Math.min(100, loadPct)}%` }}
          />
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          Rough guide only: compares the day&apos;s total CuFt against the summed safe
          capacity of Active/Idle trucks. Per-truck breaches appear in Truck Assignment.
        </p>
      </Card>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  tone?: "danger";
}) {
  return (
    <Card className={cn("border p-3", tone === "danger" && "border-rose-500/40 bg-rose-500/[0.04]")}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icon className={cn("h-4 w-4", tone === "danger" ? "text-rose-500" : "text-muted-foreground/60")} />
      </div>
      <p className="mt-1 font-mono text-2xl font-bold">{value}</p>
      {sub && <p className="mt-0.5 text-[10px] text-muted-foreground">{sub}</p>}
    </Card>
  );
}
