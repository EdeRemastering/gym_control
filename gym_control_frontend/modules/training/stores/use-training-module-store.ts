"use client";

import { create } from "zustand";
import type { ExerciseContext, RoutineExerciseDraft, WeeklyNutritionMeal, WeeklyRoutineExercise } from "@/modules/training/types/training-module.types";
import { getCurrentWeekDay } from "@/modules/training/services/training-module.utils";

type Updater<T> = T | ((prev: T) => T);

function resolveUpdate<T>(prev: T, value: Updater<T>): T {
  return typeof value === "function" ? (value as (prev: T) => T)(prev) : value;
}

interface TrainingModuleStoreState {
  routineForm: { name: string; description: string };
  selectedRoutineId: string;
  /** ID devuelto por POST workout-sessions; al registrar series se usa con exercise-logs / set-logs */
  activeWorkoutSessionId: string | null;
  /** Clave: Exercise.id del catálogo; valor: exerciseLog.id de la sesión en curso */
  exerciseLogIdByCatalogExerciseId: Record<string, string>;
  sessionClosed: boolean;
  isWorkoutMode: boolean;
  activeExerciseIndex: number;
  restSeconds: number;
  restInitialTotal: number;
  isRestRunning: boolean;
  isRestPaused: boolean;
  sessionElapsedSeconds: number;
  quickSet: { reps: string; weight: string };
  completedSetsByExerciseId: Record<string, number>;
  setRowDrafts: Array<{ reps: string; weight: string }>;
  trainingTab: "session" | "nutrition";
  trainingFocus: "training" | "nutrition";
  planningScope: "day" | "week";
  selectedWeekDay: string;
  selectedRoutineBuilderDay: string;
  isRoutineAccordionOpen: boolean;
  isNutritionAccordionOpen: boolean;
  selectedMealTypeToCreate: string;
  selectedExerciseId: string | null;
  exerciseForm: {
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
    reps: string;
    weight: string;
  };
  editingRoutineExerciseId: string | null;
  isExerciseFormOpen: boolean;
  routineExercisesByRoutineId: Record<string, RoutineExerciseDraft[]>;
  selectedRoutineExerciseDetailId: string | null;
  draggedExerciseMeta: {
    source: "catalog" | "day";
    day?: string;
    id: string;
    name: string;
  } | null;
  weeklyRoutineByDay: Record<string, WeeklyRoutineExercise[]>;
  weeklyRoutineMetaByDay: Record<string, { routineId: string; routineName: string; exerciseCount: number }>;
  weeklyNutritionByDay: Record<string, WeeklyNutritionMeal[]>;
  customNutritionFoods: string[];
  /** Plan nutricional activo (API), paralelo a `selectedRoutineId` */
  selectedNutritionPlanId: string;
  nutritionModalDay: string | null;
  nutritionModalSelectedMealId: string | null;
  nutritionModalFoodDraft: string;
  trainingModalDay: string | null;
  trainingModalExerciseId: string;
  trainingModalCustomName: string;
  trainingModalCustomReps: string;
  trainingModalCustomWeight: string;
}

interface TrainingModuleStoreActions {
  setRoutineForm: (value: Updater<TrainingModuleStoreState["routineForm"]>) => void;
  setSelectedRoutineId: (value: string) => void;
  setActiveWorkoutSessionId: (value: string | null) => void;
  setExerciseLogIdForCatalog: (catalogExerciseId: string, exerciseLogId: string) => void;
  setSessionClosed: (value: boolean) => void;
  setIsWorkoutMode: (value: boolean) => void;
  setActiveExerciseIndex: (value: Updater<number>) => void;
  setRestSeconds: (value: Updater<number>) => void;
  setRestInitialTotal: (value: Updater<number>) => void;
  setIsRestRunning: (value: boolean) => void;
  setIsRestPaused: (value: Updater<boolean>) => void;
  setSessionElapsedSeconds: (value: Updater<number>) => void;
  setQuickSet: (value: Updater<TrainingModuleStoreState["quickSet"]>) => void;
  setCompletedSetsByExerciseId: (value: Updater<Record<string, number>>) => void;
  setSetRowDrafts: (value: Updater<Array<{ reps: string; weight: string }>>) => void;
  setTrainingTab: (value: "session" | "nutrition") => void;
  setTrainingFocus: (value: "training" | "nutrition") => void;
  setPlanningScope: (value: "day" | "week") => void;
  setSelectedWeekDay: (value: string) => void;
  setSelectedRoutineBuilderDay: (value: string) => void;
  setIsRoutineAccordionOpen: (value: Updater<boolean>) => void;
  setIsNutritionAccordionOpen: (value: Updater<boolean>) => void;
  setSelectedMealTypeToCreate: (value: string) => void;
  setSelectedExerciseId: (value: string | null) => void;
  setExerciseForm: (value: Updater<TrainingModuleStoreState["exerciseForm"]>) => void;
  setEditingRoutineExerciseId: (value: string | null) => void;
  setIsExerciseFormOpen: (value: Updater<boolean>) => void;
  setRoutineExercisesByRoutineId: (value: Updater<Record<string, RoutineExerciseDraft[]>>) => void;
  setSelectedRoutineExerciseDetailId: (value: string | null) => void;
  setDraggedExerciseMeta: (value: TrainingModuleStoreState["draggedExerciseMeta"]) => void;
  setWeeklyRoutineByDay: (value: Updater<Record<string, WeeklyRoutineExercise[]>>) => void;
  setWeeklyRoutineMetaByDay: (
    value: Updater<Record<string, { routineId: string; routineName: string; exerciseCount: number }>>,
  ) => void;
  setWeeklyNutritionByDay: (value: Updater<Record<string, WeeklyNutritionMeal[]>>) => void;
  setCustomNutritionFoods: (value: Updater<string[]>) => void;
  setSelectedNutritionPlanId: (value: string) => void;
  setNutritionModalDay: (value: string | null) => void;
  setNutritionModalSelectedMealId: (value: string | null) => void;
  setNutritionModalFoodDraft: (value: string) => void;
  setTrainingModalDay: (value: string | null) => void;
  setTrainingModalExerciseId: (value: string) => void;
  setTrainingModalCustomName: (value: string) => void;
  setTrainingModalCustomReps: (value: string) => void;
  setTrainingModalCustomWeight: (value: string) => void;
}

export type TrainingModuleStore = TrainingModuleStoreState & TrainingModuleStoreActions;

const initialWeekDay = getCurrentWeekDay();

export const useTrainingModuleStore = create<TrainingModuleStore>((set) => ({
  routineForm: { name: "", description: "" },
  selectedRoutineId: "",
  activeWorkoutSessionId: null,
  exerciseLogIdByCatalogExerciseId: {},
  sessionClosed: false,
  isWorkoutMode: false,
  activeExerciseIndex: 0,
  restSeconds: 75,
  restInitialTotal: 90,
  isRestRunning: false,
  isRestPaused: false,
  sessionElapsedSeconds: 0,
  quickSet: { reps: "10", weight: "40" },
  completedSetsByExerciseId: {},
  setRowDrafts: [],
  trainingTab: "session",
  trainingFocus: "training",
  planningScope: "day",
  selectedWeekDay: initialWeekDay,
  selectedRoutineBuilderDay: initialWeekDay,
  isRoutineAccordionOpen: false,
  isNutritionAccordionOpen: false,
  selectedMealTypeToCreate: "BREAKFAST",
  selectedExerciseId: null,
  exerciseForm: {
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
  },
  editingRoutineExerciseId: null,
  isExerciseFormOpen: false,
  routineExercisesByRoutineId: {},
  selectedRoutineExerciseDetailId: null,
  draggedExerciseMeta: null,
  weeklyRoutineByDay: {},
  weeklyRoutineMetaByDay: {},
  weeklyNutritionByDay: {},
  customNutritionFoods: [],
  selectedNutritionPlanId: "",
  nutritionModalDay: null,
  nutritionModalSelectedMealId: null,
  nutritionModalFoodDraft: "",
  trainingModalDay: null,
  trainingModalExerciseId: "",
  trainingModalCustomName: "",
  trainingModalCustomReps: "12",
  trainingModalCustomWeight: "20",

  setRoutineForm: (value) => set((state) => ({ routineForm: resolveUpdate(state.routineForm, value) })),
  setSelectedRoutineId: (value) => set({ selectedRoutineId: value }),
  setActiveWorkoutSessionId: (value) =>
    set((s) => {
      if (s.activeWorkoutSessionId === value) return s;
      return { activeWorkoutSessionId: value, exerciseLogIdByCatalogExerciseId: {} };
    }),
  setExerciseLogIdForCatalog: (catalogExerciseId, exerciseLogId) =>
    set((s) => ({
      exerciseLogIdByCatalogExerciseId: {
        ...s.exerciseLogIdByCatalogExerciseId,
        [catalogExerciseId]: exerciseLogId,
      },
    })),
  setSessionClosed: (value) => set({ sessionClosed: value }),
  setIsWorkoutMode: (value) => set({ isWorkoutMode: value }),
  setActiveExerciseIndex: (value) => set((state) => ({ activeExerciseIndex: resolveUpdate(state.activeExerciseIndex, value) })),
  setRestSeconds: (value) => set((state) => ({ restSeconds: resolveUpdate(state.restSeconds, value) })),
  setRestInitialTotal: (value) => set((state) => ({ restInitialTotal: resolveUpdate(state.restInitialTotal, value) })),
  setIsRestRunning: (value) => set({ isRestRunning: value }),
  setIsRestPaused: (value) => set((state) => ({ isRestPaused: resolveUpdate(state.isRestPaused, value) })),
  setSessionElapsedSeconds: (value) =>
    set((state) => ({ sessionElapsedSeconds: resolveUpdate(state.sessionElapsedSeconds, value) })),
  setQuickSet: (value) => set((state) => ({ quickSet: resolveUpdate(state.quickSet, value) })),
  setCompletedSetsByExerciseId: (value) =>
    set((state) => ({ completedSetsByExerciseId: resolveUpdate(state.completedSetsByExerciseId, value) })),
  setSetRowDrafts: (value) => set((state) => ({ setRowDrafts: resolveUpdate(state.setRowDrafts, value) })),
  setTrainingTab: (value) => set({ trainingTab: value }),
  setTrainingFocus: (value) => set({ trainingFocus: value }),
  setPlanningScope: (value) => set({ planningScope: value }),
  setSelectedWeekDay: (value) => set({ selectedWeekDay: value }),
  setSelectedRoutineBuilderDay: (value) => set({ selectedRoutineBuilderDay: value }),
  setIsRoutineAccordionOpen: (value) =>
    set((state) => ({ isRoutineAccordionOpen: resolveUpdate(state.isRoutineAccordionOpen, value) })),
  setIsNutritionAccordionOpen: (value) =>
    set((state) => ({ isNutritionAccordionOpen: resolveUpdate(state.isNutritionAccordionOpen, value) })),
  setSelectedMealTypeToCreate: (value) => set({ selectedMealTypeToCreate: value }),
  setSelectedExerciseId: (value) => set({ selectedExerciseId: value }),
  setExerciseForm: (value) => set((state) => ({ exerciseForm: resolveUpdate(state.exerciseForm, value) })),
  setEditingRoutineExerciseId: (value) => set({ editingRoutineExerciseId: value }),
  setIsExerciseFormOpen: (value) => set((state) => ({ isExerciseFormOpen: resolveUpdate(state.isExerciseFormOpen, value) })),
  setRoutineExercisesByRoutineId: (value) =>
    set((state) => ({ routineExercisesByRoutineId: resolveUpdate(state.routineExercisesByRoutineId, value) })),
  setSelectedRoutineExerciseDetailId: (value) => set({ selectedRoutineExerciseDetailId: value }),
  setDraggedExerciseMeta: (value) => set({ draggedExerciseMeta: value }),
  setWeeklyRoutineByDay: (value) => set((state) => ({ weeklyRoutineByDay: resolveUpdate(state.weeklyRoutineByDay, value) })),
  setWeeklyRoutineMetaByDay: (value) =>
    set((state) => ({ weeklyRoutineMetaByDay: resolveUpdate(state.weeklyRoutineMetaByDay, value) })),
  setWeeklyNutritionByDay: (value) =>
    set((state) => ({ weeklyNutritionByDay: resolveUpdate(state.weeklyNutritionByDay, value) })),
  setCustomNutritionFoods: (value) => set((state) => ({ customNutritionFoods: resolveUpdate(state.customNutritionFoods, value) })),
  setSelectedNutritionPlanId: (value) => set({ selectedNutritionPlanId: value }),
  setNutritionModalDay: (value) => set({ nutritionModalDay: value }),
  setNutritionModalSelectedMealId: (value) => set({ nutritionModalSelectedMealId: value }),
  setNutritionModalFoodDraft: (value) => set({ nutritionModalFoodDraft: value }),
  setTrainingModalDay: (value) => set({ trainingModalDay: value }),
  setTrainingModalExerciseId: (value) => set({ trainingModalExerciseId: value }),
  setTrainingModalCustomName: (value) => set({ trainingModalCustomName: value }),
  setTrainingModalCustomReps: (value) => set({ trainingModalCustomReps: value }),
  setTrainingModalCustomWeight: (value) => set({ trainingModalCustomWeight: value }),
}));
