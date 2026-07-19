"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BellOff,
  CalendarClock,
  CheckCircle2,
  Clock,
  ImageOff,
  Truck as TruckIcon,
  UserX,
  Wrench,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { drivers } from "@/lib/mock-data";
import { useJobsStore } from "@/lib/store/jobs";
import { useFleet } from "@/lib/store/fleet";
import { useForemanAvailability } from "@/lib/store/foreman-availability";
import { useUsers } from "@/lib/store/users";
import { vehicleCapacity, capacityLevel } from "@/lib/fleet/capacity";
import { cn } from "@/lib/utils";

type Severity = "danger" | "warning";

interface OpsAlert {
  id: string;
  severity: Severity;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
  /** Every alert is clickable and lands on the surface that fixes it. */
  href: string;
}

/** Deep link into the Assignments tab, focusing a lane or the unassigned panel. */
function fixHref(focus: string): string {
  return `/operations?tab=assignments&focus=${encodeURIComponent(focus)}`;
}

/**
 * Alerts tab (Sprint 2.2) — operational risks for the selected date, derived
 * ONLY from existing store data (jobs, roster, availability, fleet, users).
 * No AI, no invented signals. Every alert links to the fixing surface —
 * almost always the Assignments board.
 */
export function OpsAlerts({ selectedDate }: { selectedDate: string }) {
  const jobs = useJobsStore((s) => s.jobs);
  const vehicles = useFleet((s) => s.vehicles);
  const overrides = useForemanAvailability((s) => s.overrides);
  const users = useUsers((s) => s.users);

  const alerts = useMemo(() => {
    const out: OpsAlert[] = [];
    const dayJobs = jobs.filter(
      (j) => (j.scheduledAt ?? "").slice(0, 10) === selectedDate && j.status !== "Cancelled",
    );

    // 1) Unassigned jobs (no foreman → also no truck).
    const unassigned = dayJobs.filter((j) => !j.driverId || j.status === "Unassigned");
    unassigned.forEach((j) =>
      out.push({
        id: `unassigned-${j.id}`,
        severity: "danger",
        icon: AlertTriangle,
        title: `Job ${j.id} has no foreman`,
        detail: `${j.type} · ${j.scheduledAt.slice(11, 16)} · ${j.customer} — assign a foreman (no foreman means no truck either).`,
        href: fixHref("unassigned"),
      }),
    );

    // Per-foreman lanes for the day.
    const byForeman = new Map<string, typeof dayJobs>();
    dayJobs
      .filter((j) => j.driverId && j.status !== "Unassigned")
      .forEach((j) => {
        const arr = byForeman.get(j.driverId as string) ?? [];
        arr.push(j);
        byForeman.set(j.driverId as string, arr);
      });

    byForeman.forEach((list, foremanId) => {
      const d = drivers.find((x) => x.id === foremanId);
      const name = d?.name ?? foremanId;
      const sorted = [...list].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

      // 2) Possible schedule conflicts: overlapping time windows
      //    (start + estimated hours, defaulting to 4h when unknown).
      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        const startA = Number(a.scheduledAt.slice(11, 13)) + Number(a.scheduledAt.slice(14, 16)) / 60;
        const startB = Number(b.scheduledAt.slice(11, 13)) + Number(b.scheduledAt.slice(14, 16)) / 60;
        if (startB < startA + (a.hours ?? 4)) {
          out.push({
            id: `conflict-${a.id}-${b.id}`,
            severity: "warning",
            icon: Clock,
            title: `Possible time conflict for ${name}`,
            detail: `${a.id} (${a.scheduledAt.slice(11, 16)}, ~${a.hours ?? 4}h est.) overlaps ${b.id} (${b.scheduledAt.slice(11, 16)}) — move one job or reassign.`,
            href: fixHref(foremanId),
          });
        }
      }

      // 3) Off-duty foreman with assigned work.
      const override = overrides[foremanId];
      const off = override === "offline" || (!override && d?.status === "Offline");
      if (off) {
        out.push({
          id: `offduty-${foremanId}`,
          severity: "danger",
          icon: UserX,
          title: `${name} is off duty but has ${list.length} job(s)`,
          detail: `Jobs: ${list.map((j) => j.id).join(", ")} — reassign or confirm availability.`,
          href: fixHref(foremanId),
        });
      }

      // 4) Truck for the day: missing, in shop, or over capacity.
      const truckId = sorted.find((j) => j.truckId)?.truckId;
      const truck = truckId ? vehicles.find((v) => v.id === truckId) : undefined;
      if (!truck) {
        out.push({
          id: `notruck-${foremanId}`,
          severity: "danger",
          icon: TruckIcon,
          title: `${name} has no truck for this day`,
          detail: `${list.length} job(s) assigned but no truck selected — pick one on the Assignments board.`,
          href: fixHref(foremanId),
        });
      } else {
        if (truck.status === "Maintenance" || truck.status === "Out of Service") {
          out.push({
            id: `truckshop-${truck.id}`,
            severity: "danger",
            icon: Wrench,
            title: `${truck.name} is in shop but ${name} has ${list.length} job(s)`,
            detail: `Truck status: ${truck.status}. Assign a different truck or reschedule.`,
            href: fixHref(foremanId),
          });
        }
        const load = list.reduce((s, j) => s + j.cuFt, 0);
        if (capacityLevel(load, vehicleCapacity(truck)) === "over") {
          out.push({
            id: `overcap-${truck.id}`,
            severity: "danger",
            icon: AlertTriangle,
            title: `${truck.name} over capacity for ${name}'s day`,
            detail: `${load} cuft assigned vs ${vehicleCapacity(truck).max} max — split the load or add a truck.`,
            href: fixHref(foremanId),
          });
        }
      }

      // 5) Confirmation state: declined is urgent; draft/sent needs follow-up;
      //    changes made after sending must be re-sent to the foreman.
      const open = sorted.filter((j) => j.status !== "Completed");
      const declined = open.filter((j) => j.assignment?.status === "Declined");
      const needsUpdate = open.filter((j) => j.assignment?.status === "Needs Attention");
      const unconfirmed = open.filter(
        (j) => !j.assignment || j.assignment.status === "Draft" || j.assignment.status === "Notified",
      );
      if (declined.length > 0) {
        const a = declined[0].assignment;
        out.push({
          id: `declined-${foremanId}`,
          severity: "danger",
          icon: BellOff,
          title: `${name} declined ${declined.length} assignment(s)${a?.declinedAt ? ` at ${a.declinedAt.slice(11, 16)}` : ""}`,
          detail: `${declined.map((j) => j.id).join(", ")}${a?.declineReason ? ` — reason: ${a.declineReason}` : ""}. Next: move the job to another foreman, change the truck, or call to resolve.`,
          href: fixHref(foremanId),
        });
      }
      if (needsUpdate.length > 0) {
        out.push({
          id: `needsupdate-${foremanId}`,
          severity: "warning",
          icon: BellOff,
          title: `Update not sent — ${name} hasn't seen ${needsUpdate.length} change(s)`,
          detail: `${needsUpdate.map((j) => j.id).join(", ")} changed after sending. Next: send the update from the Assignments board.`,
          href: fixHref(foremanId),
        });
      }
      if (declined.length === 0 && unconfirmed.length > 0) {
        const notSent = unconfirmed.filter(
          (j) => !j.assignment || j.assignment.status === "Draft",
        ).length;
        out.push({
          id: `unconfirmed-${foremanId}`,
          severity: "warning",
          icon: BellOff,
          title: `${name} has not accepted ${unconfirmed.length} job(s)`,
          detail:
            notSent > 0
              ? `${notSent} still in draft — not sent to the foreman yet. Next: send the day plan.`
              : `Sent to app but no acceptance yet — follow up before start time.`,
          href: fixHref(foremanId),
        });
      }

      // 6) Identity: assigned foreman without a profile photo.
      const linked = users.find((u) => u.foremanId === foremanId);
      if (!linked?.photoUrl) {
        out.push({
          id: `nophoto-${foremanId}`,
          severity: "warning",
          icon: ImageOff,
          title: `${name} has no profile photo`,
          detail: `Assigned crews should be visually identifiable — add a photo in Settings → Users & access.`,
          href: `/settings`,
        });
      }
    });

    // 7) Tomorrow still unassigned (relative to the selected date).
    const base = new Date(`${selectedDate}T00:00:00`);
    if (!Number.isNaN(base.getTime())) {
      base.setDate(base.getDate() + 1);
      const nextIso = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(base.getDate()).padStart(2, "0")}`;
      const tomorrowOpen = jobs.filter(
        (j) =>
          (j.scheduledAt ?? "").slice(0, 10) === nextIso &&
          j.status !== "Cancelled" &&
          (!j.driverId || j.status === "Unassigned"),
      );
      if (tomorrowOpen.length > 0) {
        out.push({
          id: `tomorrow-unassigned`,
          severity: "warning",
          icon: CalendarClock,
          title: `${tomorrowOpen.length} job(s) tomorrow (${nextIso}) still unassigned`,
          detail: `Switch the date to ${nextIso} on the Assignments board and dispatch them early.`,
          href: fixHref("unassigned"),
        });
      }
    }

    // NOTE: an "unvalidated address" alert is intentionally absent — the Job
    // model has no address-validation field yet, and we don't invent signals.

    return out.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "danger" ? -1 : 1));
  }, [jobs, vehicles, overrides, users, selectedDate]);

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-muted-foreground">
        Derived from live store data for the selected date — no AI, no invented alerts.
        Click an alert to jump to the surface that fixes it.
      </p>
      {alerts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            <p className="text-sm font-semibold">No operational alerts for this date</p>
            <p className="text-xs text-muted-foreground">
              All jobs assigned and confirmed, trucks set, no time conflicts detected.
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
                    {a.severity === "danger" ? "Fix now" : "Review"}
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
