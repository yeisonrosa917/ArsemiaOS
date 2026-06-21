"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Palette } from "@/lib/theme/palettes";
import type { UserRoleId } from "@/lib/auth/roles";

interface PreferencesState {
  palette: Palette;
  setPalette: (p: Palette) => void;
  sidebarSide: "left" | "right";
  setSidebarSide: (s: "left" | "right") => void;
  sidebarOpen: boolean;
  setSidebarOpen: (o: boolean) => void;
  activeRoleId: UserRoleId;
  setActiveRoleId: (id: UserRoleId) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      palette: "midnight",
      setPalette: (palette) => set({ palette }),
      sidebarSide: "right",
      setSidebarSide: (sidebarSide) => set({ sidebarSide }),
      sidebarOpen: true,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      activeRoleId: "owner",
      setActiveRoleId: (activeRoleId) => set({ activeRoleId }),
    }),
    { name: "arsemia.preferences.v1" },
  ),
);
