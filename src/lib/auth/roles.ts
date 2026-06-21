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
    description: "Pipeline, dispatch board, jobs, drivers, fleet, routes.",
    allowedRoutes: [
      "/",
      "/pipeline",
      "/dispatch",
      "/jobs",
      "/routes",
      "/drivers",
      "/fleet",
    ],
    landing: "/dispatch",
  },
  seller: {
    id: "seller",
    label: "Seller / Sales",
    description: "Leads, quotes, customers, and own commissions.",
    allowedRoutes: ["/", "/leads", "/quotes", "/customers", "/payroll"],
    landing: "/leads",
  },
  driver: {
    id: "driver",
    label: "Driver",
    description: "Assigned jobs, personal payroll, routes.",
    allowedRoutes: ["/", "/jobs", "/payroll"],
    landing: "/jobs",
  },
  foreman: {
    id: "foreman",
    label: "Foreman",
    description: "Active job, inventory scan, signatures, weekly payroll.",
    allowedRoutes: ["/", "/jobs", "/payroll", "/foreman"],
    landing: "/foreman",
  },
  marketing: {
    id: "marketing",
    label: "Marketing",
    description: "Analytics, customers, lead sources.",
    allowedRoutes: ["/", "/analytics", "/customers", "/leads"],
    landing: "/analytics",
  },
  accountant: {
    id: "accountant",
    label: "Accountant",
    description: "Invoices, payroll, claims, financial reports.",
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
