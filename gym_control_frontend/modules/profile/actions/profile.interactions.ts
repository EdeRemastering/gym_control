import { toast } from "sonner";

export interface EditableProfile {
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
  publishTrainingRoutines: boolean;
  publishNutritionRoutines: boolean;
}

export interface PublicRoutineVisibility {
  publishTrainingRoutines: boolean;
  publishNutritionRoutines: boolean;
}

export function loadEditableProfile(userId: string | undefined, fallback: EditableProfile): EditableProfile {
  if (typeof window === "undefined" || !userId) return fallback;
  const saved = window.localStorage.getItem(`profile-custom-${userId}`);
  if (!saved) return fallback;
  try {
    const parsed = JSON.parse(saved) as Partial<EditableProfile>;
    return {
      ...fallback,
      ...parsed,
    };
  } catch {
    return fallback;
  }
}

export function persistEditableProfile(userId: string | undefined, profile: EditableProfile) {
  if (!userId) return;
  window.localStorage.setItem(`profile-custom-${userId}`, JSON.stringify(profile));
}

export function loadPublicRoutineVisibility(userId: string | undefined): PublicRoutineVisibility {
  if (typeof window === "undefined" || !userId) {
    return { publishTrainingRoutines: false, publishNutritionRoutines: false };
  }
  const saved = window.localStorage.getItem(`profile-custom-${userId}`);
  if (!saved) {
    return { publishTrainingRoutines: false, publishNutritionRoutines: false };
  }
  try {
    const parsed = JSON.parse(saved) as Partial<EditableProfile>;
    return {
      publishTrainingRoutines: Boolean(parsed.publishTrainingRoutines),
      publishNutritionRoutines: Boolean(parsed.publishNutritionRoutines),
    };
  } catch {
    return { publishTrainingRoutines: false, publishNutritionRoutines: false };
  }
}

export async function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("FILE_READ_ERROR"));
    reader.readAsDataURL(file);
  });
}

export function saveProfileDraft(setProfile: (value: EditableProfile) => void, setIsEditing: (value: boolean) => void, draft: EditableProfile) {
  setProfile(draft);
  setIsEditing(false);
  toast.success("Perfil actualizado");
}

export function cancelProfileDraft(setDraft: (value: EditableProfile) => void, setIsEditing: (value: boolean) => void, current: EditableProfile) {
  setDraft(current);
  setIsEditing(false);
}

