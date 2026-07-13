"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AlertTriangle, Truck as TruckIcon, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VehicleStatusBadge } from "@/components/shared/status-badge";
import { drivers } from "@/lib/mock-data";
import { useJobsStore } from "@/lib/store/jobs";
import { useFleet } from "@/lib/store/fleet";
import { vehicleCapacity, capacityLevel } from "@/lib/fleet/capacity";
import { cn, formatNumber } from "@/lib/utils";

/**
 * Truck Assignment tab — which truck carries what on the selected date.
 * Derives assignments truck → foreman (existing pairing) → that foreman's jobs.
 * Read-only; Fleet remains the asset-management home.
 */
export function TruckAssignment({ selectedDate }: { selectedDate: string }) {
  const jobs = useJobsStore((s) => s.jobs);
  const vehicles = useFleet((s) => s.vehicles);

  const rows = useMemo(() => {
    return vehicles.map((v) => {
      const foreman = drivers.find((d) => d.vehicleId === v.id);
      const dayJobs = foreman
        ? jobs.filter(
            (j) =>
              (j.scheduledAt ?? "").slice(0, 10) === selectedDate &&
              (j.driverId === foreman.id || j.driverName === foreman.name) &&
              j.status !== "Cancelled",
          )
        : [];
      const assignedCuFt = dayJobs.reduce((s, j) => s + j.cuFt, 0);
      const cap = vehicleCapacity(v);
      const level = dayJobs.length > 0 ? capacityLevel(assignedCuFt, cap) : null;
      const unavailable = v.status === "Maintenance" || v.status === "Out of Service";
      return { v, foreman, dayJobs, assignedCuFt, cap, level, unavailable };
    });
  }, [vehicles, jobs, selectedDate]);

  const inUse = rows.filter((r) => r.dayJobs.length > 0).length;

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-muted-foreground">
        {inUse} of {vehicles.length} trucks carry jobs on this date · fleet data is demo (local only)
      </p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map(({ v, foreman, dayJobs, assignedCuFt, cap, level, unavailable }) => (
          <Card key={v.id} className={cn(unavailable && dayJobs.length > 0 && "border-rose-500/50")}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link href={`/fleet/${v.id}`} className="truncate text-sm font-semibold hover:underline">
                    {v.name}
                  </Link>
                  <p className="font-mono text-[10px] text-muted-foreground">{v.id} · {v.type}</p>
                </div>
                <VehicleStatusBadge status={v.status} />
              </div>

              <div className="mt-2 space-y-1 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Foreman</span>
                  <span className="font-medium">{foreman?.name ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Jobs this day</span>
                  <span className="font-mono">{dayJobs.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Load vs safe capacity</span>
                  <span className="font-mono">
                    {formatNumber(assignedCuFt)} / {formatNumber(cap.safe)} cuft
                  </span>
                </div>
              </div>

              {/* Load bar */}
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full",
                    level === "over" ? "bg-rose-500" : level === "tight" ? "bg-amber-500" : "bg-emerald-500",
                  )}
                  style={{ width: `${Math.min(100, cap.safe > 0 ? (assignedCuFt / cap.safe) * 100 : 0)}%` }}
                />
              </div>

              <div className="mt-2 flex flex-wrap gap-1">
                {level === "over" && (
                  <Badge variant="danger" className="gap-1 text-[9px]">
                    <AlertTriangle className="h-3 w-3" /> Over capacity
                  </Badge>
                )}
                {level === "tight" && (
                  <Badge variant="warning" className="text-[9px]">Near capacity</Badge>
                )}
                {unavailable && (
                  <Badge variant={dayJobs.length > 0 ? "danger" : "warning"} className="gap-1 text-[9px]">
                    <Wrench className="h-3 w-3" />
                    {dayJobs.length > 0 ? "In shop but assigned!" : "In shop"}
                  </Badge>
                )}
                {dayJobs.length === 0 && !unavailable && (
                  <Badge variant="outline" className="gap-1 text-[9px]">
                    <TruckIcon className="h-3 w-3" /> Idle this day
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
