"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Activity } from "lucide-react";
import { Card } from "@/components/ui/card";

interface RecentActivityCardProps {
  activity: Array<{ id: string; label: string; description: string; at: string }>;
}

export function RecentActivityCard({ activity }: RecentActivityCardProps) {
  return (
    <Card className="space-y-3 border-white/10 bg-white/5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white">Actividad reciente</p>
        <Activity className="h-4 w-4 text-cyan-300" />
      </div>
      <div className="space-y-2">
        {activity.map((item) => (
          <div key={item.id} className="rounded-lg border border-white/10 bg-black/20 p-2.5">
            <p className="text-sm text-white">{item.label}</p>
            <p className="text-xs text-[var(--muted)]">{item.description}</p>
            <p className="text-[11px] text-[var(--muted)]">
              {formatDistanceToNow(new Date(item.at), { addSuffix: true, locale: es })}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
