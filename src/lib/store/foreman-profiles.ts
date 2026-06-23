"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type PayoutModelKind = "contractor_33_5" | "crew_30" | "custom";

export interface ForemanProfile {
  id: string;
  payoutModel: PayoutModelKind;
  customPercent?: number;
  contractorCompany?: string;
  paymentMethod: "ACH" | "Check" | "Zelle" | "Cash";
  notes?: string;
}

const DEFAULT_PROFILES: ForemanProfile[] = [
  { id: "FM-1042", payoutModel: "contractor_33_5", contractorCompany: "Reyes Moving LLC", paymentMethod: "ACH" },
  { id: "FM-1043", payoutModel: "crew_30", paymentMethod: "ACH" },
  { id: "FM-1044", payoutModel: "crew_30", paymentMethod: "Zelle" },
  { id: "FM-1045", payoutModel: "contractor_33_5", contractorCompany: "Volkov Logistics", paymentMethod: "ACH" },
  { id: "FM-1046", payoutModel: "contractor_33_5", contractorCompany: "Carter & Sons Moving", paymentMethod: "ACH" },
  { id: "FM-1047", payoutModel: "crew_30", paymentMethod: "Check" },
  { id: "FM-1048", payoutModel: "custom", customPercent: 28, paymentMethod: "ACH", notes: "Probationary rate until 90 days." },
  { id: "FM-2001", payoutModel: "contractor_33_5", contractorCompany: "Vuk Moving Co", paymentMethod: "ACH" },
  { id: "FM-2002", payoutModel: "crew_30", paymentMethod: "Zelle" },
  { id: "FM-2003", payoutModel: "crew_30", paymentMethod: "Cash" },
  { id: "FM-2004", payoutModel: "contractor_33_5", contractorCompany: "Milkos Hauling", paymentMethod: "ACH" },
  { id: "FM-2005", payoutModel: "crew_30", paymentMethod: "ACH" },
  { id: "FM-2006", payoutModel: "crew_30", paymentMethod: "Zelle" },
  { id: "FM-2007", payoutModel: "contractor_33_5", contractorCompany: "Giancovic Transport", paymentMethod: "ACH" },
];

interface ForemanProfilesState {
  profiles: ForemanProfile[];
  update: (id: string, patch: Partial<ForemanProfile>) => void;
  getById: (id: string) => ForemanProfile | undefined;
  effectivePercent: (id: string) => number;
}

export function payoutPercentFor(profile: ForemanProfile | undefined): number {
  if (!profile) return 30;
  if (profile.payoutModel === "contractor_33_5") return 33.5;
  if (profile.payoutModel === "crew_30") return 30;
  return profile.customPercent ?? 30;
}

export function payoutModelLabel(profile: ForemanProfile | undefined): string {
  if (!profile) return "Crew 30%";
  if (profile.payoutModel === "contractor_33_5") return "Contractor 33.5%";
  if (profile.payoutModel === "crew_30") return "Crew 30%";
  return `Custom ${profile.customPercent ?? 30}%`;
}

export const useForemanProfiles = create<ForemanProfilesState>()(
  persist(
    (set, get) => ({
      profiles: DEFAULT_PROFILES,
      update: (id, patch) =>
        set((s) => ({
          profiles: s.profiles.some((p) => p.id === id)
            ? s.profiles.map((p) => (p.id === id ? { ...p, ...patch } : p))
            : [...s.profiles, { id, payoutModel: "crew_30", paymentMethod: "ACH", ...patch } as ForemanProfile],
        })),
      getById: (id) => get().profiles.find((p) => p.id === id),
      effectivePercent: (id) => payoutPercentFor(get().profiles.find((p) => p.id === id)),
    }),
    {
      name: "arsemia.foreman-profiles.v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
