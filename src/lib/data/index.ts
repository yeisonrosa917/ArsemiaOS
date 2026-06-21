/**
 * Data layer.
 *
 * For now this is a thin re-export over the mock-data file. When we connect
 * Supabase (Phase 3), the surface stays identical — components will keep
 * importing from `@/lib/data` and only this file changes.
 */

export {
  drivers,
  jobs,
  customers,
  invoices,
  payrollLines,
  claims,
  vehicles,
  routes,
  revenueByDay,
  revenueByMonth,
  jobsByStatus,
  jobsByZone,
  driverActivity,
  kpiSnapshot,
  zones,
  jobStatuses,
} from "@/lib/mock-data";

export { SEED_USERS, getUserByRole } from "@/lib/auth/users";
export { ROLES, canAccessRoute } from "@/lib/auth/roles";
export type { UserRoleId, UserRole } from "@/lib/auth/roles";
export type { SeedUser } from "@/lib/auth/users";
