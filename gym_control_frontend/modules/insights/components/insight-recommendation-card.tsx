"use client";

import { motion } from "framer-motion";
import { CreditCard, MapPin, Sparkles, TrendingDown, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AiInsightIconKey, AiInsightItem } from "@/modules/insights/types/insights.types";
import { cn } from "@/lib/utils";

const icons: Record<AiInsightIconKey, typeof Sparkles> = {
  trendingDown: TrendingDown,
  creditCard: CreditCard,
  sparkles: Sparkles,
  mapPin: MapPin,
  userX: UserX,
};

const toneBar: Record<AiInsightItem["tone"], string> = {
  danger: "from-rose-500 to-orange-500",
  info: "from-sky-500 to-cyan-400",
  success: "from-emerald-400 to-teal-400",
  warning: "from-amber-400 to-orange-400",
  violet: "from-violet-500 to-fuchsia-500",
};

const priorityLabel: Record<AiInsightItem["priority"], string> = {
  critical: "Crítico",
  high: "Alto",
  medium: "Medio",
  low: "Bajo",
};

export function InsightRecommendationCard({
  item,
  index,
  onAction,
}: {
  item: AiInsightItem;
  index: number;
  onAction: (item: AiInsightItem) => void;
}) {
  const Icon = icons[item.iconKey];
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className="relative overflow-hidden rounded-xl border border-white/10 bg-black/30 p-3"
    >
      <div className={cn("absolute inset-y-0 left-0 w-1 bg-gradient-to-b", toneBar[item.tone])} />
      <div className="pl-3">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
            <Icon className="h-4 w-4 text-white/90" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">
                {priorityLabel[item.priority]}
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{item.description}</p>
            <Button type="button" variant="secondary" size="sm" className="mt-2 border-white/10 bg-white/5" onClick={() => onAction(item)}>
              {item.ctaLabel}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
