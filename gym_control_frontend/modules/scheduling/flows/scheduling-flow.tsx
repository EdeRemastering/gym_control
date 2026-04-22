"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateBooking,
  useCreateClass,
  useUpdateBooking,
} from "@/hooks/use-gym-mutations";
import { useBookings, useClasses, useSchedule } from "@/hooks/use-gym-query";
import { useSessionStore } from "@/lib/session-store";

export function SchedulingFlow() {
  const user = useSessionStore((state) => state.user);
  const classes = useClasses();
  const sessions = useSchedule();
  const bookings = useBookings();
  const createClass = useCreateClass();
  const createBooking = useCreateBooking();
  const updateBooking = useUpdateBooking();
  const [className, setClassName] = useState("Flow Class");
  const [selectedSession, setSelectedSession] = useState("");

  const firstBooking = useMemo(() => (bookings.data ?? [])[0], [bookings.data]);

  async function onCreateClass(event: FormEvent) {
    event.preventDefault();
    await createClass.mutateAsync({
      name: className,
      capacity: 20,
      description: "Clase creada en flujo",
    });
    setClassName("");
  }

  async function onReserve() {
    if (!user?.id || !selectedSession) return;
    await createBooking.mutateAsync({ sessionId: selectedSession, userId: user.id });
  }

  return (
    <Card>
      <p className="text-sm text-[var(--muted)]">Scheduling Flow</p>
      <form className="mt-3 grid gap-2 md:grid-cols-3" onSubmit={onCreateClass}>
        <input
          value={className}
          onChange={(event) => setClassName(event.target.value)}
          className="rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
          placeholder="Nueva clase"
        />
        <Button type="submit" size="sm" loading={createClass.isPending}>
          Crear clase
        </Button>
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
      </form>
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="secondary" onClick={onReserve} loading={createBooking.isPending}>
          Reservar clase
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() =>
            firstBooking &&
            updateBooking.mutate({
              bookingId: firstBooking.id,
              status: "ATTENDED",
            })
          }
          loading={updateBooking.isPending}
        >
          Marcar asistencia
        </Button>
      </div>
      <p className="mt-2 text-xs text-[var(--muted)]">
        Clases: {(classes.data ?? []).length} | Bookings: {(bookings.data ?? []).length}
      </p>
    </Card>
  );
}
