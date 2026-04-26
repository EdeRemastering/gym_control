"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCard } from "@/modules/notifications/components/alert-card";
import type { AlertItemView } from "@/modules/notifications/types/alerts.types";

interface AlertsListProps {
  alerts: AlertItemView[];
  isLoading: boolean;
  onMarkRead: (alertId: string) => void;
}

export function AlertsList({ alerts, isLoading, onMarkRead }: AlertsListProps) {
  if (isLoading) {
    return <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-[var(--muted)]">Cargando alertas...</div>;
  }
  if (alerts.length === 0) {
    return <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-[var(--muted)]">No hay alertas con los filtros actuales.</div>;
  }
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(8,15,34,0.95),rgba(5,10,25,0.97))]">
      <AnimatePresence initial={false}>
        {alerts.map((alert) => (
          <motion.div key={alert.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            <AlertCard alert={alert} onMarkRead={onMarkRead} />
          </motion.div>
        ))}
      </AnimatePresence>
    </section>
  );
}
