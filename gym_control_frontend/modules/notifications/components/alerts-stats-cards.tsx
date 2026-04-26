"use client";

import { AlertTriangle, BellRing, CheckCircle2, MailWarning } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { AlertStats } from "@/modules/notifications/types/alerts.types";

interface AlertsStatsCardsProps {
  stats: AlertStats;
}

export function AlertsStatsCards({ stats }: AlertsStatsCardsProps) {
  const cards = [
    { label: "Total de alertas", value: stats.total, icon: BellRing, tone: "text-violet-300" },
    { label: "Urgentes", value: stats.urgent, icon: AlertTriangle, tone: "text-amber-300" },
    { label: "No leídas", value: stats.unread, icon: MailWarning, tone: "text-cyan-300" },
    { label: "Resueltas hoy", value: stats.resolvedToday, icon: CheckCircle2, tone: "text-emerald-300" },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <motion.div key={card.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
          <Card className="space-y-1.5 border-white/10 bg-white/5">
            <card.icon className={`h-4 w-4 ${card.tone}`} />
            <p className="text-xs text-[var(--muted)]">{card.label}</p>
            <p className="text-2xl font-semibold text-white">{card.value}</p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
