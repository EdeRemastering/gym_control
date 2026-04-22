"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser, Role } from "@/lib/types";

interface SessionState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  role: Role;
  setSession: (payload: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
    role?: Role;
  }) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      role: "ADMIN",
      setSession: ({ accessToken, refreshToken, user, role }) =>
        set({
          accessToken,
          refreshToken,
          user,
          role: role ?? "ADMIN",
        }),
      clearSession: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          role: "ADMIN",
        }),
    }),
    {
      name: "gym-control-session",
    },
  ),
);
