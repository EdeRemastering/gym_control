"use client";

import { cn } from "@/lib/utils";

export function ActivityTimeline({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("relative pl-4", className)}>
      <div className="absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-cyan-400/40 via-white/15 to-transparent" aria-hidden />
      {children}
    </div>
  );
}
