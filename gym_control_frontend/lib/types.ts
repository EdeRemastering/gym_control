export type Role = "ADMIN" | "TRAINER" | "CLIENT";

export type MembershipStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "EXPIRED"
  | "CANCELLED"
  | "SUSPENDED";

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
  classId?: string;
  title: string;
  trainer: string;
  startsAt: string;
  endsAt: string;
  occupancy: number;
  status?: string;
  isSyncing?: boolean;
  isOptimistic?: boolean;
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

export interface Membership {
  id: string;
  planId: string;
  userId: string;
  status: MembershipStatus;
  startDate: string;
  endDate: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface Payment {
  id: string;
  gymId?: string;
  userId: string;
  membershipId?: string | null;
  discountId?: string | null;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  method: "CASH" | "CARD" | "TRANSFER" | "ONLINE";
  amount?: number;
  discountAmount?: number;
  finalAmount: number;
  notes?: string | null;
  updatedAt?: string;
  createdAt: string;
}

export interface FitnessClass {
  id: string;
  name: string;
  description?: string | null;
  trainerId?: string | null;
  capacity: number;
  level?: string | null;
  isSyncing?: boolean;
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
  gymId?: string;
  userId: string;
  createdBy?: string;
  name: string;
  startDate: string;
  endDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface NutritionMeal {
  id: string;
  nutritionPlanId: string;
  dayOfWeek: number;
  mealType: string;
  description: string;
  calories?: number | null;
}

export interface Food {
  id: string;
  gymId?: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  createdAt?: string;
}

export interface MealFood {
  id: string;
  mealId: string;
  foodId: string;
  quantity: number;
  unit: "g" | "ml" | "unit" | "cup" | "tbsp" | "tsp";
  createdAt?: string;
  updatedAt?: string;
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
  gymId?: string;
  userId: string;
  validateBy?: string | null;
  type: string;
  createdAt: string;
}

export type SocialPostType = "PUBLICATION" | "ACHIEVEMENT" | "NUTRITION";

export interface SocialPost {
  id: string;
  userId: string;
  postType?: SocialPostType;
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
  gymId?: string;
  userId: string;
  type: "IMAGE" | "VIDEO";
  mediaUrl: string;
  duration?: number | null;
  caption?: string | null;
  createdAt: string;
}

export interface MediaLike {
  mediaPostId: string;
  userId: string;
  isLiked: boolean;
  likeCount: number;
}

export interface MediaComment {
  id: string;
  mediaPostId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  gymId?: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  data?: unknown;
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

export interface ClassSchedule {
  id: string;
  gymId?: string;
  classId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Discount {
  id: string;
  gymId?: string;
  name: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  startDate: string;
  endDate?: string | null;
  maxUses?: number | null;
  usesCount?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLogEntry {
  id: string;
  tableName: string;
  recordId: string;
  fieldName: string;
  oldValue?: string | null;
  newValue?: string | null;
  operation: "INSERT" | "UPDATE" | "DELETE";
  changedBy: string;
  changedAt: string;
  ipAddress?: string | null;
  reason?: string | null;
}
