"use client";

import {
  AlertTriangle,
  CreditCard,
  Download,
  FileSpreadsheet,
  Package,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface QuickActionsFinanceProps {
  onRegisterPayment: () => void;
  onCreatePlan: () => void;
  onReviewFailed: () => void;
}

export function QuickActionsFinance({ onRegisterPayment, onCreatePlan, onReviewFailed }: QuickActionsFinanceProps) {
  const actions = [
    { label: "Registrar pago", icon: CreditCard, onClick: onRegisterPayment },
    { label: "Crear plan", icon: Package, onClick: onCreatePlan },
    { label: "Aprobar reembolso", icon: RefreshCw, onClick: onReviewFailed },
    { label: "Generar reporte", icon: FileSpreadsheet, onClick: onReviewFailed },
    { label: "Exportar finanzas", icon: Download, onClick: onReviewFailed },
    { label: "Revisar fallidos", icon: AlertTriangle, onClick: onReviewFailed },
  ];
  return (
    <Card className="border-white/10 bg-white/5">
      <p className="text-sm font-semibold text-white">Acciones rápidas</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={a.onClick}
            className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-black/25 p-3 text-center text-xs text-white transition hover:border-cyan-400/30 hover:bg-white/10"
          >
            <a.icon className="h-5 w-5 text-cyan-300" />
            {a.label}
          </button>
        ))}
      </div>
    </Card>
  );
}
