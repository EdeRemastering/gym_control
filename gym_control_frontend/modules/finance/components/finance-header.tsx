"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FinanceFilters } from "@/modules/finance/types/finance.types";

interface FinanceHeaderProps {
  filters: FinanceFilters;
  onFiltersChange: (patch: Partial<FinanceFilters>) => void;
  onQuickAction: () => void;
}

export function FinanceHeader({ filters, onFiltersChange, onQuickAction }: FinanceHeaderProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(7,14,32,0.96),rgba(4,9,22,0.96))] p-4 shadow-lg shadow-black/40 ring-1 ring-white/5 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">Pagos y cobros</p>
        <h2 className="text-xl font-semibold text-white">Panel financiero</h2>
        <p className="mt-1 max-w-xl text-xs text-[var(--muted)]">
          Consulta ingresos, cobros pendientes y resultados por sede en una sola vista.
        </p>
      </div>
      <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
        <Select defaultValue="neon-dark">
          <SelectTrigger className="h-10 w-full sm:w-auto sm:min-w-[130px]">
            <SelectValue placeholder="Tema" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="neon-dark">Neon oscuro</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="range">
          <SelectTrigger className="h-10 w-full sm:w-auto sm:min-w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="range">22 - 28 Abr, 2026</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.branch}
          onValueChange={(v) => onFiltersChange({ branch: v as FinanceFilters["branch"] })}
        >
          <SelectTrigger className="h-10 w-full sm:w-auto sm:min-w-[150px]">
            <SelectValue placeholder="Sede" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las sedes</SelectItem>
            <SelectItem value="centro">Sede Centro</SelectItem>
            <SelectItem value="norte">Sede Norte</SelectItem>
            <SelectItem value="sur">Sede Sur</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" variant="primary" onClick={onQuickAction} className="h-10 w-full gap-1.5 sm:w-auto">
          <Plus className="h-4 w-4" />
          Registrar pago
        </Button>
      </div>
    </div>
  );
}
