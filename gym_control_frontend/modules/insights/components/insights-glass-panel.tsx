"use client";

import { cn } from "@/lib/utils";

export function InsightsGlassPanel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(15,23,42,0.72)_0%,rgba(8,12,28,0.88)_100%)] shadow-[0_0_0_1px_rgba(34,211,238,0.06),0_18px_48px_rgba(0,0,0,0.35)] backdrop-blur-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
