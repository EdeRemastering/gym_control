"use client";

import { useEffect, useState } from "react";
import { Droplet } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const GOAL_L = 3;
const GLASS = 0.25;

type Props = {
  selectedWeekDay: string;
};

function storageKey(day: string) {
  return `gym-control-hydration-${day}`;
}

export function HydrationTrackerCard({ selectedWeekDay }: Props) {
  const [liters, setLiters] = useState(() => {
    if (typeof window === "undefined") return 0;
    const raw = window.localStorage.getItem(storageKey(selectedWeekDay));
    const n = raw ? Number.parseFloat(raw) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = window.setTimeout(() => {
      const raw = window.localStorage.getItem(storageKey(selectedWeekDay));
      const n = raw ? Number.parseFloat(raw) : 0;
      setLiters(Number.isFinite(n) && n >= 0 ? n : 0);
    }, 0);
    return () => window.clearTimeout(t);
  }, [selectedWeekDay]);

  const persist = (next: number) => {
    setLiters(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey(selectedWeekDay), String(next));
    }
  };

  const [lastAt, setLastAt] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(`${storageKey(selectedWeekDay)}-at`);
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = window.setTimeout(() => {
      setLastAt(window.localStorage.getItem(`${storageKey(selectedWeekDay)}-at`));
    }, 0);
    return () => window.clearTimeout(t);
  }, [selectedWeekDay, liters]);

  const percent = Math.min(100, (liters / GOAL_L) * 100);
  const filled = Math.min(12, Math.floor(liters / GLASS));

  return (
    <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/40 to-[#0a0f16] p-5">
      <div
        className="pointer-events-none absolute -left-6 bottom-0 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl"
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-200/80">Hidratación</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-white">
            {liters.toFixed(1)} <span className="text-lg font-medium text-cyan-200/80">/ {GOAL_L} L</span>
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">Meta diaria aproximada</p>
        </div>
        <Droplet className="h-8 w-8 text-cyan-400/80" />
      </div>
      <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 22 }}
        />
      </div>
      <div className="relative mt-4 flex flex-wrap justify-center gap-1.5">
        {Array.from({ length: 12 }, (_, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full ${
              i < filled ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" : "bg-white/10"
            }`}
          />
        ))}
      </div>
      <div className="relative mt-4 flex items-center justify-between gap-2">
        <p className="text-[11px] text-zinc-500">
          Última registrada: {lastAt ? <span className="text-zinc-300">{lastAt}</span> : <span className="text-zinc-500">—</span>}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 border-cyan-500/30 text-xs text-cyan-100"
            onClick={() => {
              const t = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
              persist(Math.min(GOAL_L, Math.round((liters + GLASS) * 100) / 100));
              if (typeof window !== "undefined") {
                window.localStorage.setItem(`${storageKey(selectedWeekDay)}-at`, t);
              }
              setLastAt(t);
            }}
          >
            +{GLASS * 1000} ml
          </Button>
        </div>
      </div>
    </div>
  );
}
