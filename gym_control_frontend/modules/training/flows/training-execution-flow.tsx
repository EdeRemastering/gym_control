"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormInput } from "@/components/forms/form-controls";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useAssignRoutine,
  useCreateExercise,
  useCreateProgress,
  useCreateRoutine,
  useCreateSetLog,
} from "@/hooks/use-zudel-mutations";
import { useExercises, useRoutines } from "@/hooks/use-zudel-query";
import { useSessionStore } from "@/lib/session-store";
import { useTraining } from "@/modules/training/hooks/use-training";

const trainingExecutionSchema = z.object({
  routineName: z.string().min(3, "Nombre de rutina requerido"),
  exerciseName: z.string().min(3, "Nombre de ejercicio requerido"),
});

type TrainingExecutionForm = z.infer<typeof trainingExecutionSchema>;

export function TrainingExecutionFlow() {
  const user = useSessionStore((state) => state.user);
  const routines = useRoutines();
  const exercises = useExercises();
  const createRoutine = useCreateRoutine();
  const createExercise = useCreateExercise();
  const assignRoutine = useAssignRoutine();
  const { createWorkoutSession: createWorkout, createExerciseLog } = useTraining();
  const createSetLog = useCreateSetLog();
  const createProgress = useCreateProgress();

  const form = useForm<TrainingExecutionForm>({
    resolver: zodResolver(trainingExecutionSchema),
    mode: "onChange",
    defaultValues: {
      routineName: "Flujo E2E",
      exerciseName: "Press Militar",
    },
  });

  const onRunFlow = form.handleSubmit(async (data) => {
    if (!user?.id) return;
    const routine = await createRoutine.mutateAsync({ name: data.routineName });
    const exercise = await createExercise.mutateAsync({ name: data.exerciseName });

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
  });

  return (
    <Card>
      <p className="text-sm text-[var(--muted)]">Training Execution Flow</p>
      <form className="mt-3 grid gap-2 md:grid-cols-3" onSubmit={onRunFlow}>
        <FormField
          label="Nombre de rutina"
          htmlFor="training-execution-routine"
          error={form.formState.errors.routineName?.message}
        >
          <FormInput
            id="training-execution-routine"
            {...form.register("routineName")}
            placeholder="Ej: Fuerza tren superior"
          />
        </FormField>
        <FormField
          label="Nombre de ejercicio"
          htmlFor="training-execution-exercise"
          error={form.formState.errors.exerciseName?.message}
        >
          <FormInput
            id="training-execution-exercise"
            {...form.register("exerciseName")}
            placeholder="Ej: Press militar"
          />
        </FormField>
        <Button
          type="submit"
          size="sm"
          disabled={
            form.formState.isSubmitting ||
            createRoutine.isPending ||
            createExercise.isPending ||
            assignRoutine.isPending ||
            createWorkout.isPending ||
            createExerciseLog.isPending ||
            createSetLog.isPending ||
            createProgress.isPending
          }
          loading={
            form.formState.isSubmitting ||
            createRoutine.isPending ||
            createExercise.isPending ||
            assignRoutine.isPending ||
            createWorkout.isPending ||
            createExerciseLog.isPending ||
            createSetLog.isPending ||
            createProgress.isPending
          }
        >
          {form.formState.isSubmitting ? "Ejecutando..." : "Ejecutar flujo completo"}
        </Button>
      </form>
      <p className="mt-2 text-xs text-[var(--muted)]">
        Rutinas: {(routines.data ?? []).length} | Ejercicios: {(exercises.data ?? []).length}
      </p>
    </Card>
  );
}
