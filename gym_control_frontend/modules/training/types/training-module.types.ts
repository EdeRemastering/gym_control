export interface ExerciseContext {
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

export interface RoutineExerciseDraft {
  id: string;
  /** Exercise.id del catálogo (gimnasio); necesario para registrar sets en el servidor */
  exerciseCatalogId?: string;
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
}

export interface SessionExercise {
  id: string;
  /** Exercise.id en API (no confundir con id de fila de routine_exercise) */
  exerciseCatalogId?: string;
  exercise: string;
  reps: number;
  weight: number;
}

export interface WeeklyRoutineExercise {
  id: string;
  exerciseCatalogId?: string;
  name: string;
  reps: number;
  weight: number;
}

export interface WeeklyNutritionMeal {
  id: string;
  mealType: string;
  foods: string[];
}
