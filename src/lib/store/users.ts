"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { SEED_USERS } from "@/lib/auth/users";
import type { UserRoleId } from "@/lib/auth/roles";

export type UserStatus = "active" | "inactive";

export interface WorkspaceUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarColor: string;
  roleId: UserRoleId;
  status: UserStatus;
  /** FM-#### this user maps to, if they are a foreman. */
  foremanId?: string;
  /** Placeholder until real auth/session tracking exists. */
  lastActive: string;
}

const LAST_ACTIVE = [
  "Just now",
  "8 minutes ago",
  "1 hour ago",
  "Today, 9:12 AM",
  "Yesterday",
  "2 days ago",
  "Last week",
];

const SEED: WorkspaceUser[] = SEED_USERS.map((u, i) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  initials: u.initials,
  avatarColor: u.avatarColor,
  roleId: u.roleId,
  status: "active",
  foremanId: u.foremanId,
  lastActive: LAST_ACTIVE[i % LAST_ACTIVE.length],
}));

interface UsersState {
  users: WorkspaceUser[];
  setRole: (id: string, roleId: UserRoleId) => void;
  setStatus: (id: string, status: UserStatus) => void;
  updateProfile: (id: string, patch: Partial<Pick<WorkspaceUser, "name" | "email">>) => void;
}

export const useUsers = create<UsersState>()(
  persist(
    (set) => ({
      users: SEED,
      setRole: (id, roleId) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? { ...u, roleId } : u)),
        })),
      setStatus: (id, status) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? { ...u, status } : u)),
        })),
      updateProfile: (id, patch) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
        })),
    }),
    {
      name: "arsemia.users.v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
