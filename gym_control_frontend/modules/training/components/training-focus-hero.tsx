import { useTrainingStore } from "@/modules/training/store/use-training-store";

export function TrainingFocusHero() {
  const trainingFocus = useTrainingStore((state) => state.trainingFocus);

  return (
    <div
      className={`p-4 ${
        trainingFocus === "nutrition"
          ? "bg-gradient-to-r from-emerald-500/25 via-teal-500/15 to-sky-500/20"
          : "bg-gradient-to-r from-indigo-500/30 via-sky-500/20 to-indigo-500/10"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            {trainingFocus === "nutrition" ? "Nutrición" : "Entrenamiento"}
          </p>
          <p className="text-lg font-semibold text-white">
            {trainingFocus === "nutrition" ? "Comidas, semana y detalle" : "Rutina, sesión y progreso"}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {trainingFocus === "nutrition"
              ? "Mismo flujo que entrenamiento: resumen Hoy/Semana, tabla por días y detalle debajo. Cambia arriba a Entrenamiento cuando quieras la rutina."
              : "Mismo flujo que nutrición: resumen Hoy/Semana, tabla por días y detalle debajo. Cambia arriba a Nutrición para planificar comidas."}
          </p>
        </div>
      </div>
    </div>
  );
}

