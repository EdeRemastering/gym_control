"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ClassSession } from "@/lib/types";

type SchedulingRescheduleDialogProps = {
  open: boolean;
  session: ClassSession | null;
  startAt: string;
  endAt: string;
  isLoading: boolean;
  onStartAtChange: (value: string) => void;
  onEndAtChange: (value: string) => void;
  onClose: () => void;
  onSave: () => Promise<void>;
};

function parseDateTimeLocal(value: string) {
  if (!value) return { date: "", time: "00:00" };
  const [date, time = "00:00"] = value.split("T");
  return { date, time: time.slice(0, 5) };
}

function buildTimeOptions() {
  const options: string[] = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += 15) {
    const hour = Math.floor(minutes / 60)
      .toString()
      .padStart(2, "0");
    const minute = (minutes % 60).toString().padStart(2, "0");
    options.push(`${hour}:${minute}`);
  }
  return options;
}

export function SchedulingRescheduleDialog({
  open,
  session,
  startAt,
  endAt,
  isLoading,
  onStartAtChange,
  onEndAtChange,
  onClose,
  onSave,
}: SchedulingRescheduleDialogProps) {
  const startParts = useMemo(() => parseDateTimeLocal(startAt), [startAt]);
  const endParts = useMemo(() => parseDateTimeLocal(endAt), [endAt]);
  const startDate = useMemo(() => {
    if (!startParts.date) return undefined;
    const parsed = new Date(`${startParts.date}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }, [startParts.date]);
  const endDate = useMemo(() => {
    if (!endParts.date) return undefined;
    const parsed = new Date(`${endParts.date}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }, [endParts.date]);
  const timeOptions = useMemo(() => buildTimeOptions(), []);

  function updateStart(next: Partial<{ date: string; time: string }>) {
    const mergedDate = next.date ?? startParts.date;
    const mergedTime = next.time ?? startParts.time;
    if (!mergedDate) return;
    onStartAtChange(`${mergedDate}T${mergedTime}`);
  }

  function updateEnd(next: Partial<{ date: string; time: string }>) {
    const mergedDate = next.date ?? endParts.date;
    const mergedTime = next.time ?? endParts.time;
    if (!mergedDate) return;
    onEndAtChange(`${mergedDate}T${mergedTime}`);
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reprogramar sesión</DialogTitle>
          <DialogDescription>Ajusta inicio y fin para {session?.title ?? "la clase seleccionada"}.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-[var(--muted)]">Inicio</label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="secondary" className="justify-between px-3 text-xs font-normal">
                    {startDate ? format(startDate, "PPP", { locale: es }) : "Fecha inicio"}
                    <CalendarDays className="h-4 w-4 text-[var(--muted)]" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-2">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      if (!date) return;
                      updateStart({ date: format(date, "yyyy-MM-dd") });
                    }}
                  />
                </PopoverContent>
              </Popover>
              <Select value={startParts.time} onValueChange={(value) => updateStart({ time: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Hora inicio" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-[var(--muted)]">Fin</label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="secondary" className="justify-between px-3 text-xs font-normal">
                    {endDate ? format(endDate, "PPP", { locale: es }) : "Fecha fin"}
                    <CalendarDays className="h-4 w-4 text-[var(--muted)]" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-2">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      if (!date) return;
                      updateEnd({ date: format(date, "yyyy-MM-dd") });
                    }}
                  />
                </PopoverContent>
              </Popover>
              <Select value={endParts.time} onValueChange={(value) => updateEnd({ time: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Hora fin" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="button" loading={isLoading} onClick={() => void onSave()}>
              Guardar cambios
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
