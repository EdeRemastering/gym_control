"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALERT_SCOPE_LABEL, ALERT_STATUS_LABEL } from "@/modules/notifications/constants/alerts.constants";
import type { AlertFilters } from "@/modules/notifications/types/alerts.types";

interface AlertsFiltersProps {
  filters: AlertFilters;
  branches: string[];
  owners: string[];
  onFilterChange: (patch: Partial<AlertFilters>) => void;
  onReset: () => void;
}

export function AlertsFilters({ filters, branches, owners, onFilterChange, onReset }: AlertsFiltersProps) {
  return (
    <div className="grid gap-2 rounded-xl border border-white/10 bg-white/5 p-3 md:grid-cols-6">
      <Select value={filters.dateRange} onValueChange={(value) => onFilterChange({ dateRange: value as AlertFilters["dateRange"] })}>
        <SelectTrigger><SelectValue placeholder="Fecha" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Hoy</SelectItem>
          <SelectItem value="7d">Últimos 7 días</SelectItem>
          <SelectItem value="30d">Últimos 30 días</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filters.scope} onValueChange={(value) => onFilterChange({ scope: value as AlertFilters["scope"] })}>
        <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
        <SelectContent>{Object.entries(ALERT_SCOPE_LABEL).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={filters.branch} onValueChange={(value) => onFilterChange({ branch: value })}>
        <SelectTrigger><SelectValue placeholder="Sede" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las sedes</SelectItem>
          {branches.map((branch) => <SelectItem key={branch} value={branch}>{branch}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filters.owner} onValueChange={(value) => onFilterChange({ owner: value })}>
        <SelectTrigger><SelectValue placeholder="Responsable" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {owners.map((owner) => <SelectItem key={owner} value={owner}>{owner}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filters.status} onValueChange={(value) => onFilterChange({ status: value as AlertFilters["status"] })}>
        <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
        <SelectContent>{Object.entries(ALERT_STATUS_LABEL).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
      </Select>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" className="w-full" onClick={onReset}>
          <SlidersHorizontal className="h-4 w-4" />
          Limpiar filtros
        </Button>
      </div>
    </div>
  );
}
