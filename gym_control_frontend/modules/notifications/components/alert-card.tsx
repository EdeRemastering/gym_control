"use client";

import { formatDistanceToNowStrict } from "date-fns";
import { es } from "date-fns/locale";
import { AlertCircle, AlertTriangle, CalendarClock, CheckCircle2, Info, MapPin, MoreVertical, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AlertItemView } from "@/modules/notifications/types/alerts.types";

interface AlertCardProps {
  alert: AlertItemView;
  onMarkRead: (alertId: string) => void;
}

const PRIORITY_STYLES: Record<AlertItemView["priority"], { dot: string; badge: string; label: string; icon: typeof AlertCircle }> = {
  critical: {
    dot: "bg-rose-500/20 text-rose-300 ring-rose-500/30",
    badge: "bg-rose-500/20 text-rose-300",
    label: "Crítica",
    icon: AlertCircle,
  },
  important: {
    dot: "bg-amber-500/20 text-amber-300 ring-amber-500/30",
    badge: "bg-amber-500/20 text-amber-300",
    label: "Importante",
    icon: AlertTriangle,
  },
  informative: {
    dot: "bg-blue-500/20 text-blue-300 ring-blue-500/30",
    badge: "bg-blue-500/20 text-blue-300",
    label: "Informativa",
    icon: Info,
  },
  completed: {
    dot: "bg-emerald-500/20 text-emerald-300 ring-emerald-500/30",
    badge: "bg-emerald-500/20 text-emerald-300",
    label: "Completada",
    icon: CheckCircle2,
  },
};

export function AlertCard({ alert, onMarkRead }: AlertCardProps) {
  const priority = PRIORITY_STYLES[alert.priority];
  const PriorityIcon = priority.icon;

  return (
    <article className="group flex items-center gap-3 border-b border-white/10 px-3 py-3.5 transition hover:bg-white/[0.03] last:border-b-0">
      <input
        type="checkbox"
        checked={alert.isRead}
        onChange={() => onMarkRead(alert.id)}
        className="h-4 w-4 rounded border-white/20 bg-transparent accent-cyan-400"
      />
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ring-1 ${priority.dot}`}>
        <PriorityIcon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-[18px] font-semibold leading-none text-white">{alert.title}</p>
          <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${priority.badge}`}>
            {priority.label}
          </span>
        </div>
        <p className="mt-1 truncate text-sm text-[var(--muted)]">{alert.message}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="h-3.5 w-3.5" />
            {formatDistanceToNowStrict(new Date(alert.createdAt), { addSuffix: true, locale: es })}
          </span>
          <span className="inline-flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {alert.scope === "payment" ? "Cliente" : alert.scope === "attendance" ? "Asistencia" : alert.scope}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {alert.branch}
          </span>
          <span className="inline-flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {alert.owner}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Button size="sm" variant="ghost" className="border border-white/10 bg-white/5 hover:bg-white/10" onClick={() => onMarkRead(alert.id)}>
          Ver detalles
        </Button>
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </article>
  );
}
