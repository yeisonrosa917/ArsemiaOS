"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createId } from "@/lib/id";
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
  /** Local profile photo (data URI). No photo → initials avatar everywhere. */
  photoUrl?: string;
  /** Placeholder until real auth/session tracking exists. */
  lastActive: string;
}

/** Profile completeness — drives the "complete your profile" flags. */
export function profileFlags(u: Pick<WorkspaceUser, "name" | "email" | "photoUrl">) {
  const missing: string[] = [];
  if (!u.name?.trim()) missing.push("name");
  if (!u.email?.trim()) missing.push("email");
  if (!u.photoUrl) missing.push("photo");
  return { complete: missing.length === 0, missing };
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

const AVATAR_COLORS = [
  "bg-brand-500",
  "bg-emerald-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
];

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function mkUserId(): string {
  return createId("user");
}

interface UsersState {
  users: WorkspaceUser[];
  setRole: (id: string, roleId: UserRoleId) => void;
  setStatus: (id: string, status: UserStatus) => void;
  updateProfile: (
    id: string,
    patch: Partial<Pick<WorkspaceUser, "name" | "email" | "photoUrl">>,
  ) => void;
  /** Set or clear the local profile photo (data URI; local only). */
  setPhoto: (id: string, photoUrl: string | undefined) => void;
  inviteUser: (input: { name: string; email: string; roleId: UserRoleId }) => WorkspaceUser;
  removeUser: (id: string) => void;
}

export const useUsers = create<UsersState>()(
  persist(
    (set, get) => ({
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
      setPhoto: (id, photoUrl) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? { ...u, photoUrl } : u)),
        })),
      inviteUser: ({ name, email, roleId }) => {
        const count = get().users.length;
        const user: WorkspaceUser = {
          id: mkUserId(),
          name: name.trim(),
          email: email.trim(),
          initials: initialsFor(name),
          avatarColor: AVATAR_COLORS[count % AVATAR_COLORS.length],
          roleId,
          status: "active",
          lastActive: "Invited · pending first sign-in",
        };
        set((s) => ({ users: [...s.users, user] }));
        return user;
      },
      removeUser: (id) =>
        set((s) => ({ users: s.users.filter((u) => u.id !== id) })),
    }),
    {
      name: "arsemia.users.v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
