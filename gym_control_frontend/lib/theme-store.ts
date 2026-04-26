"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeName = "neon-dark" | "light" | "dark-soft" | "high-contrast";
export type ThemeMode = ThemeName | "system";

interface ThemeState {
  mode: ThemeMode;
  resolvedTheme: ThemeName;
  setMode: (mode: ThemeMode) => void;
  resolveTheme: () => void;
}

function getSystemTheme(): ThemeName {
  if (typeof window === "undefined") return "neon-dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "neon-dark" : "light";
}

function applyTheme(theme: ThemeName) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "system",
      resolvedTheme: "neon-dark",
      setMode: (mode) => {
        set({ mode });
        get().resolveTheme();
      },
      resolveTheme: () => {
        const mode = get().mode;
        const resolvedTheme = mode === "system" ? getSystemTheme() : mode;
        applyTheme(resolvedTheme);
        set({ resolvedTheme });
      },
    }),
    {
      name: "gym-control-theme",
      partialize: (state) => ({ mode: state.mode }),
    },
  ),
);

