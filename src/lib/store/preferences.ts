"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Palette } from "@/lib/theme/palettes";
import { ROLES, type UserRoleId } from "@/lib/auth/roles";
import type { CapabilityId } from "@/lib/auth/capabilities";

interface PreferencesState {
  palette: Palette;
  setPalette: (p: Palette) => void;
  customSwatch: [string, string, string];
  setCustomSwatch: (s: [string, string, string]) => void;
  sidebarSide: "left" | "right";
  setSidebarSide: (s: "left" | "right") => void;
  sidebarOpen: boolean;
  setSidebarOpen: (o: boolean) => void;
  activeRoleId: UserRoleId;
  setActiveRoleId: (id: UserRoleId) => void;

  /** Workspace-level capability overrides per role. Undefined = use defaults. */
  capabilityOverrides: Partial<Record<UserRoleId, CapabilityId[]>>;
  setRoleCapabilities: (roleId: UserRoleId, caps: CapabilityId[]) => void;
  resetRoleCapabilities: (roleId: UserRoleId) => void;
  toggleCapability: (roleId: UserRoleId, capId: CapabilityId) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set, get) => ({
      palette: "midnight",
      setPalette: (palette) => set({ palette }),
      customSwatch: ["#1a1f2c", "#7c3aed", "#a78bfa"],
      setCustomSwatch: (customSwatch) => set({ customSwatch }),
      sidebarSide: "left",
      setSidebarSide: (sidebarSide) => set({ sidebarSide }),
      sidebarOpen: true,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      activeRoleId: "owner",
      setActiveRoleId: (activeRoleId) => set({ activeRoleId }),

      capabilityOverrides: {},
      setRoleCapabilities: (roleId, caps) =>
        set((s) => ({
          capabilityOverrides: { ...s.capabilityOverrides, [roleId]: caps },
        })),
      resetRoleCapabilities: (roleId) =>
        set((s) => {
          const next = { ...s.capabilityOverrides };
          delete next[roleId];
          return { capabilityOverrides: next };
        }),
      toggleCapability: (roleId, capId) => {
        const { capabilityOverrides } = get();
        const defaultCaps = ROLES[roleId].defaultCapabilities;
        const current = capabilityOverrides[roleId] ?? defaultCaps;
        const next = current.includes(capId)
          ? current.filter((c) => c !== capId)
          : [...current, capId];
        set((s) => ({
          capabilityOverrides: { ...s.capabilityOverrides, [roleId]: next },
        }));
      },
    }),
    { name: "arsemia.preferences.v3" },
  ),
);
