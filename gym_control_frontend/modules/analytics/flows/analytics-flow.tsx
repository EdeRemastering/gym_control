"use client";

import { Card } from "@/components/ui/card";
import { usePayments, useRevenue } from "@/hooks/use-zudel-query";

export function AnalyticsFlow() {
  const revenue = useRevenue();
  const payments = usePayments();
  const total = (revenue.data ?? []).reduce((acc, item) => acc + item.value, 0);

  return (
    <Card>
      <p className="text-sm text-[var(--muted)]">Analytics Flow</p>
      <p className="mt-2 text-sm text-white">
        Ingresos agregados: ${total.toLocaleString()} con {(payments.data ?? []).length} pagos.
      </p>
    </Card>
  );
}
