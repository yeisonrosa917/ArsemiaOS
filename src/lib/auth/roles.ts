import type { CapabilityId } from "./capabilities";

export type UserRoleId =
  | "owner"
  | "dispatcher"
  | "seller"
  | "foreman"
  | "marketing"
  | "accountant";

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
 */
export const ROUTE_REQUIRES: Record<string, CapabilityId[]> = {
  "/": ["dashboard.view"],
  "/pipeline": ["jobs.view"],
  "/dispatch": ["dispatch.view"],
  "/jobs": ["jobs.view"],
  "/routes": ["routes.view"],
  "/drivers": ["drivers.view"],
  "/fleet": ["fleet.view"],
  "/customers": ["customers.view"],
  "/leads": ["leads.view"],
  "/quotes": ["quotes.view"],
  "/invoices": ["invoices.view"],
  "/payroll": ["payroll.view_own", "payroll.view_all"],
  "/claims": ["claims.view"],
  "/analytics": ["analytics.view"],
  "/settings": ["settings.view"],
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
  dispatcher: {
    id: "dispatcher",
    label: "Dispatcher",
    description: "Runs the live operation — dispatch board, jobs, drivers, fleet, routes.",
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
  seller: {
    id: "seller",
    label: "Seller / Sales",
    description: "Quotes customers and tracks own commissions. Can view jobs to follow up.",
    defaultCapabilities: [
      "dashboard.view",
      "jobs.view",
      "customers.view", "customers.edit",
      "leads.view", "leads.convert",
      "quotes.view", "quotes.create",
      "payroll.view_own",
    ],
    landing: "/customers",
  },
  foreman: {
    id: "foreman",
    label: "Foreman / Driver",
    description: "Works the assigned jobs in the field. (Foreman = driver — same role in the hub.)",
    defaultCapabilities: [
      "dashboard.view",
      "jobs.view",
      "routes.view",
      "payroll.view_own",
    ],
    landing: "/jobs",
  },
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
  accountant: {
    id: "accountant",
    label: "Accountant",
    description: "Invoices, payroll audit, claims, financial analytics.",
    defaultCapabilities: [
      "dashboard.view",
      "invoices.view", "invoices.create", "invoices.send",
      "payroll.view_all", "payroll.approve", "payroll.audit",
      "claims.view",
      "analytics.view", "analytics.export",
    ],
    landing: "/payroll",
  },
};

export const ROLE_IDS: UserRoleId[] = [
  "owner",
  "dispatcher",
  "seller",
  "foreman",
  "marketing",
  "accountant",
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

export function canAccessRoute(
  caps: CapabilityId[],
  route: string,
): boolean {
  const required = ROUTE_REQUIRES[route];
  if (!required) return true;
  return hasAnyCapability(caps, required);
}
