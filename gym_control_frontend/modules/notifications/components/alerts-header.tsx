"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AlertsHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  onOpenCreate: () => void;
}

export function AlertsHeader({ search, onSearchChange, onOpenCreate }: AlertsHeaderProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(7,14,32,0.92),rgba(4,9,22,0.94))] p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-white">Centro de alertas</h2>
        <p className="text-xs text-[var(--muted)]">Gestiona seguimiento y prioriza acciones críticas en tiempo real.</p>
      </div>
      <div className="flex w-full items-center gap-2 md:w-auto">
        <Select defaultValue="neon-dark">
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue placeholder="Tema" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="neon-dark">Neon oscuro</SelectItem>
          </SelectContent>
        </Select>
        <label className="flex h-9 w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 md:w-[230px]">
          <Search className="h-4 w-4 text-[var(--muted)]" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por alerta o responsable..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[var(--muted)]"
          />
        </label>
        <Button variant="primary" size="sm" onClick={onOpenCreate}>
          Crear alerta
        </Button>
      </div>
    </div>
  );
}
