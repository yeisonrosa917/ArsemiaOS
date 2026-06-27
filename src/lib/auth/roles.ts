import type { CapabilityId } from "./capabilities";

export type UserRoleId =
  | "owner"
  | "dispatcher"
  | "seller"
  | "foreman"
  | "marketing"
  | "accountant"
  | "claims";

export interface UserRole {
  id: UserRoleId;
  label: string;
  description: string;
  /** Default capabilities granted to this role (can be overridden per workspace). */
  defaultCapabilities: CapabilityId[];
  /** Where to send the user after switching to this role. */
  landing: string;
}

/**
 * Routes are inferred from capabilities. Each route requires at least one
 * capability to render in the sidebar.
 *
 * IMPORTANT: deny-by-default. If a route is NOT in this map, only Owner can
 * access it. See canAccessRoute below.
 */
export const ROUTE_REQUIRES: Record<string, CapabilityId[]> = {
  "/": ["dashboard.view"],
  "/pipeline": ["leads.view"],
  "/dispatch": ["dispatch.view"],
  "/foreman-portal": ["jobs.view"],
  "/jobs": ["jobs.view"],
  "/routes": ["routes.view"],
  "/activity": ["roles.manage"],
  "/foremen": ["drivers.view"],
  "/fleet": ["fleet.view"],
  "/customers": ["customers.view"],
  "/leads": ["leads.view"],
  "/quotes": ["quotes.view"],
  "/invoices": ["invoices.view"],
  "/invoices/print": ["invoices.view"],
  "/expenses": ["expenses.view_own", "expenses.view_all"],
  "/payroll": ["payroll.view_own", "payroll.view_all"],
  "/payroll/tools": ["payroll.audit"],
  "/claims": ["claims.view"],
  "/analytics": ["analytics.view"],
  "/settings": ["settings.view"],
  "/notifications": ["dashboard.view"],
};

const OWNER_CAPS: CapabilityId[] = [
  "dashboard.view",
  "dispatch.view", "dispatch.assign",
  "jobs.view", "jobs.create", "jobs.edit", "jobs.reassign", "jobs.delete",
  "routes.view", "routes.edit",
  "drivers.view", "drivers.edit",
  "fleet.view", "fleet.edit",
  "customers.view", "customers.edit",
  "leads.view", "leads.convert",
  "quotes.view", "quotes.create",
  "invoices.view", "invoices.create", "invoices.send",
  "expenses.view_own", "expenses.view_all", "expenses.approve",
  "payroll.view_own", "payroll.view_all", "payroll.approve", "payroll.audit",
  "claims.view", "claims.manage",
  "analytics.view", "analytics.export",
  "settings.view", "settings.manage", "roles.manage",
];

export const ROLES: Record<UserRoleId, UserRole> = {
  owner: {
    id: "owner",
    label: "Owner",
    description: "Full access. Can grant or revoke capabilities for any role.",
    defaultCapabilities: OWNER_CAPS,
    landing: "/",
  },

  /** Dispatch / Operations — runs the live operation post-booking. */
  dispatcher: {
    id: "dispatcher",
    label: "Dispatch / Operations",
    description:
      "Dispatch board, jobs, routes, foremen, fleet basic. No financial data, no permission management.",
    defaultCapabilities: [
      "dashboard.view",
      "dispatch.view", "dispatch.assign",
      "jobs.view", "jobs.create", "jobs.edit", "jobs.reassign",
      "routes.view", "routes.edit",
      "drivers.view",
      "fleet.view",
      "customers.view",
    ],
    landing: "/dispatch",
  },

  /**
   * Seller / Sales — strictly commercial. NO dashboard, operations board,
   * dispatch, routes, fleet, payroll, claims, activity log global,
   * permission management.
   */
  seller: {
    id: "seller",
    label: "Seller / Sales",
    description:
      "Sales pipeline, leads, quotes, customers. No operations or admin areas.",
    defaultCapabilities: [
      "leads.view", "leads.convert",
      "quotes.view", "quotes.create",
      "customers.view", "customers.edit",
    ],
    landing: "/pipeline",
  },

  /**
   * Foreman / Contractor — heavily restricted in the Hub. Shows a Foreman
   * Portal placeholder until the mobile app integrates.
   */
  foreman: {
    id: "foreman",
    label: "Foreman / Contractor",
    description:
      "Field role. The Hub shows only own jobs, payroll, expenses placeholder until the Foreman App ships.",
    defaultCapabilities: [
      "jobs.view",
      "payroll.view_own",
      "expenses.view_own",
    ],
    landing: "/foreman-portal",
  },

  /** Marketing — analytics + customers + leads (read-only). */
  marketing: {
    id: "marketing",
    label: "Marketing",
    description: "Analytics, customer base, lead sources.",
    defaultCapabilities: [
      "dashboard.view",
      "customers.view",
      "leads.view",
      "analytics.view", "analytics.export",
    ],
    landing: "/analytics",
  },

  /** Accounting — finance only. NO dispatch, NO permission management. */
  accountant: {
    id: "accountant",
    label: "Accounting",
    description: "Invoices, expenses, payroll audit, financial analytics.",
    defaultCapabilities: [
      "invoices.view", "invoices.create", "invoices.send",
      "expenses.view_all", "expenses.approve",
      "payroll.view_all", "payroll.approve", "payroll.audit",
      "customers.view",
      "analytics.view", "analytics.export",
    ],
    landing: "/payroll",
  },

  /** Claims team — claims, related job/customer/foreman context. */
  claims: {
    id: "claims",
    label: "Claims Team",
    description: "Claims and evidence. Read access to related jobs/customers/foremen.",
    defaultCapabilities: [
      "claims.view", "claims.manage",
      "jobs.view",
      "customers.view",
      "drivers.view",
    ],
    landing: "/claims",
  },
};

export const ROLE_IDS: UserRoleId[] = [
  "owner",
  "dispatcher",
  "seller",
  "foreman",
  "marketing",
  "accountant",
  "claims",
];

/** Resolve effective capabilities given a role + workspace-level overrides. */
export function resolveCapabilities(
  roleId: UserRoleId,
  overrides?: Partial<Record<UserRoleId, CapabilityId[]>>,
): CapabilityId[] {
  if (overrides && overrides[roleId]) return overrides[roleId] as CapabilityId[];
  return ROLES[roleId].defaultCapabilities;
}

export function hasCapability(
  caps: CapabilityId[],
  required: CapabilityId,
): boolean {
  return caps.includes(required);
}

export function hasAnyCapability(
  caps: CapabilityId[],
  required: CapabilityId[],
): boolean {
  return required.some((r) => caps.includes(r));
}

/**
 * DENY-BY-DEFAULT route access.
 *
 * - If a route IS in ROUTE_REQUIRES → user must have at least one of the
 *   required capabilities.
 * - If a route is NOT in ROUTE_REQUIRES → only Owner (via `roles.manage`) can
 *   access. This protects sub-routes like /foremen/[id], /fleet/[id],
 *   /quotes/[id], /leads/[id], /customers/[id], /jobs/[id] which inherit from
 *   the parent route — see `canAccessRouteWithFallback`.
 */
export function canAccessRoute(
  caps: CapabilityId[],
  route: string,
): boolean {
  const required = ROUTE_REQUIRES[route];
  if (required) return hasAnyCapability(caps, required);
  // Deny by default. Owner is granted via roles.manage.
  return caps.includes("roles.manage");
}

/**
 * Like canAccessRoute but falls back to the parent route's requirement so
 * /quotes/QT-123 inherits /quotes' permission. Use this for guarding pages.
 */
export function canAccessRouteWithFallback(
  caps: CapabilityId[],
  route: string,
): boolean {
  if (canAccessRoute(caps, route)) return true;
  // Strip the last segment and re-check (handles /foo/[id] → /foo).
  const parent = "/" + route.split("/").filter(Boolean).slice(0, 1).join("/");
  if (parent !== route) {
    const required = ROUTE_REQUIRES[parent];
    if (required) return hasAnyCapability(caps, required);
  }
  return caps.includes("roles.manage");
}
