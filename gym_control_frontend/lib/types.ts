export type Role = "ADMIN" | "TRAINER" | "CLIENT";

export type MembershipStatus = "ACTIVE" | "PAST_DUE" | "TRIAL" | "CANCELLED";

export interface Gym {
  id: string;
  name: string;
  members: number;
  activeClasses: number;
}

export interface User {
  id: string;
  gymId?: string;
  name: string;
  email: string;
  phone?: string | null;
  bio?: string | null;
  role?: Role;
  membershipStatus?: MembershipStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthUser {
  id: string;
  gymId: string;
  name: string;
  email: string | null;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RevenuePoint {
  label: string;
  value: number;
}

export interface ClassSession {
  id: string;
  title: string;
  trainer: string;
  startsAt: string;
  endsAt: string;
  occupancy: number;
}

export interface TrainingSet {
  id: string;
  exercise: string;
  reps: number;
  weight: number;
  done: boolean;
}

export interface Plan {
  id: string;
  name: string;
  duration: number;
  price: number;
  createdAt?: string;
}

export interface Payment {
  id: string;
  userId: string;
  status: string;
  method: string;
  finalAmount: number;
  createdAt: string;
}

export interface FitnessClass {
  id: string;
  name: string;
  description?: string | null;
  trainerId?: string | null;
  capacity: number;
  level?: string | null;
}

export interface Routine {
  id: string;
  name: string;
  description?: string | null;
}

export interface Exercise {
  id: string;
  name: string;
  description?: string | null;
}

export interface RoutineExercise {
  id: string;
  routineId: string;
  exerciseId: string;
  sets: number;
  reps: number;
  weight?: number | null;
  position?: number | null;
  exercise?: Exercise;
}

export interface NutritionPlan {
  id: string;
  userId: string;
  name: string;
  startDate: string;
  endDate?: string | null;
}

export interface NutritionMeal {
  id: string;
  nutritionPlanId: string;
  dayOfWeek: number;
  mealType: string;
  description: string;
  calories?: number | null;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  routineId: string;
  startedAt: string;
  endedAt?: string | null;
  status: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: string;
  createdAt: string;
}

export interface Checkin {
  id: string;
  userId: string;
  type: string;
  createdAt: string;
}

export interface SocialPost {
  id: string;
  userId: string;
  content: string;
  mediaUrl?: string | null;
  createdAt: string;
  likeCount?: number;
  isLiked?: boolean;
  comments?: SocialComment[];
}

export interface SocialComment {
  id: string;
  postId: string;
  userId: string;
  parentId?: string | null;
  content: string;
  createdAt: string;
}

export interface ProfileMediaPost {
  id: string;
  userId: string;
  type: "IMAGE" | "VIDEO";
  mediaUrl: string;
  caption?: string | null;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  gymId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
}
