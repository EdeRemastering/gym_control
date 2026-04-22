"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Lightbulb,
  PlayCircle,
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
import { useSessionStore } from "@/lib/session-store";
import type { Role } from "@/lib/types";
import { TrainingExecutionFlow } from "@/modules/training/flows/training-execution-flow";
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

export function TrainingModule({ role }: { role: Role }) {
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
  const [isRestRunning, setIsRestRunning] = useState(false);
  const [quickSet, setQuickSet] = useState({ reps: "10", weight: "40" });
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>([]);
  const [trainingTab, setTrainingTab] = useState<"session" | "nutrition">("session");
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
  const canStartSession = Boolean(selectedRoutineId);
  const selectedRoutineExercises = useMemo(
    () => (selectedRoutineId ? (routineExercisesByRoutineId[selectedRoutineId] ?? []) : []),
    [selectedRoutineId, routineExercisesByRoutineId],
  );
  const selectedRoutineExerciseDetail = selectedRoutineExercises.find(
    (item) => item.id === selectedRoutineExerciseDetailId,
  );
  const persistedRoutineExercises = useMemo(
    () =>
      (routineExercises.data ?? []).map((item) => ({
        id: item.id,
        name: item.exercise?.name ?? "Ejercicio",
        reps: item.reps,
        weight: Number(item.weight ?? 0),
      })),
    [routineExercises.data],
  );
  const routineExercisesForPlanning = selectedRoutineExercises.length
    ? selectedRoutineExercises.map((item) => ({
        id: item.id,
        name: item.name,
        reps: item.reps,
        weight: item.weight,
      }))
    : persistedRoutineExercises;
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
  const done = sessionExercises.filter((exercise) => completedExerciseIds.includes(exercise.id)).length;
  const activeExercise = sessionExercises[activeExerciseIndex] ?? null;
  const sessionProgress = sessionExercises.length ? Math.round((done / sessionExercises.length) * 100) : 0;
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
    if (!isRestRunning) return;
    const interval = window.setInterval(() => {
      setRestSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          setIsRestRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isRestRunning]);

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
    await createWorkoutSession.mutateAsync({
      userId: currentUser.id,
      routineId: selectedRoutineId,
      startedAt: new Date().toISOString(),
    });
    setIsWorkoutMode(true);
    setSessionClosed(false);
    setTrainingTab("session");
    if (sessionExercises.length) {
      setActiveExerciseIndex(0);
      setSelectedExerciseId(sessionExercises[0].id);
    }
  }

  function startRest(seconds = 75) {
    setIsRestRunning(true);
    setRestSeconds(seconds);
  }

  function skipRest() {
    setIsRestRunning(false);
    setRestSeconds(0);
  }

  function extendRest(extraSeconds = 15) {
    setIsRestRunning(true);
    setRestSeconds((prev) => prev + extraSeconds);
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
    setActiveExerciseIndex((prev) => {
      if (direction === "prev") return prev === 0 ? sessionExercises.length - 1 : prev - 1;
      return prev === sessionExercises.length - 1 ? 0 : prev + 1;
    });
  }

  function confirmSet() {
    if (!activeExercise) return;
    setCompletedExerciseIds((prev) => (prev.includes(activeExercise.id) ? prev : [...prev, activeExercise.id]));
    startRest(75);
    toast.success("Set registrado");
  }

  function confirmSetForExercise(exerciseId: string) {
    const exerciseIndex = sessionExercises.findIndex((item) => item.id === exerciseId);
    if (exerciseIndex === -1) return;
    const exercise = sessionExercises[exerciseIndex];

    setActiveExerciseIndex(exerciseIndex);
    setCompletedExerciseIds((prev) => (prev.includes(exercise.id) ? prev : [...prev, exercise.id]));
    startRest(75);
    toast.success(`Set registrado en ${exercise.exercise}`);
  }

  function completeSelectedExercise(exerciseId: string) {
    setCompletedExerciseIds((prev) => (prev.includes(exerciseId) ? prev : [...prev, exerciseId]));
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

    setRoutineExercisesByRoutineId((prev) => {
      const current = prev[selectedRoutineId] ?? [];
      return {
        ...prev,
        [selectedRoutineId]: [
          {
            id: created.id,
            name: created.name,
            description: created.description ?? "",
            instructions: exerciseForm.instructions.trim(),
            imageUrl: exerciseForm.imageUrl.trim(),
            muscleGroup: exerciseForm.muscleGroup.trim(),
            objective: exerciseForm.objective,
            difficulty: exerciseForm.difficulty,
            rest: exerciseForm.rest.trim() || "60s",
            commonMistakes: exerciseForm.commonMistakes.trim(),
            executionTips: exerciseForm.executionTips.trim(),
            demoVideoUrl: exerciseForm.demoVideoUrl.trim(),
            reps: Number(exerciseForm.reps) || 0,
            weight: Number(exerciseForm.weight) || 0,
          },
          ...current,
        ],
      };
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

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-3">
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Orden recomendado</p>
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
      </Card>

      <Card className="overflow-hidden p-0 lg:col-span-3">
        <div className="bg-gradient-to-r from-indigo-500/30 via-sky-500/20 to-emerald-500/30 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Fitness mode</p>
              <p className="text-lg font-semibold text-white">Entrenamiento + nutrición diaria</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={trainingTab === "session" ? "secondary" : "ghost"}
                onClick={() => setTrainingTab("session")}
              >
                <Flame className="h-4 w-4" />
                Sesión activa
              </Button>
              <Button
                size="sm"
                variant={trainingTab === "nutrition" ? "secondary" : "ghost"}
                onClick={() => setTrainingTab("nutrition")}
              >
                <Utensils className="h-4 w-4" />
                Nutrición
              </Button>
            </div>
          </div>
        </div>
        <div className="border-b border-[var(--border)] bg-black/20 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Planificación fitness</p>
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
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
                <p className="text-xs text-[var(--muted)]">Rutina de hoy</p>
                {routineExercisesForPlanning.length ? (
                  <div className="mt-2 space-y-1">
                    {routineExercisesForPlanning.slice(0, 4).map((exercise) => (
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
                      <p className="text-xs text-white">{dayRoutine?.exercises.length ?? 0} ejercicios</p>
                      <p className="text-xs text-white">{dayNutrition?.meals.length ?? 0} comidas</p>
                    </button>
                  );
                })}
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
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
              </div>
            </div>
          )}
        </div>
        {trainingTab === "session" ? (
          isWorkoutMode ? (
            <div className="grid gap-4 p-4 xl:grid-cols-12">
              <Card className="xl:col-span-4 border-indigo-400/30 bg-indigo-500/10">
                <p className="text-xs uppercase tracking-[0.14em] text-indigo-200">Timeline de ejercicios</p>
                <div className="mt-3 space-y-2">
                  {sessionExercises.map((exercise, index) => {
                    const isCurrent = activeExerciseIndex === index;
                    const isCompleted = completedExerciseIds.includes(exercise.id);
                    const statusLabel = isCurrent ? "Actual" : isCompleted ? "Completado" : "Próximo";
                    return (
                      <button
                        key={`timeline-${exercise.id}`}
                        type="button"
                        className={`w-full rounded-xl border p-3 text-left transition ${
                          isCurrent
                            ? "border-indigo-300 bg-indigo-500/20"
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

              <Card className="xl:col-span-8 border-indigo-400/30 bg-indigo-500/10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-[0.14em] text-indigo-200">Workout mode activo</p>
                  <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm text-white">
                    <Timer className="h-4 w-4 text-indigo-200" />
                    Descanso: {Math.floor(restSeconds / 60)
                      .toString()
                      .padStart(2, "0")}
                    :{(restSeconds % 60).toString().padStart(2, "0")}
                  </div>
                </div>

                <div className="mt-3 rounded-2xl border border-indigo-300/40 bg-black/20 p-4">
                  <p className="text-2xl font-semibold text-white">
                    {focusExercise?.exercise ?? "Sin ejercicio activo"}
                  </p>
                  <p className="mt-1 text-sm text-indigo-100">
                    {focusExerciseContext?.muscleGroup ?? "Grupo muscular"} · {focusExerciseContext?.objective ?? "Objetivo"}
                  </p>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    {focusExerciseContext?.howTo ?? "Selecciona una rutina para iniciar el flujo en vivo."}
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
                      Registrar set
                    </Button>
                    <Button variant="ghost" onClick={() => focusExercise && completeSelectedExercise(focusExercise.id)}>
                      Completar ejercicio
                    </Button>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                  <Button variant="ghost" onClick={() => moveExercise("prev")}>
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button variant="ghost" onClick={() => moveExercise("next")}>
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" onClick={skipRest}>
                    Saltar descanso
                  </Button>
                  <Button variant="ghost" onClick={() => extendRest(15)}>
                    +15s descanso
                  </Button>
                </div>
              </Card>

              <Card className="xl:col-span-12">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Progreso continuo</p>
                <p className="mt-2 text-3xl font-semibold text-white">{sessionProgress}%</p>
                <p className="text-sm text-[var(--muted)]">
                  {done}/{sessionExercises.length} ejercicios completados
                </p>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${sessionProgress}%` }} />
                </div>
              </Card>
            </div>
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
                      setIsRestRunning((prev) => !prev);
                      if (!isRestRunning && restSeconds === 0) setRestSeconds(75);
                    }}
                  >
                    <Timer className="h-4 w-4" />
                    {isRestRunning ? "Pausar descanso" : "Iniciar descanso"}
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
                          : completedExerciseIds.includes(exercise.id)
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
                  disabled={!canStartSession}
                >
                  <PlayCircle className="h-4 w-4" />
                  {canStartSession ? "Iniciar sesión" : "Selecciona rutina para iniciar"}
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

      <div className="lg:col-span-3">
        <TrainingExecutionFlow />
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
