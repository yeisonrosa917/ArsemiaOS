"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AccountState } from "@/lib/types";

interface AccountStoreState {
  account: AccountState | null;
  requestDeletion: (userId: string) => void;
  completeDeletion: () => AccountState;
  cancelDeletion: () => void;
  /** Soft-delete helper — returns the anonymized name to use in UI. */
  displayNameOf: (originalName: string) => string;
}

export const useAccount = create<AccountStoreState>()(
  persist(
    (set, get) => ({
      account: null,
      requestDeletion: (userId) =>
        set({
          account: {
            userId,
            deletionRequestedAt: new Date().toISOString(),
            anonymized: false,
          },
        }),
      completeDeletion: () => {
        const now = new Date().toISOString();
        const next: AccountState = {
          userId: get().account?.userId ?? "u_owner",
          deletionRequestedAt: get().account?.deletionRequestedAt,
          deletionCompletedAt: now,
          deletedAt: now,
          anonymized: true,
        };
        set({ account: next });
        return next;
      },
      cancelDeletion: () => set({ account: null }),
      displayNameOf: (originalName) =>
        get().account?.anonymized ? "Deleted Account" : originalName,
    }),
    {
      name: "arsemia.account.v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
