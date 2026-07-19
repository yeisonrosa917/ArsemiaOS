import type {
  AssignmentStatus,
  Driver,
  Job,
  JobAssignment,
  Vehicle,
} from "@/lib/types";
import type { Availability } from "@/lib/store/foreman-availability";
import type { WorkspaceUser } from "@/lib/store/users";
import {
  vehicleCapacity,
  capacityLevel,
  type CapacityLevel,
  type VehicleCapacity,
} from "@/lib/fleet/capacity";

/**
 * Shared day-status selectors (Sprint 2.2 QA patch).
 *
 * SINGLE SOURCE OF TRUTH: who works on a given date is derived from the jobs
 * store (assignments) — never from the static roster's `status` field, which
 * is demo scenery. Operations, Assignments, Foremen/Contractors, the Board
 * crew panel and Alerts must all build their view of the day through these
 * helpers so they can never disagree.
 *
 * Three separate axes, deliberately not mixed into one status:
 *  - Availability   — can this person work at all today? (roster + overrides)
 *  - Assignment     — where is their day plan in the dispatch lifecycle?
 *  - Live work      — what are they physically doing right now (per jobs)?
 */

/* ── Live work status (from job statuses on the selected date) ── */

export type LiveWorkStatus = "no_job" | "scheduled" | "en_route" | "on_job" | "completed";

export const LIVE_WORK_LABEL: Record<LiveWorkStatus, string> = {
  no_job: "No job today",
  scheduled: "Scheduled — not started",
  en_route: "En route",
  on_job: "On job",
  completed: "Done for the day",
};

const ON_JOB_STATUSES = new Set(["Pickup Started", "Pickup Completed", "Delivery Started"]);

export function liveWorkFromJobs(dayJobs: Job[]): LiveWorkStatus {
  if (dayJobs.length === 0) return "no_job";
  if (dayJobs.some((j) => ON_JOB_STATUSES.has(j.status))) return "on_job";
  if (dayJobs.some((j) => j.status === "En Route")) return "en_route";
  if (dayJobs.every((j) => j.status === "Completed")) return "completed";
  return "scheduled";
}

/* ── Human assignment lifecycle labels ── */

export interface AssignmentHumanStatus {
  status: AssignmentStatus;
  /** Short chip text, e.g. "Sent to app". */
  label: string;
  /** One human sentence: what this means right now. */
  detail: string;
  /** What the dispatcher should do next (empty when nothing is needed). */
  next: string;
  tone: "slate" | "sky" | "emerald" | "rose" | "amber";
}

export function getAssignmentHumanStatus(
  assignment: JobAssignment | undefined,
  foremanName = "the foreman",
): AssignmentHumanStatus {
  const a = assignment ?? { status: "Draft" as AssignmentStatus };
  switch (a.status) {
    case "Draft":
      return {
        status: "Draft",
        label: "Draft",
        detail: `Not sent to ${foremanName} yet — dispatch is still planning.`,
        next: "Send the day plan when it's ready.",
        tone: "slate",
      };
    case "Notified":
      return {
        status: "Notified",
        label: "Sent to app",
        detail: `Sent to ${foremanName}${a.notifiedAt ? ` at ${timeOf(a.notifiedAt)}` : ""} — waiting for ${foremanName} to accept.`,
        next: "Follow up if there's no response before start time.",
        tone: "sky",
      };
    case "Confirmed":
      // Dispatch override is NOT foreman acceptance — keep them visually
      // and verbally distinct everywhere.
      return a.source === "dispatcher"
        ? {
            status: "Confirmed",
            label: "Dispatch override",
            detail: `Marked confirmed by dispatch${a.by ? ` (${a.by})` : ""} after outside/phone confirmation — ${foremanName} did not accept in the app.`,
            next: "",
            tone: "amber",
          }
        : {
            status: "Confirmed",
            label: "Accepted by foreman",
            detail: `${foremanName} accepted${a.confirmedAt ? ` at ${timeOf(a.confirmedAt)}` : ""} from the Foreman Portal.`,
            next: "",
            tone: "emerald",
          };
    case "Declined":
      return {
        status: "Declined",
        label: "Declined by foreman",
        detail: `${foremanName} declined${a.declinedAt ? ` at ${timeOf(a.declinedAt)}` : ""}${a.declineReason ? ` — reason: ${a.declineReason}` : ""}.`,
        next: "Reassign the job, change the truck, or call to resolve.",
        tone: "rose",
      };
    case "Needs Attention":
      return {
        status: "Needs Attention",
        label: "Update not sent",
        detail: a.changeNote ?? `Changed after sending — ${foremanName} has not seen this change.`,
        next: `Send the update to ${foremanName}.`,
        tone: "amber",
      };
  }
}

function timeOf(iso: string): string {
  const hh = iso.slice(11, 13);
  const mm = iso.slice(14, 16);
  if (!hh) return "";
  const h = Number(hh);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mm} ${ampm}`;
}

/* ── Per-foreman day status ── */

export interface ForemanDayStatus {
  foremanId: string;
  name: string;
  driver: Driver;
  photoUrl?: string;
  hasPhoto: boolean;
  /** Availability for the day (override > roster fallback). */
  availability: Availability;
  /** True when the person has at least one open job on the date. */
  workingToday: boolean;
  /** Aggregate lifecycle across the day's jobs; null = no jobs. */
  assignment: AssignmentStatus | null;
  assignmentHuman: AssignmentHumanStatus | null;
  liveWork: LiveWorkStatus;
  jobs: Job[];
  /** Truck actually assigned for the date (from the jobs). */
  truckId?: string;
  truck?: Vehicle;
  truckInShop: boolean;
  /** The foreman's usual truck — suggested by default when assigning. */
  defaultTruckId?: string;
  load: number;
  cap?: VehicleCapacity;
  level: CapacityLevel | null;
  conflictIds: Set<string>;
  declineReason?: string;
  declinedAt?: string;
  needsUpdateCount: number;
  needsAttentionReasons: string[];
}

export function buildForemanDayStatuses({
  date,
  jobs,
  drivers,
  vehicles,
  users,
  overrides,
}: {
  date: string;
  jobs: Job[];
  drivers: Driver[];
  vehicles: Vehicle[];
  users: WorkspaceUser[];
  overrides: Record<string, Availability>;
}): ForemanDayStatus[] {
  const userByForeman = new Map<string, WorkspaceUser>();
  users.forEach((u) => {
    if (u.foremanId) userByForeman.set(u.foremanId, u);
  });

  const dayJobs = jobs.filter(
    (j) => (j.scheduledAt ?? "").slice(0, 10) === date && j.status !== "Cancelled",
  );

  return drivers.map((d) => {
    const laneJobs = dayJobs
      .filter((j) => j.driverId === d.id && j.status !== "Unassigned")
      .sort((a, b) => (a.scheduledAt ?? "").localeCompare(b.scheduledAt ?? ""));

    const truckId = laneJobs.find((j) => j.truckId)?.truckId;
    const truck = truckId ? vehicles.find((v) => v.id === truckId) : undefined;
    const truckInShop = Boolean(
      truck && (truck.status === "Maintenance" || truck.status === "Out of Service"),
    );
    const load = laneJobs.reduce((s, j) => s + j.cuFt, 0);
    const cap = truck ? vehicleCapacity(truck) : undefined;
    const level = truck && laneJobs.length > 0 ? capacityLevel(load, cap!) : null;

    // Overlapping time windows (start + estimated hours, 4h when unknown).
    const conflictIds = new Set<string>();
    for (let i = 0; i < laneJobs.length - 1; i++) {
      const a = laneJobs[i];
      const b = laneJobs[i + 1];
      const startA = Number(a.scheduledAt.slice(11, 13)) + Number(a.scheduledAt.slice(14, 16)) / 60;
      const startB = Number(b.scheduledAt.slice(11, 13)) + Number(b.scheduledAt.slice(14, 16)) / 60;
      if (startB < startA + (a.hours ?? 4)) {
        conflictIds.add(a.id);
        conflictIds.add(b.id);
      }
    }

    const open = laneJobs.filter((j) => j.status !== "Completed");
    const statuses = open.map((j) => j.assignment?.status ?? "Draft");
    const assignment: AssignmentStatus | null =
      laneJobs.length === 0
        ? null
        : statuses.length === 0 // every job already completed
          ? "Confirmed"
          : statuses.includes("Declined")
            ? "Declined"
            : statuses.includes("Needs Attention")
              ? "Needs Attention"
              : statuses.every((s) => s === "Confirmed")
                ? "Confirmed"
                : statuses.every((s) => s === "Notified" || s === "Confirmed")
                  ? "Notified"
                  : "Draft";

    const declinedJob = laneJobs.find((j) => j.assignment?.status === "Declined");
    const availability: Availability =
      overrides[d.id] ??
      (d.status === "Offline" ? "offline" : d.status === "Break" ? "break" : "available");
    const linkedUser = userByForeman.get(d.id);
    const needsUpdateCount = open.filter(
      (j) => j.assignment?.status === "Needs Attention",
    ).length;

    const reasons: string[] = [];
    if (laneJobs.length > 0) {
      if (!truck) reasons.push("No truck picked for the day");
      else if (truckInShop) reasons.push(`${truck.name.split(" - ")[0]} is in shop`);
      if (level === "over") reasons.push("Load is over the truck's capacity");
      if (availability === "offline") reasons.push("Off duty / offline but has jobs");
      if (conflictIds.size > 0) reasons.push("Jobs overlap in time");
      if (declinedJob)
        reasons.push(
          `Declined ${declinedJob.id}${declinedJob.assignment?.declineReason ? ` — ${declinedJob.assignment.declineReason}` : ""}`,
        );
      if (needsUpdateCount > 0) reasons.push(`${needsUpdateCount} change(s) not sent yet`);
    }

    return {
      foremanId: d.id,
      name: d.name,
      driver: d,
      photoUrl: linkedUser?.photoUrl,
      hasPhoto: Boolean(linkedUser?.photoUrl),
      availability,
      workingToday: laneJobs.length > 0,
      assignment,
      assignmentHuman: assignment
        ? getAssignmentHumanStatus(
            // Represent the aggregate through the most urgent job's assignment.
            (declinedJob ?? open.find((j) => (j.assignment?.status ?? "Draft") === assignment) ?? laneJobs[0])
              ?.assignment ?? { status: assignment },
            d.name,
          )
        : null,
      liveWork: liveWorkFromJobs(laneJobs),
      jobs: laneJobs,
      truckId,
      truck,
      truckInShop,
      defaultTruckId: d.vehicleId,
      load,
      cap,
      level,
      conflictIds,
      declineReason: declinedJob?.assignment?.declineReason,
      declinedAt: declinedJob?.assignment?.declinedAt,
      needsUpdateCount,
      needsAttentionReasons: reasons,
    };
  });
}

/** Human one-liner for the "what is this person doing today" question. */
export function foremanDayLabel(s: ForemanDayStatus): string {
  if (!s.workingToday) {
    if (s.availability === "offline") return "Offline — no job today";
    if (s.availability === "break") return "Off duty — no job today";
    return "Available — no job today";
  }
  return LIVE_WORK_LABEL[s.liveWork];
}

/* ── Day plan summary (header counts) ── */

export interface AssignmentDaySummary {
  date: string;
  totalJobs: number;
  unassigned: number;
  draft: number;
  sent: number;
  confirmed: number;
  declined: number;
  needsUpdate: number;
  /** Open (not completed) assigned jobs — the denominator for confirmations. */
  openAssigned: number;
}

export function buildAssignmentDaySummary({
  date,
  jobs,
}: {
  date: string;
  jobs: Job[];
}): AssignmentDaySummary {
  const dayJobs = jobs.filter(
    (j) => (j.scheduledAt ?? "").slice(0, 10) === date && j.status !== "Cancelled",
  );
  const unassigned = dayJobs.filter((j) => !j.driverId || j.status === "Unassigned");
  const open = dayJobs.filter(
    (j) => j.driverId && j.status !== "Unassigned" && j.status !== "Completed",
  );
  const by = (s: AssignmentStatus) =>
    open.filter((j) => (j.assignment?.status ?? "Draft") === s).length;
  return {
    date,
    totalJobs: dayJobs.length,
    unassigned: unassigned.length,
    draft: by("Draft"),
    sent: by("Notified"),
    confirmed: by("Confirmed"),
    declined: by("Declined"),
    needsUpdate: by("Needs Attention"),
    openAssigned: open.length,
  };
}

/* ── Truck intelligence for the picker ── */

export type TruckOptionKind =
  | "current"   // already this foreman's truck for the day
  | "suggested" // the foreman's default truck, free and usable
  | "good"      // available with enough capacity
  | "warning"   // usable but capacity is tight/over
  | "conflict"  // already assigned to another foreman this date
  | "blocked";  // in shop / out of service

export interface TruckOption {
  vehicle: Vehicle;
  kind: TruckOptionKind;
  /** Human hint, e.g. "Vuk's default truck" or "Already assigned to Marcus". */
  hint: string;
  fit: CapacityLevel | null;
  assignedTo?: string[];
}

const KIND_ORDER: Record<TruckOptionKind, number> = {
  current: 0,
  suggested: 1,
  good: 2,
  warning: 3,
  conflict: 4,
  blocked: 5,
};

export function getAvailableTrucksForDate({
  date,
  jobs,
  vehicles,
  drivers,
  foremanId,
  loadCuFt = 0,
}: {
  date: string;
  jobs: Job[];
  vehicles: Vehicle[];
  drivers: Driver[];
  /** The foreman we're picking for (drives default-truck suggestion). */
  foremanId?: string;
  /** The day load the truck must carry (for capacity fit). */
  loadCuFt?: number;
}): TruckOption[] {
  const dayJobs = jobs.filter(
    (j) =>
      (j.scheduledAt ?? "").slice(0, 10) === date &&
      j.status !== "Cancelled" &&
      j.driverId &&
      j.truckId,
  );
  const usedBy = new Map<string, Set<string>>();
  dayJobs.forEach((j) => {
    const set = usedBy.get(j.truckId as string) ?? new Set<string>();
    set.add(j.driverName ?? (j.driverId as string));
    usedBy.set(j.truckId as string, set);
  });
  const me = foremanId ? drivers.find((d) => d.id === foremanId) : undefined;
  const myName = me?.name;
  const defaultTruckId = me?.vehicleId;

  return vehicles
    .map<TruckOption>((v) => {
      const cap = vehicleCapacity(v);
      const fit = loadCuFt > 0 ? capacityLevel(loadCuFt, cap) : null;
      const shortName = v.name.split(" - ")[0];
      const holders = [...(usedBy.get(v.id) ?? [])].filter((n) => n !== myName);
      const inShop = v.status === "Maintenance" || v.status === "Out of Service";
      const isMine = (usedBy.get(v.id)?.has(myName ?? "") ?? false) && holders.length === 0;

      if (inShop) {
        return { vehicle: v, kind: "blocked", hint: `In shop — ${v.status.toLowerCase()}`, fit, assignedTo: holders };
      }
      if (holders.length > 0) {
        return { vehicle: v, kind: "conflict", hint: `Already assigned to ${holders.join(", ")} today`, fit, assignedTo: holders };
      }
      if (isMine) {
        return { vehicle: v, kind: "current", hint: "Current truck for this day", fit };
      }
      if (fit === "over") {
        return { vehicle: v, kind: "warning", hint: `Too small — ${loadCuFt} cuft vs ${cap.max} max`, fit };
      }
      if (v.id === defaultTruckId) {
        return { vehicle: v, kind: "suggested", hint: `${me?.name.split(" ")[0] ?? "This foreman"}'s default truck`, fit };
      }
      if (fit === "tight") {
        return { vehicle: v, kind: "warning", hint: `Near capacity — ${loadCuFt} of ${cap.safe} cuft safe`, fit };
      }
      return { vehicle: v, kind: "good", hint: `Available — ${shortName} fits the load`, fit };
    })
    .sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || a.vehicle.name.localeCompare(b.vehicle.name));
}
