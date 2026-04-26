"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { WeekDay } from "@/modules/scheduling/components/timeline/types";

type SchedulingCreateCellDialogProps = {
  open: boolean;
  weekDays: WeekDay[];
  dayIndex: number;
  hour: string;
  name: string;
  description: string;
  capacity: string;
  isLoading: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCapacityChange: (value: string) => void;
  onClose: () => void;
  onSave: () => Promise<void>;
};

export function SchedulingCreateCellDialog({
  open,
  weekDays,
  dayIndex,
  hour,
  name,
  description,
  capacity,
  isLoading,
  onNameChange,
  onDescriptionChange,
  onCapacityChange,
  onClose,
  onSave,
}: SchedulingCreateCellDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear clase en celda</DialogTitle>
          <DialogDescription>
            {weekDays[dayIndex]?.key} {weekDays[dayIndex]?.day} · {hour}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-[var(--muted)]">Nombre de la clase</label>
            <input
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
              placeholder="Ej: Spinning intermedio"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-[var(--muted)]">Descripción</label>
            <input
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
              placeholder="Objetivo y nivel"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-[var(--muted)]">Capacidad</label>
            <input
              value={capacity}
              onChange={(event) => onCapacityChange(event.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
              placeholder="20"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="button" loading={isLoading} onClick={() => void onSave()}>
              Crear en este horario
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
