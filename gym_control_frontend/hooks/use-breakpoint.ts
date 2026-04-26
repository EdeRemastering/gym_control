"use client";

import { useEffect, useMemo, useState } from "react";

type BreakpointKey = "sm" | "md" | "lg" | "xl" | "2xl";

const BREAKPOINTS: Record<BreakpointKey, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

function getWidth() {
  if (typeof window === "undefined") return 0;
  return window.innerWidth;
}

export function useBreakpoint() {
  const [width, setWidth] = useState<number>(getWidth);

  useEffect(() => {
    const onResize = () => setWidth(getWidth());
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return useMemo(
    () => ({
      width,
      isMobile: width < BREAKPOINTS.md,
      isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
      isDesktop: width >= BREAKPOINTS.lg,
      atLeast: (bp: BreakpointKey) => width >= BREAKPOINTS[bp],
    }),
    [width],
  );
}

