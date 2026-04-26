"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import type { AuditItem } from "@/modules/users/types/users-management.types";

export function ActivityTimeline({ items }: { items: AuditItem[] }) {
  return (
    <Card className="space-y-2.5 border-white/10 bg-white/5">
      <p className="text-sm font-semibold text-white">Actividad reciente</p>
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border border-white/10 bg-black/20 p-2">
          <p className="text-sm text-white">{item.action}</p>
          <p className="text-xs text-[var(--muted)]">{item.actor} · {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true, locale: es })}</p>
        </div>
      ))}
    </Card>
  );
}
