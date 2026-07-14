import { jobs as MOCK_JOBS, drivers } from "@/lib/mock-data";
import { SCHEDULE_JOBS } from "@/lib/seeds/schedule";
import type { Job } from "@/lib/types";

/**
 * The full operating schedule: the hand-written mock jobs (rich detail) plus
 * the generated Apr→Sep schedule.
 *
 * Sprint 2.2 — the whole timeline is RE-ANCHORED to the real current date so
 * Operations can be practiced realistically: the seeds were written around
 * 2026-07-02 ("seed today"); every job's date is shifted by (real today −
 * seed today), which preserves the original past/future mix while guaranteeing
 * jobs today, tomorrow, and across the next weeks. Assignment/confirmation
 * states and default trucks are hydrated deterministically (hash of job id) so
 * the Assignments board always has Draft / Notified / Confirmed / Declined and
 * missing-truck cases to work with. All names are fictional demo data.
 */

const SEED_TODAY = "2026-07-02";

function dayNumber(iso: string): number {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86400000;
}

const realTodayIso = new Date().toISOString().slice(0, 10);
const OFFSET_DAYS = dayNumber(realTodayIso) - dayNumber(SEED_TODAY);

function shiftDate(scheduledAt: string, days: number): string {
  const [y, m, d] = scheduledAt.slice(0, 10).split("-").map(Number);
  const shifted = new Date(Date.UTC(y, m - 1, d + days));
  const pad = (n: number) => String(n).padStart(2, "0");
  const datePart = `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`;
  return `${datePart}${scheduledAt.slice(10)}`;
}

/** Small deterministic hash so demo states are stable across reloads. */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

const LIVE_STATUSES = new Set(["En Route", "Pickup Started", "Pickup Completed", "Delivery Started"]);

function hydrate(job: Job): Job {
  const scheduledAt = shiftDate(job.scheduledAt, OFFSET_DAYS);
  const day = scheduledAt.slice(0, 10);
  const isFuture = day > realTodayIso;
  const isToday = day === realTodayIso;
  const h = hash(job.id);

  // Status coherence after the shift: nothing in the future can be Completed
  // or mid-flight; live statuses only make sense today.
  let status = job.status;
  if (isFuture && (status === "Completed" || LIVE_STATUSES.has(status))) status = "Assigned";

  const out: Job = { ...job, scheduledAt, status };

  // Assignment workflow states — only for assigned jobs from today forward.
  if ((isFuture || isToday) && out.driverId && status !== "Unassigned" && status !== "Cancelled" && status !== "Completed") {
    const roll = h % 20;
    out.assignment =
      roll === 19
        ? { status: "Declined", declinedAt: `${realTodayIso}T08:00:00`, declineReason: "Schedule conflict — needs reassignment", by: out.driverName }
        : roll >= 14
          ? { status: "Draft" }
          : roll >= 8
            ? { status: "Notified", notifiedAt: `${realTodayIso}T07:30:00` }
            : { status: "Confirmed", notifiedAt: `${realTodayIso}T07:30:00`, confirmedAt: `${realTodayIso}T07:45:00`, by: out.driverName };

    // Default truck = the foreman's paired vehicle; a few are left truckless
    // on purpose so the "job has no truck" alert has something real to show.
    if (h % 17 !== 3) {
      out.truckId = drivers.find((d) => d.id === out.driverId)?.vehicleId;
    }
  }

  return out;
}

export const allJobs: Job[] = [...MOCK_JOBS, ...SCHEDULE_JOBS].map(hydrate);
