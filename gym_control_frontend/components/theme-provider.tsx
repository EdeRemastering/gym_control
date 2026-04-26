"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/lib/theme-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const resolveTheme = useThemeStore((state) => state.resolveTheme);
  const mode = useThemeStore((state) => state.mode);

  useEffect(() => {
    resolveTheme();
  }, [resolveTheme, mode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (useThemeStore.getState().mode === "system") {
        useThemeStore.getState().resolveTheme();
      }
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return <>{children}</>;
}

