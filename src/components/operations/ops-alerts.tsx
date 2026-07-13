"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, UserX, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { drivers } from "@/lib/mock-data";
import { useJobsStore } from "@/lib/store/jobs";
import { useFleet } from "@/lib/store/fleet";
import { useForemanAvailability } from "@/lib/store/foreman-availability";
import { vehicleCapacity, capacityLevel } from "@/lib/fleet/capacity";
import { cn } from "@/lib/utils";

type Severity = "danger" | "warning";

interface OpsAlert {
  id: string;
  severity: Severity;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
  href: string;
}

/**
 * Alerts tab — operational risks for the selected date, derived ONLY from
 * existing store data (jobs, roster, availability overrides, fleet). No AI,
 * no backend, no invented signals.
 */
export function OpsAlerts({ selectedDate }: { selectedDate: string }) {
  const jobs = useJobsStore((s) => s.jobs);
  const vehicles = useFleet((s) => s.vehicles);
  const overrides = useForemanAvailability((s) => s.overrides);

  const alerts = useMemo(() => {
    const out: OpsAlert[] = [];
    const dayJobs = jobs.filter(
      (j) => (j.scheduledAt ?? "").slice(0, 10) === selectedDate && j.status !== "Cancelled",
    );

    // 1) Unassigned jobs (no foreman → also no truck).
    dayJobs
      .filter((j) => !j.driverId || j.status === "Unassigned")
      .forEach((j) =>
        out.push({
          id: `unassigned-${j.id}`,
          severity: "danger",
          icon: AlertTriangle,
          title: `Job ${j.id} has no foreman`,
          detail: `${j.customer} · ${j.type} · ${j.scheduledAt.slice(11, 16)} — needs dispatch (no foreman means no truck either).`,
          href: `/jobs/${j.id}`,
        }),
      );

    // 2) Possible schedule conflicts: same foreman, overlapping time windows
    //    (start + estimated hours, defaulting to 4h when unknown).
    const byForeman = new Map<string, typeof dayJobs>();
    dayJobs
      .filter((j) => j.driverId)
      .forEach((j) => {
        const arr = byForeman.get(j.driverId as string) ?? [];
        arr.push(j);
        byForeman.set(j.driverId as string, arr);
      });
    byForeman.forEach((list, foremanId) => {
      const sorted = [...list].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        const startA = Number(a.scheduledAt.slice(11, 13)) + Number(a.scheduledAt.slice(14, 16)) / 60;
        const startB = Number(b.scheduledAt.slice(11, 13)) + Number(b.scheduledAt.slice(14, 16)) / 60;
        const endA = startA + (a.hours ?? 4);
        if (startB < endA) {
          const name = drivers.find((d) => d.id === foremanId)?.name ?? foremanId;
          out.push({
            id: `conflict-${a.id}-${b.id}`,
            severity: "warning",
            icon: Clock,
            title: `Possible time conflict for ${name}`,
            detail: `${a.id} (${a.scheduledAt.slice(11, 16)}, ~${a.hours ?? 4}h est.) overlaps ${b.id} (${b.scheduledAt.slice(11, 16)}).`,
            href: `/jobs/${b.id}`,
          });
        }
      }
    });

    // 3) Unavailable foreman with assigned work.
    byForeman.forEach((list, foremanId) => {
      const d = drivers.find((x) => x.id === foremanId);
      if (!d) return;
      const override = overrides[foremanId];
      const off = override === "offline" || (!override && d.status === "Offline");
      if (off && list.length > 0) {
        out.push({
          id: `offduty-${foremanId}`,
          severity: "danger",
          icon: UserX,
          title: `${d.name} is off duty but has ${list.length} job(s)`,
          detail: `Jobs: ${list.map((j) => j.id).join(", ")} — reassign or confirm availability.`,
          href: `/jobs/${list[0].id}`,
        });
      }
    });

    // 4) Truck issues: in-shop truck whose foreman carries jobs; over-capacity load.
    byForeman.forEach((list, foremanId) => {
      const d = drivers.find((x) => x.id === foremanId);
      const truck = d ? vehicles.find((v) => v.id === d.vehicleId) : undefined;
      if (!d || !truck) return;
      const inShop = truck.status === "Maintenance" || truck.status === "Out of Service";
      if (inShop) {
        out.push({
          id: `truckshop-${truck.id}`,
          severity: "danger",
          icon: Wrench,
          title: `${truck.name} is in shop but ${d.name} has ${list.length} job(s)`,
          detail: `Truck status: ${truck.status}. Assign a different truck or reschedule.`,
          href: `/fleet/${truck.id}`,
        });
      }
      const load = list.reduce((s, j) => s + j.cuFt, 0);
      if (capacityLevel(load, vehicleCapacity(truck)) === "over") {
        out.push({
          id: `overcap-${truck.id}`,
          severity: "danger",
          icon: AlertTriangle,
          title: `${truck.name} over capacity for ${d.name}'s day`,
          detail: `${load} cuft assigned vs ${vehicleCapacity(truck).max} max — split the load or add a truck.`,
          href: `/fleet/${truck.id}`,
        });
      }
    });

    return out.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "danger" ? -1 : 1));
  }, [jobs, vehicles, overrides, selectedDate]);

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-muted-foreground">
        Derived from live store data for the selected date — no AI, no invented alerts.
      </p>
      {alerts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            <p className="text-sm font-semibold">No operational alerts for this date</p>
            <p className="text-xs text-muted-foreground">
              All jobs assigned, no time conflicts, no truck issues detected.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {alerts.map((a) => {
            const Icon = a.icon;
            return (
              <li key={a.id}>
                <Link
                  href={a.href}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3 transition-colors hover:bg-accent/30",
                    a.severity === "danger" ? "border-rose-500/40 bg-rose-500/[0.03]" : "border-amber-500/40 bg-amber-500/[0.03]",
                  )}
                >
                  <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", a.severity === "danger" ? "text-rose-500" : "text-amber-500")} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{a.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{a.detail}</p>
                  </div>
                  <Badge variant={a.severity === "danger" ? "danger" : "warning"} className="shrink-0 text-[9px] uppercase">
                    {a.severity === "danger" ? "Action" : "Review"}
                  </Badge>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
