"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useAssignRoutine,
  useCreateExercise,
  useCreateExerciseLog,
  useCreateProgress,
  useCreateRoutine,
  useCreateSetLog,
  useCreateWorkoutSession,
} from "@/hooks/use-gym-mutations";
import { useExercises, useRoutines } from "@/hooks/use-gym-query";
import { useSessionStore } from "@/lib/session-store";

export function TrainingExecutionFlow() {
  const user = useSessionStore((state) => state.user);
  const routines = useRoutines();
  const exercises = useExercises();
  const createRoutine = useCreateRoutine();
  const createExercise = useCreateExercise();
  const assignRoutine = useAssignRoutine();
  const createWorkout = useCreateWorkoutSession();
  const createExerciseLog = useCreateExerciseLog();
  const createSetLog = useCreateSetLog();
  const createProgress = useCreateProgress();

  const [routineName, setRoutineName] = useState("Flujo E2E");
  const [exerciseName, setExerciseName] = useState("Press Militar");

  async function onRunFlow(event: FormEvent) {
    event.preventDefault();
    if (!user?.id) return;
    const routine = await createRoutine.mutateAsync({ name: routineName });
    const exercise = await createExercise.mutateAsync({ name: exerciseName });

    await assignRoutine.mutateAsync({
      userId: user.id,
      routineId: routine.id,
      assignedBy: user.id,
      startDate: new Date().toISOString(),
    });

    const session = await createWorkout.mutateAsync({
      userId: user.id,
      routineId: routine.id,
      startedAt: new Date().toISOString(),
    });

    const exerciseLog = await createExerciseLog.mutateAsync({
      workoutSessionId: session.id,
      exerciseId: exercise.id,
      notes: "Registro en flujo completo",
    });

    await createSetLog.mutateAsync({
      exerciseLogId: exerciseLog.id,
      reps: 10,
      weight: 40,
      restTime: 90,
    });

    await createProgress.mutateAsync({
      userId: user.id,
      weight: "70",
      bodyFat: "18",
      muscle: "34",
      measuredAt: new Date().toISOString(),
    });
  }

  return (
    <Card>
      <p className="text-sm text-[var(--muted)]">Training Execution Flow</p>
      <form className="mt-3 grid gap-2 md:grid-cols-3" onSubmit={onRunFlow}>
        <input
          value={routineName}
          onChange={(event) => setRoutineName(event.target.value)}
          className="rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
          placeholder="Rutina"
        />
        <input
          value={exerciseName}
          onChange={(event) => setExerciseName(event.target.value)}
          className="rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
          placeholder="Ejercicio"
        />
        <Button
          type="submit"
          size="sm"
          loading={
            createRoutine.isPending ||
            createExercise.isPending ||
            assignRoutine.isPending ||
            createWorkout.isPending ||
            createExerciseLog.isPending ||
            createSetLog.isPending ||
            createProgress.isPending
          }
        >
          Ejecutar flujo completo
        </Button>
      </form>
      <p className="mt-2 text-xs text-[var(--muted)]">
        Rutinas: {(routines.data ?? []).length} | Ejercicios: {(exercises.data ?? []).length}
      </p>
    </Card>
  );
}
