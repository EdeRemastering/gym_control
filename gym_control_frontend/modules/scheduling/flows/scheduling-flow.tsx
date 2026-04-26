"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { FormInput } from "@/components/forms/form-controls";
import { FormField } from "@/components/forms/form-field";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateClass,
  useCreateSession,
  useDeleteClass,
} from "@/hooks/use-zudel-mutations";
import { useBookings, useClasses, useSchedule } from "@/hooks/use-zudel-query";
import { useSessionStore } from "@/lib/session-store";
import { useMarkAttendance, useReserveClass } from "@/modules/scheduling/hooks/use-scheduling-optimistic";

const schedulingCreateClassSchema = z.object({
  className: z.string().min(3, "Ingresa el nombre de la clase"),
  months: z.coerce.number().min(1).max(12),
  startDate: z.string().min(1, "Selecciona fecha"),
  startHour: z.string().min(1, "Selecciona hora"),
  durationMinutes: z.coerce.number().min(15, "Mínimo 15 minutos"),
});

type SchedulingCreateClassForm = z.infer<typeof schedulingCreateClassSchema>;

type SchedulingFlowProps = {
  onCreatedRecurringClass?: (firstSessionStartIso: string) => void;
};

export function SchedulingFlow({ onCreatedRecurringClass }: SchedulingFlowProps) {
  const queryClient = useQueryClient();
  const periodOptions = Array.from({ length: 12 }, (_, index) => {
    const value = String(index + 1);
    return {
      value,
      label: index === 11 ? "1 año (12 meses)" : `${value} ${index === 0 ? "mes" : "meses"}`,
    };
  });
  const weekDayOptions = [
    { id: 1, label: "Lun" },
    { id: 2, label: "Mar" },
    { id: 3, label: "Mie" },
    { id: 4, label: "Jue" },
    { id: 5, label: "Vie" },
    { id: 6, label: "Sab" },
    { id: 0, label: "Dom" },
  ];
  const user = useSessionStore((state) => state.user);
  const classes = useClasses();
  const sessions = useSchedule();
  const bookings = useBookings();
  const createClass = useCreateClass();
  const createSession = useCreateSession();
  const deleteClass = useDeleteClass();
  const reserveClass = useReserveClass();
  const markAttendance = useMarkAttendance();
  const createClassForm = useForm<SchedulingCreateClassForm>({
    resolver: zodResolver(schedulingCreateClassSchema),
    mode: "onChange",
    defaultValues: {
      className: "",
      months: 1,
      startDate: new Date().toISOString().slice(0, 10),
      startHour: "07:00",
      durationMinutes: 60,
    },
  });
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedClassToDelete, setSelectedClassToDelete] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 2]);
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const startDate = createClassForm.watch("startDate");
  const selectedStartDate = useMemo(() => {
    const parsed = new Date(`${startDate}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }, [startDate]);
  const timeOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];
    for (let minutes = 0; minutes < 24 * 60; minutes += 15) {
      const hour = Math.floor(minutes / 60)
        .toString()
        .padStart(2, "0");
      const minute = (minutes % 60).toString().padStart(2, "0");
      const value = `${hour}:${minute}`;
      options.push({ value, label: value });
    }
    return options;
  }, []);

  const firstBooking = useMemo(() => (bookings.data ?? [])[0], [bookings.data]);
  const isCreatingFlow = createClass.isPending || createSession.isPending;

  function addMonthsUtc(date: Date, monthCount: number) {
    const next = new Date(date);
    next.setUTCMonth(next.getUTCMonth() + monthCount);
    return next;
  }

  function toggleWeekday(dayId: number) {
    setSelectedWeekdays((prev) => (prev.includes(dayId) ? prev.filter((id) => id !== dayId) : [...prev, dayId]));
  }

  const onCreateClass = createClassForm.handleSubmit(async (data) => {
    if (selectedWeekdays.length === 0) {
      toast.error("Selecciona al menos un día de la semana");
      return;
    }
    const [hour, minute] = data.startHour.split(":").map(Number);
    const duration = data.durationMinutes;

    const startBase = new Date(`${data.startDate}T00:00:00.000Z`);
    if (Number.isNaN(startBase.getTime())) {
      toast.error("Fecha de inicio inválida");
      return;
    }
    const endLimit = addMonthsUtc(startBase, data.months);

    try {
      const normalizedClassName = data.className.trim().toLocaleLowerCase();
      const existingClass = (classes.data ?? []).find(
        (klass) => klass.name.trim().toLocaleLowerCase() === normalizedClassName,
      );
      const targetClass =
        existingClass ??
        (await createClass.mutateAsync({
          name: data.className.trim(),
          capacity: 20,
          description: `Clase recurrente ${selectedWeekdays.length} dias/semana por ${data.months} mes(es)`,
        }));

      const recurringDates: Date[] = [];
      for (let cursor = new Date(startBase); cursor < endLimit; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
        if (!selectedWeekdays.includes(cursor.getUTCDay())) continue;
        const startAt = new Date(cursor);
        startAt.setUTCHours(hour ?? 0, minute ?? 0, 0, 0);
        recurringDates.push(startAt);
      }

      if (recurringDates.length === 0) {
        toast.error("No se generaron fechas con la configuración actual");
        return;
      }

      const creationResults = await Promise.allSettled(
        recurringDates.map((startAt) => {
          const endAt = new Date(startAt.getTime() + duration * 60_000);
          return createSession.mutateAsync({
            classId: targetClass.id,
            date: startAt.toISOString(),
            startTime: startAt.toISOString(),
            endTime: endAt.toISOString(),
          });
        }),
      );
      const successfulCount = creationResults.filter((result) => result.status === "fulfilled").length;
      const failedCount = creationResults.length - successfulCount;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["classes"] }),
        queryClient.invalidateQueries({ queryKey: ["schedule"] }),
      ]);

      if (successfulCount === 0) {
        toast.error("No se pudo crear ninguna sesión recurrente");
        return;
      }

      if (failedCount > 0) {
        toast.warning(`Se crearon ${successfulCount} sesiones, pero ${failedCount} fallaron`);
      } else {
        toast.success(`Clase agendada en ${successfulCount} sesiones`);
      }
      onCreatedRecurringClass?.(recurringDates[0].toISOString());

      createClassForm.reset({
        className: "",
        months: 1,
        startDate: new Date().toISOString().slice(0, 10),
        startHour: "07:00",
        durationMinutes: 60,
      });
    } catch {
      toast.error("No se pudo crear la clase recurrente. Verifica si el nombre de clase ya existe.");
    }
  });

  async function onReserve() {
    if (!user?.id || !selectedSession) return;
    await reserveClass.mutateAsync({
      sessionId: selectedSession,
      userId: user.id,
      tempBookingId: `temp-booking-${Date.now()}`,
    });
  }

  async function onRequestDeleteClass() {
    if (!selectedClassToDelete) {
      toast.error("Selecciona una clase para eliminar");
      return;
    }
    setIsDeleteDialogOpen(true);
  }

  async function onConfirmDeleteClass() {
    const selectedClass = (classes.data ?? []).find((klass) => klass.id === selectedClassToDelete);
    if (!selectedClass) {
      toast.error("Clase no encontrada");
      return;
    }

    await deleteClass.mutateAsync({ classId: selectedClassToDelete });
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["classes"] }),
      queryClient.invalidateQueries({ queryKey: ["schedule"] }),
    ]);
    setSelectedClassToDelete("");
    setIsDeleteDialogOpen(false);
    toast.success("Clase eliminada");
  }

  return (
    <div className="space-y-3">
      <form className="space-y-2" onSubmit={onCreateClass}>
        <FormField
          label="Nombre de clase"
          htmlFor="scheduling-class-name"
          error={createClassForm.formState.errors.className?.message}
        >
          <FormInput
            id="scheduling-class-name"
            {...createClassForm.register("className")}
            placeholder="Ej: Crossfit AM"
          />
        </FormField>
        <div className="space-y-1">
          <label className="text-xs text-[var(--muted)]">Días recurrentes</label>
          <div className="flex flex-wrap gap-1.5">
            {weekDayOptions.map((day) => {
              const selected = selectedWeekdays.includes(day.id);
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => toggleWeekday(day.id)}
                  className={`rounded-full border px-2 py-1 text-xs transition ${
                    selected ? "border-[var(--primary)] bg-[var(--primary)]/20 text-white" : "border-[var(--border)] text-[var(--muted)]"
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <label className="text-xs text-[var(--muted)]">Desde</label>
            <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-9 w-full justify-between px-3 text-xs font-normal"
                >
                  {selectedStartDate ? format(selectedStartDate, "PPP", { locale: es }) : "Selecciona fecha"}
                  <CalendarDays className="h-4 w-4 text-[var(--muted)]" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-2">
                <Calendar
                  mode="single"
                  selected={selectedStartDate}
                  onSelect={(nextDate) => {
                    if (!nextDate) return;
                    createClassForm.setValue("startDate", format(nextDate, "yyyy-MM-dd"), {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setIsStartDateOpen(false);
                  }}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const maxDate = new Date(today);
                    maxDate.setDate(today.getDate() + 90);
                    return date < today || date > maxDate;
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-[var(--muted)]">Hora</label>
            <Controller
              control={createClassForm.control}
              name="startHour"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Selecciona hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-[var(--muted)]">Duración (min)</label>
            <FormInput
              type="number"
              min={15}
              step={15}
              {...createClassForm.register("durationMinutes", { valueAsNumber: true })}
              className="p-2 text-xs"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[var(--muted)]">Periodo</label>
          <Controller
            control={createClassForm.control}
            name="months"
            render={({ field }) => (
              <Select value={String(field.value)} onValueChange={(value) => field.onChange(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona periodo" />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <Button
          type="submit"
          size="sm"
          className="w-full"
          loading={isCreatingFlow || createClassForm.formState.isSubmitting}
          disabled={isCreatingFlow || createClassForm.formState.isSubmitting}
        >
          {isCreatingFlow || createClassForm.formState.isSubmitting ? "Creando..." : "Crear clase recurrente"}
        </Button>
      </form>

      <Button size="sm" variant="secondary" className="w-full" onClick={onReserve} loading={reserveClass.isPending}>
        Reservar clase
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="w-full"
        onClick={() =>
          firstBooking &&
          markAttendance.mutate({
            bookingId: firstBooking.id,
          })
        }
        loading={markAttendance.isPending}
      >
        Marcar asistencia
      </Button>

      <div className="space-y-1">
        <label className="text-xs text-[var(--muted)]">Eliminar clase</label>
        <Select
          value={selectedClassToDelete || "__none__"}
          onValueChange={(value) => setSelectedClassToDelete(value === "__none__" ? "" : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona clase" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Selecciona clase</SelectItem>
            {(classes.data ?? []).map((klass) => (
              <SelectItem key={klass.id} value={klass.id}>
                {klass.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="destructive"
          className="w-full"
          onClick={onRequestDeleteClass}
          loading={deleteClass.isPending}
        >
          Eliminar clase
        </Button>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-[var(--muted)]">Selecciona sesión</label>
        <Select
          value={selectedSession || "__none__"}
          onValueChange={(value) => setSelectedSession(value === "__none__" ? "" : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona sesión" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Selecciona sesión</SelectItem>
            {(sessions.data ?? []).map((session) => (
              <SelectItem key={session.id} value={session.id}>
                {session.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-[var(--muted)]">
        Clases: {(classes.data ?? []).length} | Bookings: {(bookings.data ?? []).length}
      </p>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar clase?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la clase y su programación asociada. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteClass.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void onConfirmDeleteClass();
              }}
              className="bg-[var(--danger)] text-[var(--on-danger)] hover:bg-[color-mix(in_srgb,var(--danger)_85%,black_15%)]"
            >
              {deleteClass.isPending ? "Eliminando..." : "Sí, eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
