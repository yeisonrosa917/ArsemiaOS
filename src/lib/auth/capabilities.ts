/**
 * Atomic capability system (WordPress-style).
 *
 * Each capability is a granular permission. Roles are sets of capabilities.
 * The Owner can pick a role and toggle capabilities individually via
 * Settings → Roles & Permissions.
 *
 * Capability IDs follow the pattern `<resource>.<action>`.
 *   - view  : read access to listing / detail
 *   - create: can create new entities
 *   - edit  : can edit existing entities
 *   - delete: can delete entities
 *   - manage: full administrative control
 */

export type CapabilityId =
  | "dashboard.view"
  | "dispatch.view"
  | "dispatch.assign"
  | "jobs.view"
  | "jobs.create"
  | "jobs.edit"
  | "jobs.reassign"
  | "jobs.delete"
  | "routes.view"
  | "routes.edit"
  | "drivers.view"
  | "drivers.edit"
  | "fleet.view"
  | "fleet.edit"
  | "storage.view"
  | "storage.manage"
  | "customers.view"
  | "customers.edit"
  | "leads.view"
  | "leads.convert"
  | "quotes.view"
  | "quotes.create"
  | "invoices.view"
  | "invoices.create"
  | "invoices.send"
  | "payroll.view_own"
  | "payroll.view_all"
  | "payroll.approve"
  | "payroll.audit"
  | "expenses.view_own"
  | "expenses.view_all"
  | "expenses.approve"
  | "claims.view"
  | "claims.manage"
  | "analytics.view"
  | "analytics.export"
  | "settings.view"
  | "settings.manage"
  | "roles.manage";

export interface CapabilityMeta {
  id: CapabilityId;
  group: CapabilityGroup;
  label: string;
  description: string;
}

export type CapabilityGroup =
  | "Dashboard"
  | "Dispatch"
  | "Jobs"
  | "Routes"
  | "Foremen"
  | "Fleet"
  | "Storage"
  | "Customers"
  | "Sales"
  | "Finance"
  | "Claims"
  | "Analytics"
  | "Admin";

export const CAPABILITIES: CapabilityMeta[] = [
  { id: "dashboard.view", group: "Dashboard", label: "View dashboard", description: "Access the home dashboard with KPIs." },

  { id: "dispatch.view", group: "Dispatch", label: "View dispatch board", description: "See live job queue and driver positions." },
  { id: "dispatch.assign", group: "Dispatch", label: "Assign / reassign drivers", description: "Drag jobs between drivers." },

  { id: "jobs.view", group: "Jobs", label: "View jobs", description: "See the jobs list and details." },
  { id: "jobs.create", group: "Jobs", label: "Create jobs", description: "Add new jobs manually." },
  { id: "jobs.edit", group: "Jobs", label: "Edit jobs", description: "Modify job details." },
  { id: "jobs.reassign", group: "Jobs", label: "Reassign jobs", description: "Move jobs between drivers." },
  { id: "jobs.delete", group: "Jobs", label: "Delete jobs", description: "Permanently delete jobs." },

  { id: "routes.view", group: "Routes", label: "View routes", description: "See planned and active routes." },
  { id: "routes.edit", group: "Routes", label: "Edit routes", description: "Plan or optimize routes." },

  { id: "drivers.view", group: "Foremen", label: "View drivers", description: "See driver roster." },
  { id: "drivers.edit", group: "Foremen", label: "Edit drivers", description: "Update driver records and documents." },

  { id: "fleet.view", group: "Fleet", label: "View fleet", description: "See vehicles and maintenance." },
  { id: "fleet.edit", group: "Fleet", label: "Edit fleet", description: "Update vehicle records." },

  { id: "storage.view", group: "Storage", label: "View storage", description: "See storage providers, units and stored inventory." },
  { id: "storage.manage", group: "Storage", label: "Manage storage", description: "Scan items, advance chain of custody, flag damage/missing." },

  { id: "customers.view", group: "Customers", label: "View customers", description: "Browse customer list and history." },
  { id: "customers.edit", group: "Customers", label: "Edit customers", description: "Create or modify customers." },

  { id: "leads.view", group: "Sales", label: "View leads", description: "Browse incoming leads." },
  { id: "leads.convert", group: "Sales", label: "Convert leads to jobs", description: "Move a lead through the pipeline." },
  { id: "quotes.view", group: "Sales", label: "View quotes", description: "Open quote builder." },
  { id: "quotes.create", group: "Sales", label: "Create quotes", description: "Build new quotes with the calculator." },

  { id: "invoices.view", group: "Finance", label: "View invoices", description: "Browse invoices." },
  { id: "invoices.create", group: "Finance", label: "Create invoices", description: "Issue new invoices." },
  { id: "invoices.send", group: "Finance", label: "Send invoices to customers", description: "Email / SMS invoices." },

  { id: "payroll.view_own", group: "Finance", label: "View own payroll", description: "See ONLY your own commissions." },
  { id: "payroll.view_all", group: "Finance", label: "View all payroll", description: "See payroll for every user." },
  { id: "payroll.approve", group: "Finance", label: "Approve payroll", description: "Mark payroll lines approved/paid." },
  { id: "payroll.audit", group: "Finance", label: "Audit payroll", description: "Run audit engine and view variance flags." },

  { id: "expenses.view_own", group: "Finance", label: "View own expenses", description: "See ONLY your own submitted expenses." },
  { id: "expenses.view_all", group: "Finance", label: "View all expenses", description: "See expenses from every foreman." },
  { id: "expenses.approve", group: "Finance", label: "Approve / reject expenses", description: "Review expense submissions." },

  { id: "claims.view", group: "Claims", label: "View claims", description: "Browse damage / dispute claims." },
  { id: "claims.manage", group: "Claims", label: "Manage claims", description: "Assign and resolve claims." },

  { id: "analytics.view", group: "Analytics", label: "View analytics", description: "Access revenue / ops charts." },
  { id: "analytics.export", group: "Analytics", label: "Export analytics", description: "Download CSV / PDF reports." },

  { id: "settings.view", group: "Admin", label: "View settings", description: "Read org configuration." },
  { id: "settings.manage", group: "Admin", label: "Manage settings", description: "Edit org configuration." },
  { id: "roles.manage", group: "Admin", label: "Manage roles & permissions", description: "Toggle capabilities for any role." },
];

export const CAPABILITY_GROUPS: CapabilityGroup[] = [
  "Dashboard",
  "Dispatch",
  "Jobs",
  "Routes",
  "Foremen",
  "Fleet",
  "Storage",
  "Customers",
  "Sales",
  "Finance",
  "Claims",
  "Analytics",
  "Admin",
];
