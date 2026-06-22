import type { UserRoleId } from "./roles";

export interface SeedUser {
  id: string;
  name: string;
  initials: string;
  email: string;
  roleId: UserRoleId;
  avatarColor: string;
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
    id: "u_for",
    name: "Roberto Salas",
    initials: "RS",
    email: "foreman@arsemia.test",
    roleId: "foreman",
    avatarColor: "from-rose-400 to-rose-700",
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
];

export function getUserByRole(roleId: UserRoleId): SeedUser {
  return SEED_USERS.find((u) => u.roleId === roleId) ?? SEED_USERS[0];
}
