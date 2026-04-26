"use client";

import { ChangeEvent, FormEvent, useEffect, useId, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flame,
  Info,
  Lightbulb,
  Pause,
  Play,
  PlayCircle,
  Plus,
  SkipForward,
  Target,
  Timer,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useAddRoutineExercise,
  useCreateCheckin,
  useCreateExercise,
  useCreateRoutine,
  useCreateWorkoutSession,
} from "@/hooks/use-gym-mutations";
import {
  useExercises,
  useNutritionMeals,
  useNutritionPlans,
  useRoutineExercises,
  useRoutines,
} from "@/hooks/use-gym-query";
import type { ModuleShellProps } from "@/lib/module-shell-props";
import { useSessionStore } from "@/lib/session-store";
import type { RoutineExercise } from "@/lib/types";
import { EntityActionMenu } from "@/modules/action-system/components/entity-action-menu";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ExerciseContext {
  muscleGroup: string;
  objective: string;
  difficulty: "Básico" | "Intermedio" | "Avanzado";
  howTo: string;
  mistakes: string[];
  tips: string[];
  params: {
    sets: number;
    reps: string;
    suggestedWeight?: string;
    rest: string;
  };
  mediaUrl?: string;
  demoVideoUrl?: string;
}

const WEEK_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const MEAL_TYPES = [
  { value: "BREAKFAST", label: "Desayuno" },
  { value: "LUNCH", label: "Almuerzo" },
  { value: "DINNER", label: "Cena" },
  { value: "SNACK", label: "Snack" },
  { value: "PRE_WORKOUT", label: "Pre entreno" },
  { value: "POST_WORKOUT", label: "Post entreno" },
];

function getExerciseContext(
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
  const objective = isCardio
    ? "Pérdida de grasa"
    : reps <= 8
      ? "Fuerza"
      : reps <= 12
        ? "Hipertrofia"
        : "Resistencia";
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

function parseRestToSeconds(rest: string): number {
  const trimmed = rest.trim();
  const m = /^(\d+)\s*s?$/i.exec(trimmed);
  if (m) return Math.max(5, Number(m[1]));
  const digits = /\d+/.exec(trimmed);
  return digits ? Math.max(5, Number(digits[0])) : 75;
}

/** Reloj m:ss (ej. 3:13) para sesión o descanso */
function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${ss.toString().padStart(2, "0")}`;
}

function mapRoutineExerciseFromApi(item: RoutineExercise) {
  return {
    id: item.id,
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

export function TrainingModule({ role }: ModuleShellProps) {
  const restRingGradientId = useId().replace(/:/g, "");
  const exercises = useExercises();
  const routines = useRoutines();
  const createRoutine = useCreateRoutine();
  const createExercise = useCreateExercise();
  const addRoutineExercise = useAddRoutineExercise();
  const createWorkoutSession = useCreateWorkoutSession();
  const createCheckin = useCreateCheckin();
  const currentUser = useSessionStore((state) => state.user);
  const [routineForm, setRoutineForm] = useState({ name: "", description: "" });
  const [selectedRoutineId, setSelectedRoutineId] = useState("");
  const [sessionClosed, setSessionClosed] = useState(false);
  const [isWorkoutMode, setIsWorkoutMode] = useState(false);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [restSeconds, setRestSeconds] = useState(75);
  const [restInitialTotal, setRestInitialTotal] = useState(90);
  const [isRestRunning, setIsRestRunning] = useState(false);
  const [isRestPaused, setIsRestPaused] = useState(false);
  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState(0);
  const [quickSet, setQuickSet] = useState({ reps: "10", weight: "40" });
  const [completedSetsByExerciseId, setCompletedSetsByExerciseId] = useState<Record<string, number>>({});
  const [setRowDrafts, setSetRowDrafts] = useState<{ reps: string; weight: string }[]>([]);
  const [trainingTab, setTrainingTab] = useState<"session" | "nutrition">("session");
  const [trainingFocus, setTrainingFocus] = useState<"training" | "nutrition">("training");
  const [planningScope, setPlanningScope] = useState<"day" | "week">("day");
  const [selectedWeekDay, setSelectedWeekDay] = useState("Lunes");
  const [selectedRoutineBuilderDay, setSelectedRoutineBuilderDay] = useState("Lunes");
  const [isRoutineAccordionOpen, setIsRoutineAccordionOpen] = useState(false);
  const [selectedNutritionBuilderDay, setSelectedNutritionBuilderDay] = useState("Lunes");
  const [isNutritionAccordionOpen, setIsNutritionAccordionOpen] = useState(false);
  const [selectedMealTypeToCreate, setSelectedMealTypeToCreate] = useState("BREAKFAST");
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [nutritionMeals, setNutritionMeals] = useState([
    {
      id: "breakfast",
      label: "Desayuno",
      consumed: false,
      foods: ["Avena 60g", "Yogur griego", "Frutos rojos"],
      macros: { protein: 32, carbs: 58, fats: 14 },
    },
    {
      id: "lunch",
      label: "Almuerzo",
      consumed: false,
      foods: ["Pollo 180g", "Arroz 120g", "Verduras salteadas"],
      macros: { protein: 45, carbs: 70, fats: 18 },
    },
    {
      id: "dinner",
      label: "Cena",
      consumed: false,
      foods: ["Salmón 160g", "Puré de papa", "Espárragos"],
      macros: { protein: 40, carbs: 44, fats: 20 },
    },
    {
      id: "snacks",
      label: "Snacks",
      consumed: false,
      foods: ["Batido whey", "Banano", "Nueces"],
      macros: { protein: 28, carbs: 34, fats: 16 },
    },
  ]);
  const [quickFoodByMeal, setQuickFoodByMeal] = useState<Record<string, string>>({});
  const [exerciseForm, setExerciseForm] = useState({
    name: "",
    description: "",
    instructions: "",
    imageUrl: "",
    muscleGroup: "",
    objective: "Hipertrofia",
    difficulty: "Básico" as ExerciseContext["difficulty"],
    rest: "60s",
    commonMistakes: "",
    executionTips: "",
    demoVideoUrl: "",
    reps: "12",
    weight: "20",
  });
  const [editingRoutineExerciseId, setEditingRoutineExerciseId] = useState<string | null>(null);
  const [isExerciseFormOpen, setIsExerciseFormOpen] = useState(false);
  const [routineExercisesByRoutineId, setRoutineExercisesByRoutineId] = useState<
    Record<
      string,
      Array<{
        id: string;
        name: string;
        description: string;
        instructions: string;
        imageUrl: string;
        muscleGroup: string;
        objective: string;
        difficulty: ExerciseContext["difficulty"];
        rest: string;
        commonMistakes: string;
        executionTips: string;
        demoVideoUrl: string;
        reps: number;
        weight: number;
      }>
    >
  >({});
  const [selectedRoutineExerciseDetailId, setSelectedRoutineExerciseDetailId] = useState<string | null>(null);
  const [draggedExerciseMeta, setDraggedExerciseMeta] = useState<{
    source: "catalog" | "day";
    day?: string;
    id: string;
    name: string;
  } | null>(null);
  const [weeklyRoutineByDay, setWeeklyRoutineByDay] = useState<
    Record<string, Array<{ id: string; name: string; reps: number; weight: number }>>
  >({});
  const [draggedFoodName, setDraggedFoodName] = useState<string | null>(null);
  const [weeklyNutritionByDay, setWeeklyNutritionByDay] = useState<
    Record<string, Array<{ id: string; mealType: string; foods: string[] }>>
  >({});
  const [nutritionFoodCatalog] = useState<string[]>([
    "Avena 60g",
    "Yogur griego",
    "Pollo 180g",
    "Arroz 120g",
    "Salmón 160g",
    "Frutos rojos",
    "Banano",
    "Nueces",
  ]);
  const routineExercises = useRoutineExercises(selectedRoutineId || undefined);
  const nutritionPlans = useNutritionPlans();
  const activeNutritionPlanId = nutritionPlans.data?.[0]?.id;
  const nutritionMealsQuery = useNutritionMeals(activeNutritionPlanId);
  const hasRoutines = (routines.data ?? []).length > 0;
  const selectedRoutineExercises = useMemo(
    () => (selectedRoutineId ? (routineExercisesByRoutineId[selectedRoutineId] ?? []) : []),
    [selectedRoutineId, routineExercisesByRoutineId],
  );
  const selectedRoutineExerciseDetail = selectedRoutineExercises.find(
    (item) => item.id === selectedRoutineExerciseDetailId,
  );
  const persistedRoutineExercises = useMemo(
    () =>
      (routineExercises.data ?? []).map((item) => {
        const row = mapRoutineExerciseFromApi(item);
        return { id: row.id, name: row.name, reps: row.reps, weight: row.weight };
      }),
    [routineExercises.data],
  );
  /** Prioriza ejercicios del servidor (rutina asignada en el gimnasio); si aún no hay filas en API, usa el borrador local. */
  const routineExercisesForPlanning = useMemo(() => {
    const local = selectedRoutineExercises.map((item) => ({
      id: item.id,
      name: item.name,
      reps: item.reps,
      weight: item.weight,
    }));
    if (persistedRoutineExercises.length > 0) return persistedRoutineExercises;
    return local;
  }, [persistedRoutineExercises, selectedRoutineExercises]);
  const sessionExercises = useMemo(
    () =>
      routineExercisesForPlanning.map((exercise) => ({
        id: exercise.id,
        exercise: exercise.name,
        reps: exercise.reps,
        weight: exercise.weight,
      })),
    [routineExercisesForPlanning],
  );
  const canStartSession = Boolean(selectedRoutineId) && sessionExercises.length > 0;

  useEffect(() => {
    if (!selectedRoutineId) return;
    if (routineExercises.isFetching && routineExercises.data === undefined) return;
    const rows = routineExercises.data;
    if (rows === undefined) {
      setRoutineExercisesByRoutineId((p) => ({ ...p, [selectedRoutineId]: [] }));
      return;
    }
    setRoutineExercisesByRoutineId((prev) => ({
      ...prev,
      [selectedRoutineId]: rows.map(mapRoutineExerciseFromApi),
    }));
  }, [selectedRoutineId, routineExercises.data, routineExercises.isFetching]);

  useEffect(() => {
    setActiveExerciseIndex(0);
  }, [selectedRoutineId]);

  useEffect(() => {
    if (!sessionExercises.length) {
      setActiveExerciseIndex(0);
      return;
    }
    setActiveExerciseIndex((i) => Math.min(Math.max(0, i), sessionExercises.length - 1));
  }, [sessionExercises]);

  const activeExercise = sessionExercises[activeExerciseIndex] ?? null;
  const exerciseContextById = useMemo<Record<string, ExerciseContext>>(
    () =>
      Object.fromEntries(
        sessionExercises.map((exercise, index) => [
          exercise.id,
          {
            ...getExerciseContext(exercise.exercise, exercise.reps, exercise.weight, index),
          },
        ]),
      ),
    [sessionExercises],
  );
  const done = sessionExercises.filter((exercise) => {
    const ctx = exerciseContextById[exercise.id];
    const target = ctx?.params.sets ?? 4;
    return (completedSetsByExerciseId[exercise.id] ?? 0) >= target;
  }).length;
  const sessionProgress = sessionExercises.length ? Math.round((done / sessionExercises.length) * 100) : 0;
  const totalTargetSets = sessionExercises.reduce(
    (acc, ex) => acc + (exerciseContextById[ex.id]?.params.sets ?? 4),
    0,
  );
  const totalCompletedSets = sessionExercises.reduce((acc, ex) => {
    const target = exerciseContextById[ex.id]?.params.sets ?? 4;
    return acc + Math.min(completedSetsByExerciseId[ex.id] ?? 0, target);
  }, 0);
  const seriesProgressPercent =
    totalTargetSets > 0 ? Math.min(100, Math.round((totalCompletedSets / totalTargetSets) * 100)) : 0;
  const selectedRoutineName = useMemo(
    () => (routines.data ?? []).find((r) => r.id === selectedRoutineId)?.name ?? "Tu rutina",
    [routines.data, selectedRoutineId],
  );
  const nextExerciseInSession = sessionExercises[activeExerciseIndex + 1] ?? null;
  const selectedExercise = sessionExercises.find((exercise) => exercise.id === selectedExerciseId) ?? null;
  const selectedExerciseContext = selectedExercise ? exerciseContextById[selectedExercise.id] : null;
  const effectiveNutritionMeals = useMemo(() => {
    if (!(nutritionMealsQuery.data ?? []).length) return nutritionMeals;
    const typeToLabel: Record<string, string> = {
      BREAKFAST: "Desayuno",
      LUNCH: "Almuerzo",
      DINNER: "Cena",
      SNACK: "Snacks",
      PRE_WORKOUT: "Pre entreno",
      POST_WORKOUT: "Post entreno",
      MIDNIGHT: "Media noche",
    };
    return (nutritionMealsQuery.data ?? []).map((meal) => ({
      id: meal.id,
      label: typeToLabel[meal.mealType] ?? meal.mealType,
      consumed: false,
      foods: [meal.description],
      macros: { protein: 0, carbs: 0, fats: 0 },
    }));
  }, [nutritionMeals, nutritionMealsQuery.data]);
  const weeklyRoutinePlan = useMemo(
    () =>
      WEEK_DAYS.map((day, index) => ({
        day,
        exercises:
          (weeklyRoutineByDay[day] ?? []).length > 0
            ? (weeklyRoutineByDay[day] ?? [])
            : routineExercisesForPlanning.filter((_, exerciseIndex) =>
                routineExercisesForPlanning.length ? exerciseIndex % 7 === index % 7 || index < 3 : false,
              ),
      })),
    [routineExercisesForPlanning, weeklyRoutineByDay],
  );
  const weeklyNutritionPlan = useMemo(
    () =>
      WEEK_DAYS.map((day, index) => ({
        day,
        meals:
          (weeklyNutritionByDay[day] ?? []).length > 0
            ? (weeklyNutritionByDay[day] ?? []).map((mealBlock) => ({
                id: mealBlock.id,
                label: MEAL_TYPES.find((item) => item.value === mealBlock.mealType)?.label ?? mealBlock.mealType,
                consumed: false,
                foods: mealBlock.foods.length ? mealBlock.foods : ["Sin alimentos añadidos"],
                macros: { protein: 0, carbs: 0, fats: 0 },
              }))
            : effectiveNutritionMeals.map((meal) => ({
                ...meal,
                consumed: meal.consumed && index === 0,
              })),
      })),
    [effectiveNutritionMeals, weeklyNutritionByDay],
  );
  const selectedWeekRoutine = weeklyRoutinePlan.find((item) => item.day === selectedWeekDay);
  const selectedWeekNutrition = weeklyNutritionPlan.find((item) => item.day === selectedWeekDay);
  const selectedBuilderDayExercises = weeklyRoutineByDay[selectedRoutineBuilderDay] ?? [];
  const selectedBuilderDayMeals = weeklyNutritionByDay[selectedNutritionBuilderDay] ?? [];
  const focusExercise = sessionExercises[activeExerciseIndex] ?? null;
  const focusExerciseContext = focusExercise ? exerciseContextById[focusExercise.id] : null;

  const nutritionTotals = useMemo(() => {
    const consumedMeals = effectiveNutritionMeals.filter((meal) => meal.consumed);
    const consumed = consumedMeals.reduce(
      (acc, meal) => ({
        protein: acc.protein + meal.macros.protein,
        carbs: acc.carbs + meal.macros.carbs,
        fats: acc.fats + meal.macros.fats,
      }),
      { protein: 0, carbs: 0, fats: 0 },
    );
    const targets = { protein: 170, carbs: 260, fats: 70 };
    const completion = Math.min(
      100,
      Math.round(
        ((consumed.protein / targets.protein +
          consumed.carbs / targets.carbs +
          consumed.fats / targets.fats) /
          3) *
          100,
      ),
    );
    return { consumed, targets, completion };
  }, [effectiveNutritionMeals]);

  useEffect(() => {
    if (!isRestRunning || isRestPaused) return;
    const interval = window.setInterval(() => {
      setRestSeconds((prev) => {
        if (prev <= 1) {
          setIsRestRunning(false);
          setIsRestPaused(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isRestRunning, isRestPaused]);

  useEffect(() => {
    if (!isWorkoutMode) return;
    const id = window.setInterval(() => setSessionElapsedSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [isWorkoutMode]);

  useEffect(() => {
    if (!focusExercise || !focusExerciseContext) {
      setSetRowDrafts([]);
      return;
    }
    const n = focusExerciseContext.params.sets;
    setSetRowDrafts(
      Array.from({ length: n }, () => ({
        reps: String(focusExercise.reps),
        weight: String(focusExercise.weight),
      })),
    );
  }, [focusExercise?.id, focusExercise?.reps, focusExercise?.weight, focusExerciseContext?.params.sets]);

  async function onCreateRoutine(event: FormEvent) {
    event.preventDefault();
    if (!routineForm.name.trim()) return;
    await createRoutine.mutateAsync({
      name: routineForm.name,
      description: routineForm.description || undefined,
    });
    setRoutineForm({ name: "", description: "" });
  }

  async function onStartWorkout() {
    if (!currentUser?.id || !selectedRoutineId) return;
    if (!sessionExercises.length) {
      toast.error("Esta rutina no tiene ejercicios en el gimnasio. Añade ejercicios en el Paso 2 o revisa la rutina en el servidor.");
      return;
    }
    await createWorkoutSession.mutateAsync({
      userId: currentUser.id,
      routineId: selectedRoutineId,
      startedAt: new Date().toISOString(),
    });
    setIsWorkoutMode(true);
    setSessionClosed(false);
    setTrainingTab("session");
    setCompletedSetsByExerciseId({});
    setSessionElapsedSeconds(0);
    setIsRestRunning(false);
    setIsRestPaused(false);
    setRestSeconds(0);
    if (sessionExercises.length) {
      setActiveExerciseIndex(0);
      setSelectedExerciseId(sessionExercises[0].id);
    }
  }

  function startRest(seconds = 75) {
    const total = Math.max(5, seconds);
    setRestInitialTotal(total);
    setRestSeconds(total);
    setIsRestRunning(true);
    setIsRestPaused(false);
  }

  function skipRest() {
    setIsRestRunning(false);
    setIsRestPaused(false);
    setRestSeconds(0);
  }

  function extendRest(extraSeconds = 15) {
    if (!isRestRunning) return;
    setRestSeconds((prev) => prev + extraSeconds);
    setRestInitialTotal((prev) => prev + extraSeconds);
  }

  function toggleRestPause() {
    if (!isRestRunning) return;
    setIsRestPaused((p) => !p);
  }

  function exitWorkoutMode() {
    setIsWorkoutMode(false);
    setIsRestRunning(false);
    setIsRestPaused(false);
  }

  function exerciseFullyCompleted(exerciseId: string) {
    const ctx = exerciseContextById[exerciseId];
    const target = ctx?.params.sets ?? 4;
    return (completedSetsByExerciseId[exerciseId] ?? 0) >= target;
  }

  async function onCheckin() {
    if (!currentUser?.id) return;
    await createCheckin.mutateAsync({
      userId: currentUser.id,
      validateBy: currentUser.id,
      type: "MANUAL",
    });
  }

  function moveExercise(direction: "prev" | "next") {
    if (!sessionExercises.length) return;
    const prev = activeExerciseIndex;
    const next =
      direction === "prev"
        ? prev === 0
          ? sessionExercises.length - 1
          : prev - 1
        : prev === sessionExercises.length - 1
          ? 0
          : prev + 1;
    setActiveExerciseIndex(next);
    setSelectedExerciseId(sessionExercises[next]?.id ?? null);
  }

  function confirmCurrentSetAndRest() {
    if (!focusExercise || !focusExerciseContext) return;
    const target = focusExerciseContext.params.sets;
    const doneHere = completedSetsByExerciseId[focusExercise.id] ?? 0;
    if (doneHere >= target) {
      toast.info("Ya completaste todas las series de este ejercicio");
      return;
    }
    setCompletedSetsByExerciseId((prev) => ({
      ...prev,
      [focusExercise.id]: doneHere + 1,
    }));
    startRest(parseRestToSeconds(focusExerciseContext.params.rest));
    toast.success(`Set ${doneHere + 1} de ${target} registrado`);
  }

  function confirmSet() {
    confirmCurrentSetAndRest();
  }

  function confirmSetForExercise(exerciseId: string) {
    const exerciseIndex = sessionExercises.findIndex((item) => item.id === exerciseId);
    if (exerciseIndex === -1) return;
    const exercise = sessionExercises[exerciseIndex];
    const ctx = exerciseContextById[exercise.id];
    if (!ctx) return;

    setActiveExerciseIndex(exerciseIndex);
    setSelectedExerciseId(exercise.id);

    const target = ctx.params.sets;
    const doneHere = completedSetsByExerciseId[exercise.id] ?? 0;
    if (doneHere >= target) {
      toast.info("Todas las series ya están registradas para este ejercicio");
      return;
    }
    setCompletedSetsByExerciseId((prev) => ({
      ...prev,
      [exercise.id]: doneHere + 1,
    }));
    startRest(parseRestToSeconds(ctx.params.rest));
    toast.success(`Set registrado en ${exercise.exercise}`);
  }

  function completeSelectedExercise(exerciseId: string) {
    const ctx = exerciseContextById[exerciseId];
    const target = ctx?.params.sets ?? 4;
    setCompletedSetsByExerciseId((prev) => ({ ...prev, [exerciseId]: target }));
    const currentIndex = sessionExercises.findIndex((item) => item.id === exerciseId);
    if (currentIndex === -1) return;
    const isLastExercise = currentIndex >= sessionExercises.length - 1;
    if (isLastExercise) {
      toast.success("Rutina completada");
      return;
    }
    const nextIndex = currentIndex + 1;
    setActiveExerciseIndex(nextIndex);
    setSelectedExerciseId(sessionExercises[nextIndex]?.id ?? null);
    toast.success("Ejercicio completado, avanzando al siguiente");
  }

  function toggleMealConsumed(mealId: string) {
    setNutritionMeals((prev) =>
      prev.map((meal) => (meal.id === mealId ? { ...meal, consumed: !meal.consumed } : meal)),
    );
  }

  function addQuickFood(mealId: string) {
    const value = quickFoodByMeal[mealId]?.trim();
    if (!value) return;
    setNutritionMeals((prev) =>
      prev.map((meal) =>
        meal.id === mealId
          ? {
              ...meal,
              foods: [value, ...meal.foods],
            }
          : meal,
      ),
    );
    setQuickFoodByMeal((prev) => ({ ...prev, [mealId]: "" }));
  }

  function onSelectExerciseImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecciona un archivo de imagen");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === "string" ? reader.result : "";
      if (!value) return;
      setExerciseForm((prev) => ({ ...prev, imageUrl: value }));
      toast.success("Imagen cargada");
    };
    reader.onerror = () => {
      toast.error("No se pudo cargar la imagen");
    };
    reader.readAsDataURL(file);
  }

  async function onAddExerciseToRoutine(event: FormEvent) {
    event.preventDefault();
    if (!selectedRoutineId || !exerciseForm.name.trim()) return;
    const created = await createExercise.mutateAsync({
      name: exerciseForm.name.trim(),
      description: exerciseForm.description.trim() || undefined,
    });
    await addRoutineExercise.mutateAsync({
      routineId: selectedRoutineId,
      exerciseId: created.id,
      sets: 4,
      reps: Number(exerciseForm.reps) || 12,
    });

    setExerciseForm({
      name: "",
      description: "",
      instructions: "",
      imageUrl: "",
      muscleGroup: "",
      objective: "Hipertrofia",
      difficulty: "Básico",
      rest: "60s",
      commonMistakes: "",
      executionTips: "",
      demoVideoUrl: "",
      reps: "12",
      weight: "20",
    });
    setEditingRoutineExerciseId(null);
    setIsExerciseFormOpen(false);
    toast.success("Ejercicio agregado a la rutina");
  }

  function startEditRoutineExercise(exerciseId: string) {
    if (!selectedRoutineId) return;
    const current = routineExercisesByRoutineId[selectedRoutineId]?.find((item) => item.id === exerciseId);
    if (!current) return;
    setEditingRoutineExerciseId(exerciseId);
    setIsExerciseFormOpen(true);
    setExerciseForm({
      name: current.name,
      description: current.description,
      instructions: current.instructions,
      imageUrl: current.imageUrl,
      muscleGroup: current.muscleGroup,
      objective: current.objective,
      difficulty: current.difficulty,
      rest: current.rest,
      commonMistakes: current.commonMistakes,
      executionTips: current.executionTips,
      demoVideoUrl: current.demoVideoUrl,
      reps: String(current.reps),
      weight: String(current.weight),
    });
  }

  function onSaveRoutineExerciseEdit() {
    if (!selectedRoutineId || !editingRoutineExerciseId) return;
    setRoutineExercisesByRoutineId((prev) => ({
      ...prev,
      [selectedRoutineId]: (prev[selectedRoutineId] ?? []).map((item) =>
        item.id === editingRoutineExerciseId
          ? {
              ...item,
              name: exerciseForm.name.trim() || item.name,
              description: exerciseForm.description.trim(),
              instructions: exerciseForm.instructions.trim(),
              imageUrl: exerciseForm.imageUrl.trim(),
              muscleGroup: exerciseForm.muscleGroup.trim(),
              objective: exerciseForm.objective,
              difficulty: exerciseForm.difficulty,
              rest: exerciseForm.rest.trim() || item.rest,
              commonMistakes: exerciseForm.commonMistakes.trim(),
              executionTips: exerciseForm.executionTips.trim(),
              demoVideoUrl: exerciseForm.demoVideoUrl.trim(),
              reps: Number(exerciseForm.reps) || item.reps,
              weight: Number(exerciseForm.weight) || item.weight,
            }
          : item,
      ),
    }));
    setEditingRoutineExerciseId(null);
    setIsExerciseFormOpen(false);
    setExerciseForm({
      name: "",
      description: "",
      instructions: "",
      imageUrl: "",
      muscleGroup: "",
      objective: "Hipertrofia",
      difficulty: "Básico",
      rest: "60s",
      commonMistakes: "",
      executionTips: "",
      demoVideoUrl: "",
      reps: "12",
      weight: "20",
    });
    toast.success("Ejercicio actualizado");
  }

  function onRemoveRoutineExercise(exerciseId: string) {
    if (!selectedRoutineId) return;
    setRoutineExercisesByRoutineId((prev) => ({
      ...prev,
      [selectedRoutineId]: (prev[selectedRoutineId] ?? []).filter((item) => item.id !== exerciseId),
    }));
    if (editingRoutineExerciseId === exerciseId) {
      setEditingRoutineExerciseId(null);
      setIsExerciseFormOpen(false);
      setExerciseForm({
        name: "",
        description: "",
        instructions: "",
        imageUrl: "",
        muscleGroup: "",
        objective: "Hipertrofia",
        difficulty: "Básico",
        rest: "60s",
        commonMistakes: "",
        executionTips: "",
        demoVideoUrl: "",
        reps: "12",
        weight: "20",
      });
    }
    toast.success("Ejercicio quitado de la rutina");
  }

  function onDragExerciseFromCatalog(exercise: { id: string; name: string }) {
    setDraggedExerciseMeta({ source: "catalog", id: exercise.id, name: exercise.name });
  }

  function onDragExerciseFromDay(day: string, exercise: { id: string; name: string }) {
    setDraggedExerciseMeta({ source: "day", day, id: exercise.id, name: exercise.name });
  }

  function onDropExerciseToDay(day: string) {
    if (!draggedExerciseMeta) return;
    setWeeklyRoutineByDay((prev) => {
      const next = { ...prev };
      const existingTarget = [...(next[day] ?? [])];
      if (draggedExerciseMeta.source === "day" && draggedExerciseMeta.day) {
        next[draggedExerciseMeta.day] = (next[draggedExerciseMeta.day] ?? []).filter(
          (item) => item.id !== draggedExerciseMeta.id,
        );
      }
      existingTarget.push({
        id: `${draggedExerciseMeta.id}-${Date.now()}`,
        name: draggedExerciseMeta.name,
        reps: 12,
        weight: 20,
      });
      next[day] = existingTarget;
      return next;
    });
    setDraggedExerciseMeta(null);
  }

  function moveDayExercise(day: string, exerciseId: string, direction: "up" | "down") {
    setWeeklyRoutineByDay((prev) => {
      const items = [...(prev[day] ?? [])];
      const index = items.findIndex((item) => item.id === exerciseId);
      if (index === -1) return prev;
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= items.length) return prev;
      const temp = items[index];
      items[index] = items[targetIndex];
      items[targetIndex] = temp;
      return { ...prev, [day]: items };
    });
  }

  function removeDayExercise(day: string, exerciseId: string) {
    setWeeklyRoutineByDay((prev) => ({
      ...prev,
      [day]: (prev[day] ?? []).filter((item) => item.id !== exerciseId),
    }));
  }

  function addMealBlock(day: string, mealType: string) {
    setWeeklyNutritionByDay((prev) => ({
      ...prev,
      [day]: [
        ...(prev[day] ?? []),
        { id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, mealType, foods: [] },
      ],
    }));
  }

  function onDropFoodToMeal(day: string, mealId: string) {
    if (!draggedFoodName) return;
    setWeeklyNutritionByDay((prev) => ({
      ...prev,
      [day]: (prev[day] ?? []).map((meal) =>
        meal.id === mealId ? { ...meal, foods: [...meal.foods, draggedFoodName] } : meal,
      ),
    }));
    setDraggedFoodName(null);
  }

  function moveMealBlock(day: string, mealId: string, direction: "up" | "down") {
    setWeeklyNutritionByDay((prev) => {
      const items = [...(prev[day] ?? [])];
      const index = items.findIndex((item) => item.id === mealId);
      if (index === -1) return prev;
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= items.length) return prev;
      const temp = items[index];
      items[index] = items[targetIndex];
      items[targetIndex] = temp;
      return { ...prev, [day]: items };
    });
  }

  function removeMealBlock(day: string, mealId: string) {
    setWeeklyNutritionByDay((prev) => ({
      ...prev,
      [day]: (prev[day] ?? []).filter((meal) => meal.id !== mealId),
    }));
  }

  const inLiveWorkoutSession = isWorkoutMode && trainingTab === "session";
  const showSessionMain = isWorkoutMode ? trainingTab === "session" : trainingFocus === "training";

  const nutritionWeeklyBuilder = (
    <div className="mt-4 rounded-xl border border-[var(--border)] bg-black/20">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2 text-left"
        onClick={() => setIsNutritionAccordionOpen((prev) => !prev)}
      >
        <span className="text-sm font-semibold text-white">Nutrición por semana</span>
        <span className="text-xs text-[var(--muted)]">
          {isNutritionAccordionOpen ? "Ocultar" : "Mostrar"}
        </span>
      </button>
      {isNutritionAccordionOpen ? (
        <div className="border-t border-[var(--border)] p-3">
          <div className="grid gap-2 md:grid-cols-7">
            {WEEK_DAYS.map((day) => (
              <Button
                key={`builder-nutrition-day-${day}`}
                size="sm"
                variant={selectedNutritionBuilderDay === day ? "secondary" : "ghost"}
                onClick={() => setSelectedNutritionBuilderDay(day)}
              >
                {day}
              </Button>
            ))}
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <div className="rounded-lg border border-[var(--border)] bg-white/5 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Select value={selectedMealTypeToCreate} onValueChange={setSelectedMealTypeToCreate}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Tipo de comida" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAL_TYPES.map((mealType) => (
                      <SelectItem key={`meal-type-${mealType.value}`} value={mealType.value}>
                        {mealType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={() => addMealBlock(selectedNutritionBuilderDay, selectedMealTypeToCreate)}>
                  Añadir comida al día
                </Button>
              </div>
              <p className="text-xs text-[var(--muted)]">Alimentos existentes (arrastra a una comida)</p>
              <div className="mt-2 space-y-2">
                {nutritionFoodCatalog.map((food) => (
                  <div
                    key={`food-catalog-${food}`}
                    draggable
                    onDragStart={() => setDraggedFoodName(food)}
                    className="cursor-grab rounded-lg border border-[var(--border)] bg-black/20 p-2 text-sm text-white"
                  >
                    {food}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-indigo-300/40 bg-indigo-500/10 p-3">
              <div className="mt-3 space-y-2">
                {selectedBuilderDayMeals.length ? (
                  selectedBuilderDayMeals.map((mealBlock) => (
                    <div
                      key={`meal-block-${mealBlock.id}`}
                      className="rounded-lg border border-[var(--border)] bg-white/5 p-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-white">
                          {MEAL_TYPES.find((item) => item.value === mealBlock.mealType)?.label ?? mealBlock.mealType}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => moveMealBlock(selectedNutritionBuilderDay, mealBlock.id, "up")}>
                            Subir
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => moveMealBlock(selectedNutritionBuilderDay, mealBlock.id, "down")}>
                            Bajar
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => removeMealBlock(selectedNutritionBuilderDay, mealBlock.id)}>
                            Quitar
                          </Button>
                        </div>
                      </div>
                      <div
                        className="mt-2 rounded-md border border-dashed border-[var(--border)] bg-black/20 p-2"
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => onDropFoodToMeal(selectedNutritionBuilderDay, mealBlock.id)}
                      >
                        {mealBlock.foods.length ? (
                          <div className="flex flex-wrap gap-1">
                            {mealBlock.foods.map((food, index) => (
                              <span key={`meal-food-${mealBlock.id}-${index}`} className="rounded-full bg-white/10 px-2 py-1 text-xs text-white">
                                {food}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-[var(--muted)]">
                            Arrastra alimentos aquí para completar esta comida.
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-lg border border-[var(--border)] bg-white/5 p-3 text-xs text-[var(--muted)]">
                    No hay comidas para {selectedNutritionBuilderDay}. Añade una y arrastra alimentos.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="space-y-4">
      {!isWorkoutMode ? (
        <div className="flex max-w-md rounded-2xl border border-[var(--border)] bg-black/25 p-1">
          <button
            type="button"
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
              trainingFocus === "training"
                ? "bg-indigo-500/30 text-white shadow-sm"
                : "text-[var(--muted)] hover:text-white"
            }`}
            onClick={() => {
              setTrainingFocus("training");
              setTrainingTab("session");
            }}
          >
            <Flame className="h-4 w-4" />
            Entrenamiento
          </button>
          <button
            type="button"
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
              trainingFocus === "nutrition"
                ? "bg-emerald-500/25 text-white shadow-sm"
                : "text-[var(--muted)] hover:text-white"
            }`}
            onClick={() => {
              setTrainingFocus("nutrition");
              setTrainingTab("nutrition");
            }}
          >
            <Utensils className="h-4 w-4" />
            Nutrición
          </button>
        </div>
      ) : null}
      <div className={`grid gap-6 ${isWorkoutMode ? "lg:grid-cols-1" : "lg:grid-cols-3"}`}>
      {!isWorkoutMode ? (
      <Card className="lg:col-span-3">
        {trainingFocus === "nutrition" ? (
          <>
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Plan nutricional semanal</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Organiza comidas por día. Arrastra alimentos del catálogo a cada bloque; el resumen diario y los macros aparecen en la tarjeta grande de abajo mientras mantienes el foco en Nutrición.
            </p>
            {nutritionWeeklyBuilder}
          </>
        ) : (
          <>
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Orden recomendado · entrenamiento</p>
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
            <p className="text-xs text-[var(--muted)]">Paso 1</p>
            <p className="text-sm font-semibold text-white">Crear rutina</p>
            <form className="mt-2 space-y-2" onSubmit={onCreateRoutine}>
              <input
                value={routineForm.name}
                onChange={(event) => setRoutineForm((prev) => ({ ...prev, name: event.target.value }))}
                className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
                placeholder="Nombre rutina"
              />
              <input
                value={routineForm.description}
                onChange={(event) =>
                  setRoutineForm((prev) => ({ ...prev, description: event.target.value }))
                }
                className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
                placeholder="Descripción"
              />
              <Button type="submit" size="sm" className="w-full" loading={createRoutine.isPending}>
                Guardar rutina
              </Button>
            </form>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3 lg:col-span-2">
            <p className="text-xs text-[var(--muted)]">Paso 2</p>
            <p className="text-sm font-semibold text-white">Seleccionar rutina y revisar ejercicios</p>
            <Select
              value={selectedRoutineId || "__none__"}
              onValueChange={(value) => {
                setSelectedRoutineId(value === "__none__" ? "" : value);
                setIsExerciseFormOpen(false);
                setEditingRoutineExerciseId(null);
              }}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Selecciona rutina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Selecciona rutina</SelectItem>
                {(routines.data ?? []).map((routine) => (
                  <SelectItem key={routine.id} value={routine.id}>
                    {routine.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!hasRoutines ? (
              <p className="mt-2 text-xs text-[var(--muted)]">
                Aún no hay rutinas. Crea una en el Paso 1 para desbloquear la sesión.
              </p>
            ) : null}
            {hasRoutines && !selectedRoutineId ? (
              <p className="mt-2 text-xs text-[var(--muted)]">
                Ya tienes rutinas creadas. Selecciona una para empezar la sesión en vivo.
              </p>
            ) : null}

            <div className="mt-4 rounded-xl border border-[var(--border)] bg-black/20">
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left"
                onClick={() => setIsRoutineAccordionOpen((prev) => !prev)}
              >
                <span className="text-sm font-semibold text-white">Rutina por semana</span>
                <span className="text-xs text-[var(--muted)]">{isRoutineAccordionOpen ? "Ocultar" : "Mostrar"}</span>
              </button>
              {isRoutineAccordionOpen ? (
                <div className="border-t border-[var(--border)] p-3">
                  <div className="grid gap-2 md:grid-cols-7">
                    {WEEK_DAYS.map((day) => (
                      <Button
                        key={`builder-day-${day}`}
                        size="sm"
                        variant={selectedRoutineBuilderDay === day ? "secondary" : "ghost"}
                        onClick={() => setSelectedRoutineBuilderDay(day)}
                      >
                        {day}
                      </Button>
                    ))}
                  </div>

                  <div className="mt-3 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-lg border border-[var(--border)] bg-white/5 p-3">
                      <Button
                        size="sm"
                        variant={isExerciseFormOpen ? "secondary" : "ghost"}
                        onClick={() => {
                          setIsExerciseFormOpen((prev) => !prev);
                          if (isExerciseFormOpen) {
                            setEditingRoutineExerciseId(null);
                          }
                        }}
                      >
                        {isExerciseFormOpen ? "Ocultar formulario" : "Agregar nuevo ejercicio"}
                      </Button>
                      <p className="text-xs text-[var(--muted)]">Ejercicios existentes (arrastra al día)</p>
                      <div className="mt-2 space-y-2">
                        {(exercises.data ?? []).map((exercise) => (
                          <div
                            key={`catalog-${exercise.id}`}
                            draggable
                            onDragStart={() => onDragExerciseFromCatalog({ id: exercise.id, name: exercise.name })}
                            className="cursor-grab rounded-lg border border-[var(--border)] bg-black/20 p-2 text-sm text-white"
                          >
                            {exercise.name}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div
                      className="rounded-lg border border-dashed border-indigo-300/40 bg-indigo-500/10 p-3"
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => onDropExerciseToDay(selectedRoutineBuilderDay)}
                    >
                      <p className="text-xs text-indigo-100">
                        {selectedRoutineBuilderDay}: suelta aquí los ejercicios para ese día.
                      </p>
                      <div className="mt-2 space-y-2">
                        {selectedBuilderDayExercises.length ? (
                          selectedBuilderDayExercises.map((exercise, index) => (
                            <div
                              key={`day-ex-${exercise.id}`}
                              draggable
                              onDragStart={() =>
                                onDragExerciseFromDay(selectedRoutineBuilderDay, {
                                  id: exercise.id,
                                  name: exercise.name,
                                })
                              }
                              className="rounded-lg border border-[var(--border)] bg-white/5 p-2"
                            >
                              <p className="text-sm text-white">
                                {index + 1}. {exercise.name}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => moveDayExercise(selectedRoutineBuilderDay, exercise.id, "up")}
                                >
                                  Subir
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => moveDayExercise(selectedRoutineBuilderDay, exercise.id, "down")}
                                >
                                  Bajar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeDayExercise(selectedRoutineBuilderDay, exercise.id)}
                                >
                                  Quitar
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="rounded-lg border border-[var(--border)] bg-white/5 p-3 text-xs text-[var(--muted)]">
                            Este día aún no tiene ejercicios. Arrastra desde la columna izquierda.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {selectedRoutineId ? (
              <div className="mt-4 rounded-xl border border-[var(--border)] bg-black/20 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                    Ejercicios de la rutina seleccionada
                  </p>
                </div>
                {isExerciseFormOpen ? (
                  <form className="mt-2 grid gap-2 md:grid-cols-2" onSubmit={onAddExerciseToRoutine}>
                  <label className="space-y-1">
                    <span className="block text-xs text-[var(--muted)]">Nombre del ejercicio</span>
                    <input
                      value={exerciseForm.name}
                      onChange={(event) => setExerciseForm((prev) => ({ ...prev, name: event.target.value }))}
                      className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
                      placeholder="Ej: Sentadilla con barra"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="block text-xs text-[var(--muted)]">Descripción breve</span>
                    <input
                      value={exerciseForm.description}
                      onChange={(event) => setExerciseForm((prev) => ({ ...prev, description: event.target.value }))}
                      className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
                      placeholder="Ej: Enfoque en piernas y glúteos"
                    />
                  </label>
                  <label className="space-y-1 md:col-span-2">
                    <span className="block text-xs text-[var(--muted)]">Indicaciones</span>
                    <input
                      value={exerciseForm.instructions}
                      onChange={(event) => setExerciseForm((prev) => ({ ...prev, instructions: event.target.value }))}
                      className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
                      placeholder="Ej: Mantén la espalda neutra y baja hasta 90 grados"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="block text-xs text-[var(--muted)]">Grupo muscular</span>
                    <input
                      value={exerciseForm.muscleGroup}
                      onChange={(event) => setExerciseForm((prev) => ({ ...prev, muscleGroup: event.target.value }))}
                      className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
                      placeholder="Ej: Piernas y glúteos"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="block text-xs text-[var(--muted)]">Objetivo</span>
                    <Select
                      value={exerciseForm.objective}
                      onValueChange={(value) => setExerciseForm((prev) => ({ ...prev, objective: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Objetivo del ejercicio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fuerza">Fuerza</SelectItem>
                        <SelectItem value="Hipertrofia">Hipertrofia</SelectItem>
                        <SelectItem value="Resistencia">Resistencia</SelectItem>
                        <SelectItem value="Pérdida de grasa">Pérdida de grasa</SelectItem>
                      </SelectContent>
                    </Select>
                  </label>
                  <label className="space-y-1">
                    <span className="block text-xs text-[var(--muted)]">Nivel de dificultad</span>
                    <Select
                      value={exerciseForm.difficulty}
                      onValueChange={(value) =>
                        setExerciseForm((prev) => ({ ...prev, difficulty: value as ExerciseContext["difficulty"] }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Básico">Básico</SelectItem>
                        <SelectItem value="Intermedio">Intermedio</SelectItem>
                        <SelectItem value="Avanzado">Avanzado</SelectItem>
                      </SelectContent>
                    </Select>
                  </label>
                  <label className="space-y-1">
                    <span className="block text-xs text-[var(--muted)]">Descanso recomendado</span>
                    <input
                      value={exerciseForm.rest}
                      onChange={(event) => setExerciseForm((prev) => ({ ...prev, rest: event.target.value }))}
                      className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
                      placeholder="Ej: 60s"
                    />
                  </label>
                  <label className="space-y-1 md:col-span-2">
                    <span className="block text-xs text-[var(--muted)]">Errores comunes</span>
                    <input
                      value={exerciseForm.commonMistakes}
                      onChange={(event) =>
                        setExerciseForm((prev) => ({ ...prev, commonMistakes: event.target.value }))
                      }
                      className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
                      placeholder="Ej: Redondear espalda, perder estabilidad de rodillas"
                    />
                  </label>
                  <label className="space-y-1 md:col-span-2">
                    <span className="block text-xs text-[var(--muted)]">Tips de ejecución</span>
                    <input
                      value={exerciseForm.executionTips}
                      onChange={(event) =>
                        setExerciseForm((prev) => ({ ...prev, executionTips: event.target.value }))
                      }
                      className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
                      placeholder="Ej: Controla la bajada y exhala en la subida"
                    />
                  </label>
                  <label className="space-y-1 md:col-span-2">
                    <span className="block text-xs text-[var(--muted)]">Video demostrativo (opcional)</span>
                    <input
                      value={exerciseForm.demoVideoUrl}
                      onChange={(event) => setExerciseForm((prev) => ({ ...prev, demoVideoUrl: event.target.value }))}
                      className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
                      placeholder="Ej: https://youtube.com/..."
                    />
                  </label>
                  <label className="space-y-1 md:col-span-2">
                    <span className="block text-xs text-[var(--muted)]">URL de imagen demostrativa</span>
                    <input
                      value={exerciseForm.imageUrl}
                      onChange={(event) => setExerciseForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                      className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
                      placeholder="Ej: https://.../sentadilla.jpg"
                    />
                  </label>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-xs text-[var(--muted)]">O selecciona una imagen</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onSelectExerciseImage}
                      className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-xs text-white file:mr-3 file:rounded-md file:border-0 file:bg-[var(--primary)] file:px-2 file:py-1 file:text-white"
                    />
                  </div>
                  <label className="space-y-1">
                    <span className="block text-xs text-[var(--muted)]">Repeticiones</span>
                    <input
                      value={exerciseForm.reps}
                      onChange={(event) => setExerciseForm((prev) => ({ ...prev, reps: event.target.value }))}
                      className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
                      placeholder="Ej: 12"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="block text-xs text-[var(--muted)]">Peso sugerido (kg)</span>
                    <input
                      value={exerciseForm.weight}
                      onChange={(event) => setExerciseForm((prev) => ({ ...prev, weight: event.target.value }))}
                      className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
                      placeholder="Ej: 20"
                    />
                  </label>
                  <div className="md:col-span-2 flex flex-wrap gap-2">
                    {editingRoutineExerciseId ? (
                      <Button type="button" size="sm" onClick={onSaveRoutineExerciseEdit}>
                        Guardar cambios
                      </Button>
                    ) : (
                      <Button type="submit" size="sm" loading={createExercise.isPending}>
                        Añadir ejercicio
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingRoutineExerciseId(null);
                        setExerciseForm({
                          name: "",
                          description: "",
                          instructions: "",
                          imageUrl: "",
                          muscleGroup: "",
                          objective: "Hipertrofia",
                          difficulty: "Básico",
                          rest: "60s",
                          commonMistakes: "",
                          executionTips: "",
                          demoVideoUrl: "",
                          reps: "12",
                          weight: "20",
                        });
                      }}
                    >
                      Limpiar
                    </Button>
                  </div>
                  </form>
                ) : (
                  <p className="mt-2 rounded-lg border border-dashed border-[var(--border)] bg-white/5 p-3 text-xs text-[var(--muted)]">
                    El formulario está oculto. Presiona Agregar nuevo ejercicio para abrirlo.
                  </p>
                )}
                {isExerciseFormOpen && exerciseForm.imageUrl ? (
                  <div className="mt-2 overflow-hidden rounded-lg border border-[var(--border)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={exerciseForm.imageUrl}
                      alt="Preview ejercicio"
                      className="h-40 w-full object-cover"
                    />
                  </div>
                ) : isExerciseFormOpen ? (
                  <div className="mt-2 flex h-24 items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-white/5 text-xs text-[var(--muted)]">
                    Agrega una imagen para mostrar la ejecución del ejercicio.
                  </div>
                ) : null}

                <div className="mt-3 space-y-2">
                  {selectedRoutineExercises.length ? (
                    selectedRoutineExercises.map((item) => (
                      <div key={item.id} className="rounded-lg border border-[var(--border)] bg-white/5 p-3">
                        <div className="grid gap-3 md:grid-cols-[140px_1fr]">
                          <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-black/20">
                            {item.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.imageUrl} alt={`Ejercicio ${item.name}`} className="h-28 w-full object-cover" />
                            ) : (
                              <div className="flex h-28 items-center justify-center text-xs text-[var(--muted)]">
                                Sin imagen
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{item.name}</p>
                            <p className="text-xs text-[var(--muted)]">{item.description || "Sin descripción"}</p>
                            <p className="mt-1 text-xs text-[var(--muted)]">
                              {item.reps} reps · {item.weight} kg
                            </p>
                            <p className="mt-1 text-xs text-white/90">{item.instructions || "Sin indicaciones"}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => setSelectedRoutineExerciseDetailId(item.id)}
                              >
                                Ver detalle
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => startEditRoutineExercise(item.id)}>
                                Editar
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => onRemoveRoutineExercise(item.id)}>
                                Quitar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-lg border border-dashed border-[var(--border)] bg-white/5 p-3 text-xs text-[var(--muted)]">
                      Esta rutina no tiene ejercicios aún. Añade el primero para preparar la sesión.
                    </p>
                  )}
                </div>

                {(exercises.data ?? []).length ? (
                  <p className="mt-2 text-[11px] text-[var(--muted)]">
                    Catálogo global disponible: {(exercises.data ?? []).length} ejercicios creados.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
          </>
        )}
      </Card>
      ) : null}

      <Card className={`overflow-hidden p-0 ${isWorkoutMode ? "lg:col-span-1" : "lg:col-span-3"}`}>
        {isWorkoutMode ? (
          inLiveWorkoutSession ? (
            <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] bg-[#060910] px-3 py-3 md:px-4">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="shrink-0 text-zinc-300 hover:text-white"
                onClick={exitWorkoutMode}
              >
                ← Terminar
              </Button>
              <div className="min-w-0 flex-1 text-center">
                <p className="truncate text-sm font-semibold text-white">{selectedRoutineName}</p>
                <p className="text-[11px] text-[var(--muted)]">
                  Ejercicio {sessionExercises.length ? activeExerciseIndex + 1 : 0} de {sessionExercises.length}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <div className="hidden items-center rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-xs font-medium tabular-nums text-emerald-200 sm:flex">
                  <Timer className="mr-1 h-3.5 w-3.5" />
                  {formatClock(sessionElapsedSeconds)}
                </div>
                <Button type="button" size="sm" variant="secondary" onClick={() => setTrainingTab("nutrition")}>
                  <Utensils className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Nutrición</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] bg-[#060910] px-3 py-3 md:px-4">
              <Button type="button" size="sm" variant="ghost" className="shrink-0 text-zinc-300 hover:text-white" onClick={() => setTrainingTab("session")}>
                ← Entreno
              </Button>
              <p className="min-w-0 flex-1 text-center text-sm font-semibold text-white">Nutrición</p>
              <Button type="button" size="sm" variant="ghost" className="shrink-0 text-zinc-300 hover:text-white" onClick={exitWorkoutMode}>
                Terminar
              </Button>
            </div>
          )
        ) : (
          <>
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
                    {trainingFocus === "nutrition" ? "Plan de comidas e hidratación" : "Rutina, sesión y progreso"}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {trainingFocus === "nutrition"
                      ? "Usa el selector superior para volver al módulo de rutinas y ejercicios."
                      : "Usa el selector superior para planificar comidas sin mezclar con la rutina."}
                  </p>
                </div>
              </div>
            </div>
            <div className="border-b border-[var(--border)] bg-black/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                  {trainingFocus === "nutrition" ? "Resumen nutricional" : "Resumen de entreno"}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={planningScope === "day" ? "secondary" : "ghost"}
                    onClick={() => setPlanningScope("day")}
                  >
                    Hoy
                  </Button>
                  <Button
                    size="sm"
                    variant={planningScope === "week" ? "secondary" : "ghost"}
                    onClick={() => setPlanningScope("week")}
                  >
                    Semana
                  </Button>
                </div>
              </div>

              {planningScope === "day" ? (
                <div className="mt-3 grid gap-3 lg:grid-cols-1">
                  {trainingFocus === "training" ? (
                    <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
                      <p className="text-xs text-[var(--muted)]">Rutina de hoy</p>
                      {routineExercisesForPlanning.length ? (
                        <div className="mt-2 space-y-1">
                          {routineExercisesForPlanning.slice(0, 6).map((exercise) => (
                            <p key={`day-routine-${exercise.id}`} className="text-sm text-white">
                              {exercise.name} · {exercise.reps} reps
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-[var(--muted)]">
                          Selecciona una rutina y agrega ejercicios para ver el plan del día.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
                      <p className="text-xs text-[var(--muted)]">Nutrición de hoy</p>
                      <div className="mt-2 space-y-1">
                        {effectiveNutritionMeals.map((meal) => (
                          <p key={`day-nutrition-${meal.id}`} className="text-sm text-white">
                            {meal.label}: {meal.foods[0] ?? "Sin alimento definido"}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  <div className="grid gap-2 md:grid-cols-4 xl:grid-cols-7">
                    {WEEK_DAYS.map((day) => {
                      const dayRoutine = weeklyRoutinePlan.find((item) => item.day === day);
                      const dayNutrition = weeklyNutritionPlan.find((item) => item.day === day);
                      return (
                        <button
                          key={`week-day-${day}`}
                          type="button"
                          className={`rounded-lg border p-2 text-left transition ${
                            selectedWeekDay === day
                              ? "border-indigo-300 bg-indigo-500/20"
                              : "border-[var(--border)] bg-white/5 hover:bg-white/10"
                          }`}
                          onClick={() => setSelectedWeekDay(day)}
                        >
                          <p className="text-xs text-[var(--muted)]">{day}</p>
                          {trainingFocus === "training" ? (
                            <p className="text-xs text-white">{dayRoutine?.exercises.length ?? 0} ejercicios</p>
                          ) : (
                            <p className="text-xs text-white">{dayNutrition?.meals.length ?? 0} comidas</p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="grid gap-3 lg:grid-cols-1">
                    {trainingFocus === "training" ? (
                      <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
                        <p className="text-xs text-[var(--muted)]">Rutina de {selectedWeekDay}</p>
                        {selectedWeekRoutine?.exercises.length ? (
                          selectedWeekRoutine.exercises.map((exercise) => (
                            <p key={`week-routine-${exercise.id}`} className="mt-1 text-sm text-white">
                              {exercise.name} · {exercise.reps} reps
                            </p>
                          ))
                        ) : (
                          <p className="mt-1 text-sm text-[var(--muted)]">Sin ejercicios definidos.</p>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
                        <p className="text-xs text-[var(--muted)]">Nutrición de {selectedWeekDay}</p>
                        {selectedWeekNutrition?.meals.length ? (
                          selectedWeekNutrition.meals.map((meal) => (
                            <p key={`week-nutrition-${selectedWeekDay}-${meal.id}`} className="mt-1 text-sm text-white">
                              {meal.label}: {meal.foods[0] ?? "Sin alimento"}
                            </p>
                          ))
                        ) : (
                          <p className="mt-1 text-sm text-[var(--muted)]">Sin comidas definidas.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        {showSessionMain ? (
          isWorkoutMode ? (
            <>
              {isRestRunning ? (
                <div className="fixed inset-0 z-[80] flex flex-col bg-[#070810] text-white">
                  <div
                    className="pointer-events-none absolute inset-0 opacity-45"
                    style={{
                      background:
                        "radial-gradient(ellipse 80% 50% at 50% 18%, rgba(99,102,241,0.38), transparent 55%), radial-gradient(ellipse 55% 45% at 15% 85%, rgba(59,130,246,0.22), transparent 50%), radial-gradient(ellipse 50% 40% at 88% 72%, rgba(168,85,247,0.2), transparent 45%)",
                    }}
                  />
                  <div className="relative flex flex-1 flex-col items-center justify-center px-5 pb-10 pt-10">
                    <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-500">Descanso</p>
                    <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
                      Recupera energía
                    </h2>
                    {(() => {
                      const R = 104;
                      const c = 2 * Math.PI * R;
                      const denom = Math.max(restInitialTotal, 1);
                      const p = Math.min(1, Math.max(0, restSeconds / denom));
                      const offset = c * (1 - p);
                      return (
                        <div className="relative mt-8 flex h-[260px] w-[260px] shrink-0 items-center justify-center sm:mt-10 sm:h-[272px] sm:w-[272px]">
                          <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 240 240" aria-hidden>
                            <defs>
                              <linearGradient id={restRingGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#60a5fa" />
                                <stop offset="100%" stopColor="#a78bfa" />
                              </linearGradient>
                            </defs>
                            <circle cx="120" cy="120" r={R} stroke="rgba(255,255,255,0.08)" strokeWidth="12" fill="none" />
                            <circle
                              cx="120"
                              cy="120"
                              r={R}
                              stroke={`url(#${restRingGradientId})`}
                              strokeWidth="12"
                              fill="none"
                              strokeLinecap="round"
                              strokeDasharray={c}
                              strokeDashoffset={offset}
                              className="transition-[stroke-dashoffset] duration-1000 ease-linear"
                              style={{ filter: "drop-shadow(0 0 14px rgba(99,102,241,0.55))" }}
                            />
                          </svg>
                          <div className="relative flex flex-col items-center">
                            <span className="text-5xl font-bold tabular-nums tracking-tight sm:text-6xl">
                              {formatClock(restSeconds)}
                            </span>
                            <span className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                              {isRestPaused ? "Pausado" : "En curso"}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                    <div className="mt-9 flex items-center gap-5 sm:mt-10 sm:gap-8">
                      <button
                        type="button"
                        onClick={() => extendRest(15)}
                        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/10"
                        aria-label="Añadir 15 segundos al descanso"
                        title="+15 segundos"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={toggleRestPause}
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white shadow-[0_0_32px_rgba(99,102,241,0.55)] transition hover:brightness-110"
                        aria-label={isRestPaused ? "Reanudar descanso" : "Pausar descanso"}
                      >
                        {isRestPaused ? <Play className="h-7 w-7" /> : <Pause className="h-7 w-7" />}
                      </button>
                      <button
                        type="button"
                        onClick={skipRest}
                        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/10"
                        aria-label="Saltar descanso"
                        title="Saltar descanso"
                      >
                        <SkipForward className="h-5 w-5" />
                      </button>
                    </div>
                    <p className="mt-8 pb-[env(safe-area-inset-bottom)] text-center text-xs text-zinc-500">
                      +15s · Saltar para continuar
                    </p>
                  </div>
                </div>
              ) : null}

              <div
                className={`mx-auto flex w-full max-w-3xl flex-col gap-3 p-3 md:max-w-4xl md:gap-4 md:p-4 xl:max-w-6xl xl:flex-row xl:items-start xl:gap-6 ${
                  inLiveWorkoutSession ? "pb-40 md:pb-6" : "pb-4"
                }`}
              >
                <Card
                  className={`hidden shrink-0 border-indigo-400/25 bg-indigo-500/10 xl:w-64 ${inLiveWorkoutSession ? "" : "xl:block"}`}
                >
                  <p className="text-[10px] uppercase tracking-[0.18em] text-indigo-200/90">Orden</p>
                  <div className="mt-3 max-h-[70vh] space-y-2 overflow-y-auto pr-1">
                    {sessionExercises.map((exercise, index) => {
                      const isCurrent = activeExerciseIndex === index;
                      const isCompleted = exerciseFullyCompleted(exercise.id);
                      const statusLabel = isCurrent ? "Actual" : isCompleted ? "Completado" : "Próximo";
                      return (
                        <button
                          key={`timeline-${exercise.id}`}
                          type="button"
                          className={`w-full rounded-xl border p-3 text-left transition ${
                            isCurrent
                              ? "border-indigo-400 bg-indigo-500/25"
                              : isCompleted
                                ? "border-emerald-400/40 bg-emerald-500/10"
                                : "border-[var(--border)] bg-white/5 hover:bg-white/10"
                          }`}
                          onClick={() => {
                            setActiveExerciseIndex(index);
                            setSelectedExerciseId(exercise.id);
                          }}
                        >
                          <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">{statusLabel}</p>
                          <p className="text-sm font-semibold text-white">{exercise.exercise}</p>
                          <p className="text-xs text-[var(--muted)]">
                            {exercise.reps} reps · {exercise.weight} kg
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </Card>

                <div className="min-w-0 flex-1 space-y-3">
                  <div className="rounded-2xl border border-indigo-400/20 bg-gradient-to-b from-indigo-950/40 to-[#0b0f1a] px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        {inLiveWorkoutSession ? (
                          <>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-200/90">
                              Series de la sesión
                            </p>
                            <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-white">
                              {totalCompletedSets}
                              <span className="text-xl font-semibold text-zinc-500">
                                {" "}
                                / {totalTargetSets || "—"}
                              </span>
                            </p>
                            <div className="mt-2 h-2 max-w-xs rounded-full bg-white/10">
                              <div
                                className="h-full rounded-full bg-indigo-400 transition-all duration-300"
                                style={{ width: `${seriesProgressPercent}%` }}
                              />
                            </div>
                            <p className="mt-2 text-[11px] text-[var(--muted)] sm:hidden">
                              <Timer className="mr-1 inline h-3.5 w-3.5 align-text-bottom text-emerald-300/90" />
                              {formatClock(sessionElapsedSeconds)}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-200/90">
                              Sesión activa
                            </p>
                            <h2 className="mt-1 text-lg font-semibold leading-tight text-white md:text-xl">
                              {selectedRoutineName}
                            </h2>
                          </>
                        )}
                      </div>
                      <div className="hidden shrink-0 items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-sm font-medium tabular-nums text-emerald-200 sm:flex">
                        <Timer className="h-4 w-4" />
                        {formatClock(sessionElapsedSeconds)}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 text-xs text-[var(--muted)]">
                      {inLiveWorkoutSession ? (
                        <p>
                          Ejercicio{" "}
                          <span className="font-semibold text-indigo-200 tabular-nums">
                            {sessionExercises.length ? activeExerciseIndex + 1 : 0} / {sessionExercises.length || 0}
                          </span>
                          <span className="text-[var(--muted)]"> · Orden en la rutina</span>
                        </p>
                      ) : (
                        <p>
                          <span className="font-semibold text-indigo-200">Flujo</span> ·{" "}
                          {sessionExercises.length
                            ? `${activeExerciseIndex + 1} / ${sessionExercises.length}`
                            : "0 / 0"}
                        </p>
                      )}
                      {!inLiveWorkoutSession ? (
                        <p className="tabular-nums">
                          {totalCompletedSets} / {totalTargetSets || 0} series
                        </p>
                      ) : (
                        <p className="tabular-nums text-[var(--muted)]">
                          {done}/{sessionExercises.length || 0} ej. listos
                        </p>
                      )}
                    </div>
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {sessionExercises.map((exercise, index) => {
                        const isCurrent = activeExerciseIndex === index;
                        const doneChip = completedSetsByExerciseId[exercise.id] ?? 0;
                        const totalChip = exerciseContextById[exercise.id]?.params.sets ?? 4;
                        const chipDone = doneChip >= totalChip;
                        return (
                          <button
                            key={`chip-${exercise.id}`}
                            type="button"
                            onClick={() => {
                              setActiveExerciseIndex(index);
                              setSelectedExerciseId(exercise.id);
                            }}
                            className={`flex min-w-[118px] shrink-0 gap-2 rounded-2xl border px-2.5 py-2 text-left transition ${
                              isCurrent
                                ? "border-indigo-400 bg-indigo-500/30 text-white shadow-[0_0_0_1px_rgba(129,140,248,0.35)]"
                                : chipDone
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
                                  : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20"
                            }`}
                          >
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                                isCurrent ? "bg-indigo-500 text-white" : chipDone ? "bg-emerald-500/30 text-emerald-200" : "bg-white/10 text-zinc-400"
                              }`}
                            >
                              {index + 1}
                            </span>
                            <span className="min-w-0">
                              <span className="block max-w-[100px] truncate text-xs font-medium leading-tight">
                                {exercise.exercise}
                              </span>
                              <span className="mt-0.5 block text-[10px] text-[var(--muted)]">
                                {doneChip}/{totalChip}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Card className="overflow-hidden border-indigo-400/25 bg-[#0c101c]/90 p-4 shadow-inner">
                    {focusExercise && focusExerciseContext ? (
                      <>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                              {focusExercise.exercise}
                            </h3>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-[11px] font-medium uppercase tracking-wide text-zinc-200">
                                {focusExerciseContext.muscleGroup.split(/[\s,]/)[0] || "Grupo"}
                              </span>
                              <span className="rounded-full border border-indigo-400/40 bg-indigo-500/15 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-100">
                                {focusExerciseContext.difficulty}
                              </span>
                            </div>
                          </div>
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                            {focusExerciseContext.mediaUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={focusExerciseContext.mediaUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-[var(--muted)]">
                                <Target className="h-8 w-8 opacity-40" />
                              </div>
                            )}
                          </div>
                        </div>

                        <details className="group mt-4 rounded-2xl border border-indigo-500/20 bg-indigo-950/40 open:border-indigo-400/35">
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium text-indigo-100 [&::-webkit-details-marker]:hidden">
                            <span className="inline-flex items-center gap-2">
                              <Info className="h-4 w-4 shrink-0 text-indigo-300" />
                              Técnica y consejos
                            </span>
                            <ChevronDown className="h-4 w-4 shrink-0 text-indigo-200/70 transition-transform duration-200 group-open:rotate-180" />
                          </summary>
                          <div className="border-t border-white/10 px-3 py-2.5 text-sm leading-relaxed text-indigo-100/90">
                            {focusExerciseContext.howTo}
                          </div>
                        </details>

                        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                          {[
                            { label: "Sets", value: String(focusExerciseContext.params.sets) },
                            { label: "Reps", value: focusExerciseContext.params.reps },
                            { label: "Descanso", value: focusExerciseContext.params.rest },
                          ].map((cell) => (
                            <div
                              key={cell.label}
                              className="rounded-2xl border border-white/10 bg-white/[0.04] px-2 py-3"
                            >
                              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                                {cell.label}
                              </p>
                              <p className="mt-1 text-lg font-bold text-white">{cell.value}</p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-5 space-y-2">
                          {setRowDrafts.map((row, setIdx) => {
                            const targetSets = focusExerciseContext.params.sets;
                            const doneHere = completedSetsByExerciseId[focusExercise.id] ?? 0;
                            const isDone = setIdx < doneHere;
                            const isCurrent = setIdx === doneHere && doneHere < targetSets;
                            return (
                              <div
                                key={`set-row-${focusExercise.id}-${setIdx}`}
                                className={`flex items-center gap-2 rounded-2xl border px-2 py-2 transition md:gap-3 md:px-3 ${
                                  isCurrent
                                    ? "border-indigo-400/60 bg-indigo-500/15"
                                    : isDone
                                      ? "border-white/5 bg-white/[0.03] opacity-60"
                                      : "border-white/10 bg-white/[0.02] opacity-50"
                                }`}
                              >
                                <div
                                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                                    isCurrent ? "bg-indigo-500 text-white" : "bg-white/10 text-zinc-400"
                                  }`}
                                >
                                  {setIdx + 1}
                                </div>
                                <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
                                  <label className="block min-w-0">
                                    <span className="text-[9px] uppercase tracking-wide text-zinc-500">Reps</span>
                                    <input
                                      value={row.reps}
                                      disabled={!isCurrent}
                                      onChange={(e) => {
                                        const v = e.target.value;
                                        setSetRowDrafts((prev) =>
                                          prev.map((r, i) => (i === setIdx ? { ...r, reps: v } : r)),
                                        );
                                      }}
                                      className="mt-0.5 w-full rounded-xl border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white disabled:opacity-50"
                                    />
                                  </label>
                                  <label className="block min-w-0">
                                    <span className="text-[9px] uppercase tracking-wide text-zinc-500">Peso (kg)</span>
                                    <input
                                      value={row.weight}
                                      disabled={!isCurrent}
                                      onChange={(e) => {
                                        const v = e.target.value;
                                        setSetRowDrafts((prev) =>
                                          prev.map((r, i) => (i === setIdx ? { ...r, weight: v } : r)),
                                        );
                                      }}
                                      className="mt-0.5 w-full rounded-xl border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white disabled:opacity-50"
                                    />
                                  </label>
                                </div>
                                <button
                                  type="button"
                                  disabled={!isCurrent}
                                  onClick={() => {
                                    if (!isCurrent) return;
                                    setQuickSet({ reps: row.reps, weight: row.weight });
                                    confirmCurrentSetAndRest();
                                  }}
                                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
                                    isCurrent
                                      ? "bg-indigo-500 text-white shadow-[0_0_16px_rgba(99,102,241,0.45)] hover:brightness-110"
                                      : "bg-white/5 text-zinc-600"
                                  } disabled:cursor-not-allowed disabled:opacity-40`}
                                  aria-label={`Registrar set ${setIdx + 1}`}
                                >
                                  <CheckCircle2 className="h-5 w-5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-center text-[11px] text-zinc-400">
                          {nextExerciseInSession ? (
                            <>
                              <span className="font-semibold uppercase tracking-wide text-zinc-500">A continuación: </span>
                              <span className="text-zinc-200">{nextExerciseInSession.exercise}</span>
                            </>
                          ) : (
                            <span>Último ejercicio de la sesión</span>
                          )}
                        </div>

                        <div className="mt-4 hidden items-stretch gap-2 md:flex">
                          <Button
                            type="button"
                            variant="secondary"
                            className="h-12 w-12 shrink-0 rounded-2xl border border-white/10 bg-[#151a28] px-0 hover:bg-[#1c2233]"
                            onClick={() => moveExercise("prev")}
                            aria-label="Ejercicio anterior"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </Button>
                          <Button
                            type="button"
                            variant="primary"
                            className="h-12 min-w-0 flex-1 gap-2 rounded-2xl text-sm font-semibold shadow-[0_8px_28px_rgba(99,102,241,0.35)]"
                            onClick={() => {
                              const target = focusExerciseContext.params.sets;
                              const doneHere = completedSetsByExerciseId[focusExercise.id] ?? 0;
                              if (doneHere >= target) moveExercise("next");
                              else confirmCurrentSetAndRest();
                            }}
                          >
                            {(() => {
                              const target = focusExerciseContext.params.sets;
                              const doneHere = completedSetsByExerciseId[focusExercise.id] ?? 0;
                              if (doneHere >= target) {
                                return (
                                  <>
                                    <ChevronRight className="h-5 w-5" />
                                    Siguiente ejercicio
                                  </>
                                );
                              }
                              return (
                                <>
                                  <Pause className="h-5 w-5" />
                                  Iniciar descanso
                                </>
                              );
                            })()}
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            className="h-12 w-12 shrink-0 rounded-2xl border border-white/10 bg-[#151a28] px-0 hover:bg-[#1c2233]"
                            onClick={() => moveExercise("next")}
                            aria-label="Siguiente ejercicio"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </div>

                        <div className="mt-3 hidden flex-wrap justify-center gap-2 sm:flex">
                          <Button size="sm" variant="ghost" onClick={() => completeSelectedExercise(focusExercise.id)}>
                            Marcar ejercicio completo
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-[var(--muted)]">No hay ejercicios en esta rutina.</p>
                    )}
                  </Card>

                  <Card className="border-[var(--border)] bg-white/[0.03] p-3 md:p-4">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                      {inLiveWorkoutSession ? "Resumen rápido" : "Progreso sesión"}
                    </p>
                    <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
                      <p className="text-2xl font-bold tabular-nums text-white md:text-3xl">
                        {totalCompletedSets}
                        <span className="text-base font-normal text-zinc-500"> /{totalTargetSets || "—"}</span>
                        <span className="ml-2 text-xs font-normal text-[var(--muted)]">series</span>
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {done}/{sessionExercises.length || 0} ejercicios · {sessionProgress}%
                      </p>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-indigo-400 transition-all"
                        style={{ width: `${seriesProgressPercent}%` }}
                      />
                    </div>
                  </Card>
                </div>
              </div>

              {inLiveWorkoutSession && focusExercise && focusExerciseContext && !isRestRunning ? (
                <div className="fixed inset-x-0 bottom-0 z-[45] border-t border-[var(--border)] bg-[#0a0d14]/95 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
                  <div className="mx-auto flex max-w-lg items-stretch gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-14 w-14 shrink-0 rounded-2xl border border-white/10 bg-[#151a28] px-0"
                      onClick={() => moveExercise("prev")}
                      aria-label="Ejercicio anterior"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      className="h-14 min-w-0 flex-1 gap-2 rounded-2xl text-base font-semibold shadow-[0_8px_28px_rgba(99,102,241,0.35)]"
                      onClick={() => {
                        const target = focusExerciseContext.params.sets;
                        const doneHere = completedSetsByExerciseId[focusExercise.id] ?? 0;
                        if (doneHere >= target) moveExercise("next");
                        else confirmCurrentSetAndRest();
                      }}
                    >
                      {(() => {
                        const target = focusExerciseContext.params.sets;
                        const doneHere = completedSetsByExerciseId[focusExercise.id] ?? 0;
                        if (doneHere >= target) {
                          return (
                            <>
                              <ChevronRight className="h-6 w-6" />
                              Siguiente
                            </>
                          );
                        }
                        return (
                          <>
                            <Pause className="h-6 w-6" />
                            Registrar y descansar
                          </>
                        );
                      })()}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-14 w-14 shrink-0 rounded-2xl border border-white/10 bg-[#151a28] px-0"
                      onClick={() => moveExercise("next")}
                      aria-label="Siguiente ejercicio"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
          <div className="grid gap-4 p-4 xl:grid-cols-12">
            <Card className="w-full xl:col-span-8 border-indigo-400/30 bg-indigo-500/10">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.14em] text-indigo-200">Ejercicio actual</p>
                <p className="text-sm text-white">
                  {Math.min(activeExerciseIndex + 1, sessionExercises.length)}/{sessionExercises.length || 0}
                </p>
              </div>
              <div className="mt-3 rounded-2xl border border-indigo-300/40 bg-black/20 p-4">
                <p className="text-2xl font-semibold text-white">
                  {activeExercise?.exercise ?? "Selecciona rutina para iniciar"}
                </p>
                <p className="mt-1 text-sm text-indigo-100">
                  Objetivo: {activeExercise?.reps ?? 0} reps x {activeExercise?.weight ?? 0} kg
                </p>
                <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                  <input
                    value={quickSet.reps}
                    onChange={(event) => setQuickSet((prev) => ({ ...prev, reps: event.target.value }))}
                    className="rounded-lg border border-indigo-300/40 bg-white/10 p-2 text-sm text-white"
                    placeholder="Reps"
                  />
                  <input
                    value={quickSet.weight}
                    onChange={(event) => setQuickSet((prev) => ({ ...prev, weight: event.target.value }))}
                    className="rounded-lg border border-indigo-300/40 bg-white/10 p-2 text-sm text-white"
                    placeholder="Peso"
                  />
                  <Button variant="secondary" onClick={confirmSet}>
                    <CheckCircle2 className="h-4 w-4" />
                    Confirmar set
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (isRestRunning) toggleRestPause();
                      else {
                        const ctx = activeExercise ? exerciseContextById[activeExercise.id] : null;
                        startRest(ctx ? parseRestToSeconds(ctx.params.rest) : 75);
                      }
                    }}
                  >
                    <Timer className="h-4 w-4" />
                    {isRestRunning ? (isRestPaused ? "Reanudar descanso" : "Pausar descanso") : "Iniciar descanso"}
                  </Button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <Button size="sm" variant="ghost" onClick={() => moveExercise("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm text-white">
                  <Timer className="h-4 w-4 text-indigo-200" />
                  Descanso: {Math.floor(restSeconds / 60)
                    .toString()
                    .padStart(2, "0")}
                  :{(restSeconds % 60).toString().padStart(2, "0")}
                </div>
                <Button size="sm" variant="ghost" onClick={() => moveExercise("next")}>
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={skipRest}>
                  Saltar descanso
                </Button>
                <Button size="sm" variant="ghost" onClick={() => extendRest(15)}>
                  +15s
                </Button>
              </div>
              <div className="mt-4 rounded-xl border border-[var(--border)] bg-black/20 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Secuencia guiada</p>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {sessionExercises.map((exercise, index) => (
                    <button
                      key={exercise.id}
                      type="button"
                      className={`rounded-lg border p-3 text-left transition ${
                        selectedExerciseId === exercise.id
                          ? "border-indigo-300 bg-indigo-500/20"
                          : exerciseFullyCompleted(exercise.id)
                            ? "border-emerald-400/40 bg-emerald-500/10"
                            : "border-[var(--border)] bg-white/5 hover:bg-white/10"
                      }`}
                      onClick={() => setSelectedExerciseId(exercise.id)}
                    >
                      <p className="text-xs text-[var(--muted)]">Ejercicio {index + 1}</p>
                      <p className="text-sm font-semibold text-white">{exercise.exercise}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {exercise.reps} reps · {exercise.weight} kg
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="w-full xl:col-span-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Progreso sesión</p>
              <p className="mt-2 text-3xl font-semibold text-white">{sessionProgress}%</p>
              <p className="text-sm text-[var(--muted)]">
                {done}/{sessionExercises.length} ejercicios completados
              </p>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: `${sessionProgress}%` }} />
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                <Button
                  variant="secondary"
                  onClick={onStartWorkout}
                  loading={createWorkoutSession.isPending}
                  disabled={!canStartSession || routineExercises.isFetching}
                >
                  <PlayCircle className="h-4 w-4" />
                  {!selectedRoutineId
                    ? "Selecciona rutina para iniciar"
                    : routineExercises.isFetching
                      ? "Cargando ejercicios…"
                      : sessionExercises.length === 0
                        ? "Rutina sin ejercicios"
                        : "Iniciar sesión"}
                </Button>
                <Button variant="secondary" onClick={onCheckin} loading={createCheckin.isPending}>
                  Registrar check-in
                </Button>
                <Button variant="ghost" onClick={() => setSessionClosed(true)}>
                  Finalizar
                </Button>
              </div>
            </Card>
          </div>
          )
        ) : (
          <div className="grid gap-4 p-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Nutrición diaria</p>
                <p className="text-sm text-white">Cumplimiento: {nutritionTotals.completion}%</p>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all"
                  style={{ width: `${nutritionTotals.completion}%` }}
                />
              </div>
              <div className="mt-4 grid gap-3">
                {effectiveNutritionMeals.map((meal) => (
                  <article
                    key={meal.id}
                    className={`rounded-2xl border p-3 transition ${
                      meal.consumed
                        ? "border-emerald-400/40 bg-emerald-500/10"
                        : "border-[var(--border)] bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">{meal.label}</p>
                      <Button
                        size="sm"
                        variant={meal.consumed ? "secondary" : "ghost"}
                        onClick={() => toggleMealConsumed(meal.id)}
                      >
                        {meal.consumed ? "Consumida" : "Marcar consumida"}
                      </Button>
                    </div>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      P {meal.macros.protein}g · C {meal.macros.carbs}g · G {meal.macros.fats}g
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {meal.foods.map((food) => (
                        <span key={`${meal.id}-${food}`} className="rounded-full bg-white/10 px-2 py-1 text-xs text-white">
                          {food}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        value={quickFoodByMeal[meal.id] ?? ""}
                        onChange={(event) =>
                          setQuickFoodByMeal((prev) => ({ ...prev, [meal.id]: event.target.value }))
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addQuickFood(meal.id);
                          }
                        }}
                        className="flex-1 rounded-lg border border-[var(--border)] bg-black/20 p-2 text-xs text-white"
                        placeholder="Agregar alimento rápido"
                      />
                      <Button size="sm" variant="ghost" onClick={() => addQuickFood(meal.id)}>
                        Añadir
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            </Card>

            <Card>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Macros de hoy</p>
              <div className="mt-3 space-y-3 text-sm text-white">
                <div>
                  <p>Proteínas</p>
                  <div className="mt-1 h-2 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-indigo-400"
                      style={{
                        width: `${Math.min(100, (nutritionTotals.consumed.protein / nutritionTotals.targets.protein) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {nutritionTotals.consumed.protein} / {nutritionTotals.targets.protein} g
                  </p>
                </div>
                <div>
                  <p>Carbohidratos</p>
                  <div className="mt-1 h-2 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-emerald-400"
                      style={{
                        width: `${Math.min(100, (nutritionTotals.consumed.carbs / nutritionTotals.targets.carbs) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {nutritionTotals.consumed.carbs} / {nutritionTotals.targets.carbs} g
                  </p>
                </div>
                <div>
                  <p>Grasas</p>
                  <div className="mt-1 h-2 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{
                        width: `${Math.min(100, (nutritionTotals.consumed.fats / nutritionTotals.targets.fats) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {nutritionTotals.consumed.fats} / {nutritionTotals.targets.fats} g
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Card>

      {!isWorkoutMode && trainingFocus === "training" ? (
      <Card>
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--muted)]">Acciones de sesión</p>
          <EntityActionMenu
            title="Execution Flow"
            actions={[
              {
                id: "edit-active-session",
                label: "Editar sesión activa",
                kind: "edit",
                run: () => {
                  toast.success("Edición de sesión activa habilitada");
                },
              },
              {
                id: "cancel-active-session",
                label: "Cancelar sesión",
                kind: "delete",
                danger: true,
                requiresConfirm: true,
                run: () => {
                  setSessionClosed(true);
                },
              },
              {
                id: "restart-session",
                label: "Reiniciar sesión",
                kind: "flow",
                run: () => {
                  setSessionClosed(false);
                },
              },
            ]}
          />
        </div>
        <p className="mt-3 text-xs text-[var(--muted)]">
          Rol {role} · Estado actual: {sessionClosed ? "finalizada" : "activa"}.
        </p>
      </Card>
      ) : null}

      {!isWorkoutMode && trainingFocus === "training" ? (
      <div className="lg:col-span-3">
        <Card className="border-[var(--border)] bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Rutina y sesión</p>
          <p className="mt-2 text-sm font-semibold text-white">
            {selectedRoutineId ? selectedRoutineName : "Ninguna rutina seleccionada"}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            La sesión en vivo usa los ejercicios que vienen del servidor para la rutina que elijas en el Paso 2 (no es
            otro flujo aparte).
          </p>
          <div className="mt-3 rounded-xl border border-[var(--border)] bg-black/25 px-3 py-2 text-sm text-white">
            <span className="text-[var(--muted)]">Ejercicios listos para entrenar: </span>
            <span className="font-semibold tabular-nums">{sessionExercises.length}</span>
            {routineExercises.isFetching ? (
              <span className="ml-2 text-xs text-indigo-200">(cargando…)</span>
            ) : null}
          </div>
          {!selectedRoutineId ? (
            <p className="mt-2 text-xs text-amber-200/90">Selecciona una rutina arriba para ver sus ejercicios.</p>
          ) : null}
          {selectedRoutineId && !routineExercises.isFetching && sessionExercises.length === 0 ? (
            <p className="mt-2 text-xs text-amber-200/90">
              Esta rutina aún no tiene ejercicios enlazados en el gimnasio. Añádelos con &quot;Añadir a la rutina&quot;
              en el Paso 2; la asignación a clientes se hace desde la ficha de usuario o el flujo que use tu backend.
            </p>
          ) : null}
        </Card>
      </div>
      ) : null}
      </div>

      <Dialog open={Boolean(selectedExercise)} onOpenChange={(open) => !open && setSelectedExerciseId(null)}>
        <DialogContent className="max-w-3xl">
          {selectedExercise && selectedExerciseContext ? (
            <>
              <DialogHeader>
                <DialogTitle>{selectedExercise.exercise}</DialogTitle>
                <DialogDescription>
                  {selectedExerciseContext.muscleGroup} · {selectedExerciseContext.objective} · Nivel{" "}
                  {selectedExerciseContext.difficulty}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-xl border border-[var(--border)]">
                    {selectedExerciseContext.mediaUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedExerciseContext.mediaUrl}
                        alt={`Guía visual ${selectedExercise.exercise}`}
                        className="h-48 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-48 items-center justify-center bg-white/5 text-sm text-[var(--muted)]">
                        Sin media disponible
                      </div>
                    )}
                  </div>
                  {selectedExerciseContext.demoVideoUrl ? (
                    <a
                      href={selectedExerciseContext.demoVideoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full items-center justify-center rounded-lg border border-indigo-300/40 bg-indigo-500/10 px-3 py-2 text-sm text-indigo-100 transition hover:bg-indigo-500/20"
                    >
                      Ver video demostrativo
                    </a>
                  ) : null}
                  <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Cómo realizarlo</p>
                    <p className="mt-1 text-sm text-white">{selectedExerciseContext.howTo}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Contexto del ejercicio</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-white">
                      <p className="inline-flex items-center gap-1">
                        <Target className="h-4 w-4 text-indigo-200" />
                        {selectedExerciseContext.objective}
                      </p>
                      <p>{selectedExerciseContext.muscleGroup}</p>
                      <p>Nivel: {selectedExerciseContext.difficulty}</p>
                      <p>Objetivo set: técnica + control</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Parámetros</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-white">
                      <p>Series: {selectedExerciseContext.params.sets}</p>
                      <p>Reps: {selectedExerciseContext.params.reps}</p>
                      <p>Peso: {selectedExerciseContext.params.suggestedWeight ?? "Bodyweight"}</p>
                      <p>Descanso: {selectedExerciseContext.params.rest}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
                    <p className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-300" />
                      Errores comunes
                    </p>
                    <ul className="mt-1 space-y-1 text-sm text-white">
                      {selectedExerciseContext.mistakes.map((mistake) => (
                        <li key={mistake}>- {mistake}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
                    <p className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                      <Lightbulb className="h-3.5 w-3.5 text-emerald-300" />
                      Tips de ejecución
                    </p>
                    <ul className="mt-1 space-y-1 text-sm text-white">
                      {selectedExerciseContext.tips.map((tip) => (
                        <li key={tip}>- {tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setActiveExerciseIndex(
                      Math.max(0, sessionExercises.findIndex((item) => item.id === selectedExercise.id)),
                    );
                    toast.success("Ejercicio enfocado en sesión activa");
                  }}
                >
                  Iniciar ejercicio
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuickSet({
                      reps: selectedExerciseContext.params.reps,
                      weight: selectedExercise.weight.toString(),
                    });
                    confirmSetForExercise(selectedExercise.id);
                  }}
                >
                  Registrar set
                </Button>
                <Button variant="ghost" onClick={() => completeSelectedExercise(selectedExercise.id)}>
                  Completar
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    moveExercise("next");
                    const currentIndex = sessionExercises.findIndex((item) => item.id === selectedExercise.id);
                    const nextIndex = currentIndex === sessionExercises.length - 1 ? 0 : currentIndex + 1;
                    setSelectedExerciseId(sessionExercises[nextIndex]?.id ?? null);
                  }}
                >
                  Siguiente ejercicio
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(selectedRoutineExerciseDetail)}
        onOpenChange={(open) => !open && setSelectedRoutineExerciseDetailId(null)}
      >
        <DialogContent className="max-w-3xl">
          {selectedRoutineExerciseDetail ? (
            <>
              <DialogHeader>
                <DialogTitle>{selectedRoutineExerciseDetail.name}</DialogTitle>
                <DialogDescription>
                  {selectedRoutineExerciseDetail.muscleGroup || "Grupo muscular"} ·{" "}
                  {selectedRoutineExerciseDetail.objective} · Nivel {selectedRoutineExerciseDetail.difficulty}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-xl border border-[var(--border)]">
                    {selectedRoutineExerciseDetail.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedRoutineExerciseDetail.imageUrl}
                        alt={`Guía visual ${selectedRoutineExerciseDetail.name}`}
                        className="h-48 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-48 items-center justify-center bg-white/5 text-sm text-[var(--muted)]">
                        Sin media disponible
                      </div>
                    )}
                  </div>
                  {selectedRoutineExerciseDetail.demoVideoUrl ? (
                    <a
                      href={selectedRoutineExerciseDetail.demoVideoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full items-center justify-center rounded-lg border border-indigo-300/40 bg-indigo-500/10 px-3 py-2 text-sm text-indigo-100 transition hover:bg-indigo-500/20"
                    >
                      Ver video demostrativo
                    </a>
                  ) : null}
                  <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Cómo realizarlo</p>
                    <p className="mt-1 text-sm text-white">{selectedRoutineExerciseDetail.instructions || "Sin indicaciones"}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Parámetros</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-white">
                      <p>Series: 4</p>
                      <p>Reps: {selectedRoutineExerciseDetail.reps}</p>
                      <p>Peso: {selectedRoutineExerciseDetail.weight} kg</p>
                      <p>Descanso: {selectedRoutineExerciseDetail.rest}</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Errores comunes</p>
                    <p className="mt-1 text-sm text-white">
                      {selectedRoutineExerciseDetail.commonMistakes || "Sin errores registrados"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Tips de ejecución</p>
                    <p className="mt-1 text-sm text-white">
                      {selectedRoutineExerciseDetail.executionTips || "Sin tips registrados"}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
