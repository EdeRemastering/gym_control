import type { RoutineExercise } from "@/lib/types";
import type { ExerciseContext } from "@/modules/training/types/training-module.types";

export const WEEK_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"] as const;

export function getCurrentWeekDay(now: Date = new Date()): (typeof WEEK_DAYS)[number] {
  const jsDay = now.getDay();
  const weekIndex = jsDay === 0 ? 6 : jsDay - 1;
  return WEEK_DAYS[weekIndex];
}

export const MEAL_TYPES = [
  { value: "BREAKFAST", label: "Desayuno" },
  { value: "LUNCH", label: "Almuerzo" },
  { value: "DINNER", label: "Cena" },
  { value: "SNACK", label: "Snack" },
  { value: "PRE_WORKOUT", label: "Pre entreno" },
  { value: "POST_WORKOUT", label: "Post entreno" },
] as const;

export function getExerciseContext(
  exerciseName: string,
  reps: number,
  weight: number,
  index: number,
): ExerciseContext {
  const name = exerciseName.toLowerCase();
  const includes = (value: string) => name.includes(value);
  const isCardio = includes("burpee") || includes("jump") || includes("cardio") || includes("correr");
  const isCore = includes("plancha") || includes("abdominal") || includes("crunch") || includes("core");
  const isLeg = includes("sentadilla") || includes("zancada") || includes("squat") || includes("pierna");
  const isPush = includes("press") || includes("flexion") || includes("push");

  const muscleGroup = isCore
    ? "Core y estabilizadores"
    : isLeg
      ? "Piernas y glúteos"
      : isPush
        ? "Pecho y hombro"
        : "Torso completo";
  const objective =
    isCardio ? "Pérdida de grasa" : reps <= 8 ? "Fuerza" : reps <= 12 ? "Hipertrofia" : "Resistencia";
  const difficulty = weight >= 40 || reps <= 8 ? "Intermedio" : index % 4 === 0 ? "Avanzado" : "Básico";

  return {
    muscleGroup,
    objective,
    difficulty,
    howTo:
      "Alinea postura, activa abdomen, controla la bajada y ejecuta la subida sin impulso. Mantén respiración fluida durante todo el rango.",
    mistakes: [
      "Recortar el rango de movimiento",
      "Compensar con la zona lumbar o cuello",
      "Perder el ritmo respiratorio por fatiga",
    ],
    tips: [
      "Prioriza técnica limpia antes de subir carga",
      "Mantén 1 segundo de pausa en el punto más difícil",
      "Si falla la forma, reduce peso o reps en ese set",
    ],
    params: {
      sets: 4,
      reps: `${reps}`,
      suggestedWeight: weight > 0 ? `${weight} kg` : undefined,
      rest: isCardio ? "45s" : objective === "Fuerza" ? "90s" : "60s",
    },
    mediaUrl:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
    demoVideoUrl: "https://www.youtube.com/results?search_query=exercise+form+tutorial",
  };
}

/** Valores finitos para `set_log` a partir de inputs de formulario. */
export function parseRepsWeightForSetLog(
  row: { reps: string; weight: string } | undefined,
  fallback: { reps: number; weight: number },
) {
  const r = row ? Number.parseFloat(String(row.reps).replace(",", ".")) : Number.NaN;
  const w = row ? Number.parseFloat(String(row.weight).replace(",", ".")) : Number.NaN;
  return {
    reps: Math.max(0, Math.round(Number.isFinite(r) ? r : fallback.reps)),
    weight: Math.max(0, Number.isFinite(w) ? w : fallback.weight),
  };
}

export function parseRestToSeconds(rest: string): number {
  const trimmed = rest.trim();
  const m = /^(\d+)\s*s?$/i.exec(trimmed);
  if (m) return Math.max(5, Number(m[1]));
  const digits = /\d+/.exec(trimmed);
  return digits ? Math.max(5, Number(digits[0])) : 75;
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${ss.toString().padStart(2, "0")}`;
}

export function mapRoutineExerciseFromApi(item: RoutineExercise) {
  return {
    id: item.id,
    exerciseCatalogId: item.exerciseId,
    name: item.exercise?.name ?? "Ejercicio",
    description: item.exercise?.description ?? "",
    instructions: "",
    imageUrl: "",
    muscleGroup: "",
    objective: "Hipertrofia",
    difficulty: "Básico" as ExerciseContext["difficulty"],
    rest: "60s",
    commonMistakes: "",
    executionTips: "",
    demoVideoUrl: "",
    reps: item.reps,
    weight: Number(item.weight ?? 0),
  };
}
