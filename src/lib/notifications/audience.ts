import type { UserRoleId } from "@/lib/auth/roles";
import type { Notification, NotificationKind } from "@/lib/store/notifications";

/**
 * Role-based notification routing.
 *
 * Each notification kind maps to the non-owner roles allowed to see it. Owner
 * always sees everything. A notification can additionally target a specific
 * role (or "foreman") via its `audience` field, which grants that role access
 * on top of the category. Anyone not covered is denied — so Marketing never
 * sees fleet maintenance, Seller never sees payroll, etc.
 */
const CATEGORY_ROLES: Record<NotificationKind, UserRoleId[]> = {
  expense_pending: ["accountant"],
  expense_missing_receipt: ["accountant"],
  invoice_overdue: ["accountant"],
  invoice_paid: ["accountant"],
  payroll_flag: ["accountant"],
  payroll_pending: ["accountant"],
  // Foreman-response requests reach the claims team and the foreman.
  claim_foreman_response: ["claims", "foreman"],
  claim_evidence_needed: ["claims"],
  claim_status_changed: ["claims"],
  // Fleet alerts are operational — dispatch, not marketing/accounting.
  fleet_maintenance: ["dispatcher"],
  fleet_insurance: ["dispatcher"],
  fleet_registration: ["dispatcher"],
  job_unassigned: ["dispatcher"],
  job_reassigned: ["dispatcher"],
  adjustment_requested: ["dispatcher", "accountant"],
  quote_saved: ["seller"],
  lead_assigned: ["seller"],
  lead_followup: ["seller"],
  // Admin-only.
  settings_reset: [],
  // Generic info messages are visible to everyone.
  info: ["dispatcher", "seller", "accountant", "claims", "marketing", "foreman"],
};

export function notificationVisibleToRole(
  n: Pick<Notification, "kind" | "audience">,
  roleId: UserRoleId,
): boolean {
  if (roleId === "owner") return true;
  if (n.audience && n.audience === roleId) return true;
  const roles = CATEGORY_ROLES[n.kind] ?? [];
  return roles.includes(roleId);
}

export function filterNotificationsForRole<T extends Pick<Notification, "kind" | "audience">>(
  items: T[],
  roleId: UserRoleId,
): T[] {
  return items.filter((n) => notificationVisibleToRole(n, roleId));
}
