"use client";

import { motion } from "framer-motion";
import { ALERT_PRIORITY_LABEL } from "@/modules/notifications/constants/alerts.constants";
import type { AlertFilters, AlertStats } from "@/modules/notifications/types/alerts.types";

interface AlertsTabsProps {
  activeTab: AlertFilters["priority"];
  stats: AlertStats;
  onChange: (tab: AlertFilters["priority"]) => void;
}

const TAB_ORDER: AlertFilters["priority"][] = ["all", "critical", "important", "informative", "completed"];

export function AlertsTabs({ activeTab, stats, onChange }: AlertsTabsProps) {
  const counters: Record<AlertFilters["priority"], number> = {
    all: stats.total,
    critical: stats.urgent,
    important: stats.urgent,
    informative: stats.total - stats.urgent,
    completed: stats.resolvedToday,
  };

  return (
    <div className="flex flex-wrap gap-1.5 rounded-xl border border-white/10 bg-white/5 p-1">
      {TAB_ORDER.map((tab) => {
        const active = tab === activeTab;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={`relative rounded-lg px-3 py-1.5 text-sm transition ${active ? "text-white" : "text-[var(--muted)] hover:text-white"}`}
          >
            {active ? <motion.span layoutId="alerts-tab" className="absolute inset-0 rounded-lg bg-cyan-500/20" /> : null}
            <span className="relative z-10">
              {ALERT_PRIORITY_LABEL[tab]} <span className="text-xs opacity-80">{counters[tab]}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
