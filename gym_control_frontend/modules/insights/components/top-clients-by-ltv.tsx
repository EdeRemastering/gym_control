"use client";

import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { ResponsiveDataView } from "@/components/responsive-data-view";
import { InsightsGlassPanel } from "@/modules/insights/components/insights-glass-panel";
import { useTopLtvStore } from "@/modules/insights/store/use-top-ltv-store";

export function TopClientsByLTV() {
  const clients = useTopLtvStore((s) => s.clients);

  return (
    <InsightsGlassPanel className="p-4 md:p-5">
      <div className="flex items-center gap-2">
        <Crown className="h-4 w-4 text-amber-300" aria-hidden />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Valor vitalicio</p>
          <h3 className="text-lg font-semibold text-white">Top clientes por LTV</h3>
        </div>
      </div>

      <ResponsiveDataView
        className="mt-4"
        mobile={
          <div className="space-y-2">
            {clients.map((c, i) => (
              <motion.article
                key={`mobile-${c.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/90"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-white">
                    #{c.rank} {c.name}
                  </p>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-200">
                    {Math.round(c.upgradeProbability * 100)}% upgrade
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <p><span className="text-[var(--muted)]">Plan:</span> {c.plan}</p>
                  <p><span className="text-[var(--muted)]">Meses:</span> {c.tenureMonths}</p>
                  <p className="col-span-2"><span className="text-[var(--muted)]">LTV:</span> ${c.ltv.toLocaleString("es-MX")}</p>
                </div>
              </motion.article>
            ))}
          </div>
        }
        desktop={
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
                <tr>
                  <th className="pb-2 pr-2">#</th>
                  <th className="pb-2">Cliente</th>
                  <th className="pb-2">Plan</th>
                  <th className="pb-2 text-right">LTV</th>
                  <th className="pb-2 text-right">Meses</th>
                  <th className="pb-2 text-right">Upgrade</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-t border-white/5 text-white/90"
                  >
                    <td className="py-2 pr-2 text-xs text-[var(--muted)]">{c.rank}</td>
                    <td className="py-2 font-medium text-white">{c.name}</td>
                    <td className="py-2 text-xs text-cyan-200/90">{c.plan}</td>
                    <td className="py-2 text-right font-semibold">${c.ltv.toLocaleString("es-MX")}</td>
                    <td className="py-2 text-right text-xs text-[var(--muted)]">{c.tenureMonths}</td>
                    <td className="py-2 text-right text-xs text-emerald-200/90">{Math.round(c.upgradeProbability * 100)}%</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      />
    </InsightsGlassPanel>
  );
}
