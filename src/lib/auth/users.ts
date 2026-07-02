import type { UserRoleId } from "./roles";

export interface SeedUser {
  id: string;
  name: string;
  initials: string;
  email: string;
  roleId: UserRoleId;
  avatarColor: string;
  /**
   * For the foreman role only: the FM-#### id this user maps to in the
   * operational data. Used to scope payroll/expenses/jobs to the active
   * foreman so they can never see another foreman's records.
   */
  foremanId?: string;
}

export const SEED_USERS: SeedUser[] = [
  {
    id: "u_owner",
    name: "Yeison Rosa",
    initials: "YR",
    email: "owner@arsemia.test",
    roleId: "owner",
    avatarColor: "from-brand-400 to-brand-700",
  },
  {
    id: "u_disp",
    name: "Mariana Castro",
    initials: "MC",
    email: "dispatcher@arsemia.test",
    roleId: "dispatcher",
    avatarColor: "from-amber-400 to-orange-700",
  },
  {
    id: "u_sell",
    name: "Carlos Estevez",
    initials: "CE",
    email: "seller@arsemia.test",
    roleId: "seller",
    avatarColor: "from-emerald-400 to-emerald-700",
  },
  {
    id: "u_sell2",
    name: "Daniela Rios",
    initials: "DR",
    email: "daniela@arsemia.test",
    roleId: "seller",
    avatarColor: "from-fuchsia-400 to-pink-700",
  },
  {
    id: "u_sell3",
    name: "Andres Molina",
    initials: "AM",
    email: "andres@arsemia.test",
    roleId: "seller",
    avatarColor: "from-sky-400 to-indigo-700",
  },
  {
    id: "u_for",
    name: "Marcus Reyes",
    initials: "MR",
    email: "foreman@arsemia.test",
    roleId: "foreman",
    avatarColor: "from-rose-400 to-rose-700",
    foremanId: "FM-1042",
  },
  {
    id: "u_mkt",
    name: "Valeria Ortiz",
    initials: "VO",
    email: "marketing@arsemia.test",
    roleId: "marketing",
    avatarColor: "from-violet-400 to-purple-700",
  },
  {
    id: "u_acc",
    name: "Luis Mendoza",
    initials: "LM",
    email: "accountant@arsemia.test",
    roleId: "accountant",
    avatarColor: "from-slate-400 to-slate-700",
  },
  {
    id: "u_cla",
    name: "Andrea Velazquez",
    initials: "AV",
    email: "claims@arsemia.test",
    roleId: "claims",
    avatarColor: "from-cyan-400 to-blue-700",
  },
];

export function getUserByRole(roleId: UserRoleId): SeedUser {
  return SEED_USERS.find((u) => u.roleId === roleId) ?? SEED_USERS[0];
}

/** All seller users (for lead assignment + workload views). */
export function getSellers(): SeedUser[] {
  return SEED_USERS.filter((u) => u.roleId === "seller");
}

/**
 * The FM-#### id the active foreman maps to, or null for non-foreman roles.
 * Used to scope payroll/expenses/jobs so a foreman only sees their own data.
 */
export function getActiveForemanId(roleId: UserRoleId): string | null {
  return getUserByRole(roleId).foremanId ?? null;
}
