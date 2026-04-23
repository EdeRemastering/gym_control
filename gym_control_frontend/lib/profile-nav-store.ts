"use client";

import { create } from "zustand";

interface ProfileNavState {
  profileFocusUserId: string | null;
  requestProfileFocus: (userId: string) => void;
  clearProfileFocus: () => void;
}

export const useProfileNavStore = create<ProfileNavState>((set) => ({
  profileFocusUserId: null,
  requestProfileFocus: (userId) => set({ profileFocusUserId: userId }),
  clearProfileFocus: () => set({ profileFocusUserId: null }),
}));
