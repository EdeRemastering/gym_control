"use client";

import { Button } from "@/components/ui/button";

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  onDeactivateSelected: () => void;
  onDeleteSelected: () => void;
}

export function BulkActionBar({
  selectedCount,
  onClear,
  onDeactivateSelected,
  onDeleteSelected,
}: BulkActionBarProps) {
  if (!selectedCount) return null;

  return (
    <div className="sticky bottom-6 z-30 flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-3 backdrop-blur">
      <p className="mr-2 text-sm text-white">{selectedCount} seleccionados</p>
      <Button size="sm" variant="secondary" onClick={onDeactivateSelected}>
        Desactivar lote
      </Button>
      <Button size="sm" variant="destructive" onClick={onDeleteSelected}>
        Soft delete lote
      </Button>
      <Button size="sm" variant="ghost" onClick={onClear}>
        Limpiar
      </Button>
    </div>
  );
}
