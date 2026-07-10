import { createId } from "@/lib/id";
import { useJobsStore } from "@/lib/store/jobs";
import { useLeads } from "@/lib/store/leads";
import { useQuotesStore } from "@/lib/store/quotes";
import { useActivityLog } from "@/lib/store/activity-log";
import { useNotifications } from "@/lib/store/notifications";
import type { Job, JobType } from "@/lib/types";

/**
 * Booking flow: create a REAL Job from a lead and/or quote, and link everything.
 *
 * A "Booked" status alone was never enough — Dispatch, Jobs and Job Detail all
 * key off a real Job record. This mints one job (collision-safe id), files it in
 * the shared jobs store, links it back to the lead + quote, advances their
 * statuses, and raises a dispatcher/owner notification + activity log entry.
 *
 * Uses the stores' `getState()` API so it can run from any handler.
 */
export interface CreateJobInput {
  leadId?: string;
  quoteId?: string;
  customerId?: string;
  customerName: string;
  phone?: string;
  email?: string;
  pickup?: string;
  pickupCity?: string;
  delivery?: string;
  deliveryCity?: string;
  /** ISO date (YYYY-MM-DD) or datetime; used for scheduledAt. */
  moveDate?: string;
  jobType?: JobType;
  estimatedCuFt?: number;
  quotedAmount?: number;
  foremanId?: string;
  foremanName?: string;
  zone?: string;
  by: { id: string; name: string; role: string };
}

function toScheduledAt(moveDate?: string): string {
  if (!moveDate) {
    return `${new Date().toISOString().slice(0, 10)}T09:00:00`;
  }
  return moveDate.length === 10 ? `${moveDate}T09:00:00` : moveDate;
}

export function createJobFromLeadOrQuote(input: CreateJobInput): Job {
  const id = createId("job");
  const scheduledAt = toScheduledAt(input.moveDate);
  const assigned = Boolean(input.foremanId);

  const job: Job = {
    id,
    customerId: input.customerId,
    customer: input.customerName,
    customerPhone: input.phone ?? "",
    pickup: input.pickup || input.pickupCity || "",
    delivery: input.delivery || input.deliveryCity || "",
    pickupCity: input.pickupCity ?? "",
    deliveryCity: input.deliveryCity ?? "",
    type: input.jobType ?? "Local Move",
    cuFt: input.estimatedCuFt ?? 0,
    miles: 0,
    status: assigned ? "Assigned" : "Unassigned",
    driverId: input.foremanId,
    driverName: input.foremanName,
    crew: input.foremanName ? [input.foremanName] : [],
    price: input.quotedAmount ?? 0,
    payrollStatus: "Pending",
    scheduledAt,
    zone: input.zone || input.deliveryCity || "Miami-Dade",
    priority: "Medium",
    leadId: input.leadId,
    quoteId: input.quoteId,
  };

  useJobsStore.getState().addJob(job);

  if (input.leadId) {
    // linkJob also advances the lead stage to "Converted to Job".
    useLeads.getState().linkJob(input.leadId, id);
  }
  if (input.quoteId) {
    useQuotesStore.getState().updateQuote(input.quoteId, { status: "Converted to Job" });
  }

  useActivityLog.getState().push({
    actorId: input.by.id,
    actorName: input.by.name,
    actorRole: input.by.role,
    module: "Jobs",
    action: "created",
    objectType: "Job",
    objectId: id,
    title: `Job ${id} booked — ${input.customerName}${input.leadId ? ` (from lead ${input.leadId})` : ""}`,
    metadata: { leadId: input.leadId, quoteId: input.quoteId },
  });

  useNotifications.getState().push({
    kind: "job_unassigned",
    title: assigned ? "New job booked" : "New job needs dispatch",
    body: `${input.customerName} · ${job.type} · ${scheduledAt.slice(0, 10)}${assigned ? ` · ${input.foremanName}` : ""}`,
    severity: "info",
    href: `/jobs/${id}`,
    priority: "high",
  });

  return job;
}
