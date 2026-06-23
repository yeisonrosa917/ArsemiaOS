import type { ActivityEntry } from "@/lib/types";

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  dispatcher: "Dispatcher",
  seller: "Seller",
  foreman: "Foreman",
  marketing: "Marketing",
  accountant: "Accounting",
  claims: "Claims",
};

function fmtMoney(v: unknown): string {
  if (typeof v !== "number") return String(v);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

/**
 * Produces a human-readable summary line for an activity entry.
 *
 * Examples:
 *  - "Active role changed from Seller to Foreman."
 *  - "Adjustment added 40 CuFt and $305 to JOB-10421."
 *  - "Job JOB-10421 reassigned from Marcus Reyes to Sofia Hernandez."
 *  - "Account deletion completed. Personal profile data anonymized."
 */
export function humanizeActivity(entry: ActivityEntry): string {
  const { module, action, objectId, beforeValue, afterValue, title } = entry;

  // Role switch
  if (action === "role_switched") {
    const from = (beforeValue as { roleId?: string } | undefined)?.roleId;
    const to = (afterValue as { roleId?: string } | undefined)?.roleId;
    if (from && to) {
      return `Active role changed from ${ROLE_LABELS[from] ?? from} to ${ROLE_LABELS[to] ?? to}.`;
    }
  }

  // Adjustment status flow
  if (module === "Adjustments" && action === "status_changed") {
    const from = (beforeValue as { status?: string } | undefined)?.status;
    const to = (afterValue as { status?: string } | undefined)?.status;
    if (from && to) {
      return `Adjustment ${objectId}: ${from} → ${to}.`;
    }
  }

  // Job updated by adjustment
  if (module === "Jobs" && action === "updated" && beforeValue && afterValue) {
    const b = beforeValue as { cuFt?: number; price?: number };
    const a = afterValue as { cuFt?: number; price?: number };
    if (b.cuFt != null && a.cuFt != null && b.price != null && a.price != null) {
      const dCuFt = a.cuFt - b.cuFt;
      const dPrice = a.price - b.price;
      return `Job ${objectId} updated: +${dCuFt} CuFt and ${fmtMoney(dPrice)} added.`;
    }
  }

  // Job created
  if (module === "Jobs" && action === "created" && afterValue) {
    const a = afterValue as { customer?: string; price?: number; cuFt?: number };
    return `Job ${objectId} created for ${a.customer ?? "customer"} at ${fmtMoney(a.price ?? 0)} (${a.cuFt} CuFt).`;
  }

  // Job reassigned
  if (action === "reassigned" && beforeValue && afterValue) {
    const b = beforeValue as { foreman?: string };
    const a = afterValue as { foreman?: string };
    if (b.foreman && a.foreman) {
      return `Job ${objectId} reassigned from ${b.foreman} to ${a.foreman}.`;
    }
    if (a.foreman) {
      return `Job ${objectId} assigned to ${a.foreman}.`;
    }
  }

  // Job assigned
  if (action === "assigned" && afterValue) {
    const a = afterValue as { foreman?: string };
    if (a.foreman) return `Job ${objectId} assigned to ${a.foreman}.`;
  }

  // Quote created / submitted
  if (module === "Quotes" && (action === "created" || action === "submitted")) {
    const a = afterValue as
      | { customer?: string; customerTotal?: number; jobType?: string }
      | undefined;
    if (a?.customer && a.customerTotal != null) {
      const verb = action === "submitted" ? "sent" : "drafted";
      return `Quote ${objectId} ${verb} for ${a.customer} — ${fmtMoney(a.customerTotal)} (${a.jobType}).`;
    }
  }

  // Adjustment rejected
  if (action === "rejected" && module === "Adjustments") {
    return `Adjustment ${objectId} rejected${entry.notes ? `: ${entry.notes}` : "."}`;
  }

  // Account deletion
  if (action === "account_deletion_requested") {
    return `Account deletion requested. Personal data will be anonymized when finalized.`;
  }
  if (action === "account_deletion_completed") {
    return `Account deletion completed. Personal profile data anonymized; business records preserved.`;
  }

  // Settings changed
  if (action === "settings_changed") {
    return `${title}.`;
  }

  // Lead status changed
  if (module === "Leads" && action === "status_changed") {
    const from = (beforeValue as { status?: string } | undefined)?.status;
    const to = (afterValue as { status?: string } | undefined)?.status;
    if (from && to) {
      return `Lead ${objectId} status changed from ${from} to ${to}.`;
    }
  }

  // Expense flow
  if (module === "Expenses" && action === "status_changed") {
    const from = (beforeValue as { status?: string } | undefined)?.status;
    const to = (afterValue as { status?: string } | undefined)?.status;
    if (from && to) {
      return `Expense ${objectId} moved from ${from} to ${to}.`;
    }
  }
  if (module === "Expenses" && action === "approved") {
    return `Expense ${objectId} approved.`;
  }
  if (module === "Expenses" && action === "rejected") {
    return `Expense ${objectId} rejected${entry.notes ? `: ${entry.notes}` : "."}`;
  }
  if (module === "Expenses" && action === "paid") {
    return `Expense ${objectId} marked paid / reimbursed.`;
  }

  // Fleet edits
  if (module === "Fleet" && action === "edited") {
    return `Vehicle ${objectId} updated.`;
  }
  if (module === "Fleet" && action === "status_changed") {
    const from = (beforeValue as { status?: string } | undefined)?.status;
    const to = (afterValue as { status?: string } | undefined)?.status;
    if (from && to) {
      return `Vehicle ${objectId} status ${from} → ${to}.`;
    }
  }

  // Invoice flow
  if (module === "Invoices" && action === "status_changed") {
    const from = (beforeValue as { status?: string } | undefined)?.status;
    const to = (afterValue as { status?: string } | undefined)?.status;
    if (from && to) {
      return `Invoice ${objectId} status ${from} → ${to}.`;
    }
  }
  if (module === "Invoices" && action === "paid") {
    const a = afterValue as { amount?: number } | undefined;
    return `Invoice ${objectId} marked paid${a?.amount ? ` (${fmtMoney(a.amount)})` : "."}`;
  }
  if (module === "Invoices" && action === "rejected") {
    return `Invoice ${objectId} voided.`;
  }

  // Dispatch assignment
  if (module === "Dispatch" && action === "assigned") {
    const a = afterValue as { foreman?: string } | undefined;
    if (a?.foreman) return `${a.foreman} assigned to ${objectId} from dispatch.`;
  }

  // Payroll period actions
  if (module === "Payroll" && action === "approved") {
    return `Payroll period approved for ${objectId}.`;
  }
  if (module === "Payroll" && action === "rejected") {
    return `Payroll period flagged for ${objectId}.`;
  }

  // Fallback
  return title.endsWith(".") ? title : `${title}.`;
}
