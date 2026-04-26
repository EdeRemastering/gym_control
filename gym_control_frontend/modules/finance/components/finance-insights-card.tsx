"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { FinanceInsight } from "@/modules/finance/types/finance.types";

export function FinanceInsightsCard({ items }: { items: FinanceInsight[] }) {
  return (
    <Card className="border-white/10 bg-white/5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-fuchsia-300" />
        <p className="text-sm font-semibold text-white">Insights inteligentes</p>
      </div>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-1 rounded-xl border border-white/10 bg-black/25 p-2.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-medium text-white">{item.title}</p>
              <p className="text-xs text-[var(--muted)]">{item.description}</p>
            </div>
            <Button variant="ghost" size="sm" className="shrink-0 self-start sm:self-center">
              {item.cta}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
