export type UserRoleId =
  | "owner"
  | "dispatcher"
  | "seller"
  | "driver"
  | "marketing"
  | "accountant"
  | "foreman";

export interface UserRole {
  id: UserRoleId;
  label: string;
  description: string;
  /** Routes this role can access. Empty array = all. */
  allowedRoutes: string[];
  /** Optional landing page after login for this role. */
  landing: string;
}

/**
 * STRICT role permissions.
 * - Seller never sees Dispatch / Jobs / Drivers / Fleet / Routes / Claims.
 * - Driver never sees Customers / Invoices / Claims / Fleet / Settings.
 * - Foreman never sees anything financial except their own payroll.
 * - Marketing never sees Dispatch / Jobs / Payroll / Claims.
 * - Accountant never sees Dispatch / Drivers / Fleet / Routes.
 * - Dispatcher never sees Invoices / Payroll / Analytics.
 * - Owner sees everything.
 */
export const ROLES: Record<UserRoleId, UserRole> = {
  owner: {
    id: "owner",
    label: "Owner",
    description: "Full access across operations, finance and analytics.",
    allowedRoutes: [],
    landing: "/",
  },
  dispatcher: {
    id: "dispatcher",
    label: "Dispatcher",
    description: "Dispatch board, jobs, drivers, fleet, routes.",
    allowedRoutes: [
      "/",
      "/dispatch",
      "/jobs",
      "/routes",
      "/drivers",
      "/fleet",
      "/customers",
    ],
    landing: "/dispatch",
  },
  seller: {
    id: "seller",
    label: "Seller / Sales",
    description: "Customers and own commissions only. (Leads/Quotes coming.)",
    allowedRoutes: ["/", "/customers", "/payroll"],
    landing: "/customers",
  },
  driver: {
    id: "driver",
    label: "Driver",
    description: "Only personal jobs and personal payroll.",
    allowedRoutes: ["/", "/jobs", "/payroll"],
    landing: "/jobs",
  },
  foreman: {
    id: "foreman",
    label: "Foreman",
    description: "Same as driver in the web hub. Mobile app comes later.",
    allowedRoutes: ["/", "/jobs", "/payroll"],
    landing: "/jobs",
  },
  marketing: {
    id: "marketing",
    label: "Marketing",
    description: "Analytics and customers.",
    allowedRoutes: ["/", "/analytics", "/customers"],
    landing: "/analytics",
  },
  accountant: {
    id: "accountant",
    label: "Accountant",
    description: "Invoices, payroll audit, claims, financial analytics.",
    allowedRoutes: ["/", "/invoices", "/payroll", "/claims", "/analytics"],
    landing: "/payroll",
  },
};

export function canAccessRoute(roleId: UserRoleId, route: string): boolean {
  const role = ROLES[roleId];
  if (!role.allowedRoutes.length) return true;
  return role.allowedRoutes.some(
    (r) => r === route || route.startsWith(`${r}/`),
  );
}
