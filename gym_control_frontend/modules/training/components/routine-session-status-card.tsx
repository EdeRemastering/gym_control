import { Card } from "@/components/ui/card";
import { useLiveWorkoutDerived } from "@/modules/training/hooks/use-live-workout-derived";

export function RoutineSessionStatusCard() {
  const { selectedRoutineId, selectedRoutineName, sessionExercises, routineIsFetching } = useLiveWorkoutDerived();

  return (
    <div className="lg:col-span-3">
      <Card className="border-[var(--border)] bg-white/[0.03] p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Rutina y sesión</p>
        <p className="mt-2 text-sm font-semibold text-white">{selectedRoutineId ? selectedRoutineName : "Ninguna rutina seleccionada"}</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          La sesión en vivo usa los ejercicios que vienen del servidor para la rutina que elijas en el Paso 2 (no es otro flujo aparte).
        </p>
        <div className="mt-3 rounded-xl border border-[var(--border)] bg-black/25 px-3 py-2 text-sm text-white">
          <span className="text-[var(--muted)]">Ejercicios listos para entrenar: </span>
          <span className="font-semibold tabular-nums">{sessionExercises.length}</span>
          {routineIsFetching ? <span className="ml-2 text-xs text-indigo-200">(cargando…)</span> : null}
        </div>
        {!selectedRoutineId ? <p className="mt-2 text-xs text-amber-200/90">Selecciona una rutina arriba para ver sus ejercicios.</p> : null}
        {selectedRoutineId && !routineIsFetching && sessionExercises.length === 0 ? (
          <p className="mt-2 text-xs text-amber-200/90">
            Esta rutina aún no tiene ejercicios enlazados en el gimnasio. Añádelos con &quot;Añadir a la rutina&quot; en el Paso 2; la
            asignación a clientes se hace desde la ficha de usuario o el flujo que use tu backend.
          </p>
        ) : null}
      </Card>
    </div>
  );
}

