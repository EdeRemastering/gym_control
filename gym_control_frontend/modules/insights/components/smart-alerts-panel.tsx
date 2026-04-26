"use client";

import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { InsightsGlassPanel } from "@/modules/insights/components/insights-glass-panel";
import { useSmartAlertsStore } from "@/modules/insights/store/use-smart-alerts-store";
import { cn } from "@/lib/utils";

const sev: Record<string, string> = {
  critical: "text-rose-200 border-rose-400/30 bg-rose-500/10",
  high: "text-amber-100 border-amber-400/25 bg-amber-500/10",
  medium: "text-sky-100 border-sky-400/25 bg-sky-500/10",
  low: "text-emerald-100/90 border-emerald-400/20 bg-emerald-500/10",
};

export function SmartAlertsPanel() {
  const rows = useSmartAlertsStore((s) => s.summaries);

  return (
    <InsightsGlassPanel className="p-4 md:p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-300" aria-hidden />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Riesgo vivo</p>
            <h3 className="text-lg font-semibold text-white">Smart alerts</h3>
          </div>
        </div>
        <Button type="button" size="sm" variant="secondary" className="border-white/10 bg-white/5" onClick={() => toast.message("Enrutado a alertas")}>
          Abrir inbox
        </Button>
      </div>
      <ul className="mt-4 space-y-2">
        {rows.map((r) => (
          <li
            key={r.id}
            className={cn(
              "flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm",
              sev[r.severity] ?? "border-white/10 bg-black/25 text-white",
            )}
          >
            <span>{r.label}</span>
            <span className="rounded-full bg-black/30 px-2 py-0.5 text-xs font-semibold">{r.count}</span>
          </li>
        ))}
      </ul>
    </InsightsGlassPanel>
  );
}
