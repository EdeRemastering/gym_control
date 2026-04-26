"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UsersFilters } from "@/modules/users/types/users-management.types";

interface UsersFiltersProps {
  filters: UsersFilters;
  branches: string[];
  onChange: (patch: Partial<UsersFilters>) => void;
  onReset: () => void;
}

export function UsersFilters({ filters, branches, onChange, onReset }: UsersFiltersProps) {
  return (
    <div className="grid gap-2 rounded-xl border border-white/10 bg-white/5 p-3 md:grid-cols-5">
      <Select value={filters.role} onValueChange={(value) => onChange({ role: value as UsersFilters["role"] })}>
        <SelectTrigger><SelectValue placeholder="Perfil" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los perfiles</SelectItem>
          <SelectItem value="ADMIN">Administrador</SelectItem>
          <SelectItem value="TRAINER">Entrenador</SelectItem>
          <SelectItem value="CLIENT">Cliente</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filters.status} onValueChange={(value) => onChange({ status: value as UsersFilters["status"] })}>
        <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Activo</SelectItem>
          <SelectItem value="inactive">Inactivo</SelectItem>
          <SelectItem value="blocked">Bloqueado</SelectItem>
          <SelectItem value="pending">Pendiente</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filters.branch} onValueChange={(value) => onChange({ branch: value })}>
        <SelectTrigger><SelectValue placeholder="Sede" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las sedes</SelectItem>
          {branches.map((branch) => <SelectItem key={branch} value={branch}>{branch}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filters.inactivity} onValueChange={(value) => onChange({ inactivity: value as UsersFilters["inactivity"] })}>
        <SelectTrigger><SelectValue placeholder="Inactividad" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="inactive_7d">Sin actividad en 7+ dias</SelectItem>
          <SelectItem value="inactive_30d">Sin actividad en 30+ dias</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="ghost" size="sm" onClick={onReset}>Limpiar filtros</Button>
    </div>
  );
}
