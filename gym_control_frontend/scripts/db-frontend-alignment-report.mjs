import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const frontendRoot = resolve(process.cwd());
const backendSchemaPath = resolve(frontendRoot, "../gym_control_backend/prisma/schema.prisma");
const servicesPath = resolve(frontendRoot, "lib/api/services.ts");
const typesPath = resolve(frontendRoot, "lib/types.ts");
const outputPath = resolve(frontendRoot, "reports/db-frontend-alignment-report.md");

function parseModels(schemaContent) {
  const matches = schemaContent.matchAll(/^model\s+([A-Za-z0-9_]+)\s+\{/gm);
  return [...matches].map((m) => m[1]);
}

function includesAny(content, patterns) {
  const normalizedContent = content.toLowerCase();
  return patterns.some((pattern) => normalizedContent.includes(pattern.toLowerCase()));
}

const coverageRules = {
  Gym: ["/gyms", "interface Gym"],
  User: ["/users", "interface User"],
  Role: ["type Role ="],
  Permission: ["/rbac/permissions", "usePermissions", "permission:read"],
  RolePermission: ["/rbac/roles/", "assignRolePermission", "removeRolePermission", "role-permission"],
  UserRole: ["role"],
  Payment: ["/billing/payments", "interface Payment"],
  Plan: ["/billing/plans", "interface Plan"],
  Membership: ["/billing/memberships", "interface Membership", "MembershipStatus"],
  Checkin: ["/activity/checkins", "interface Checkin"],
  Routine: ["/training/routines", "interface Routine"],
  Exercise: ["/training/exercises", "interface Exercise"],
  RoutineExercise: ["/training/routine-exercises", "interface RoutineExercise"],
  UserRoutine: ["/training/user-routines", "userRoutines"],
  Progress: ["/training/progress"],
  NutritionPlan: ["/nutrition/plans", "interface NutritionPlan"],
  Meal: ["/nutrition/meals", "interface NutritionMeal"],
  Food: ["/nutrition/foods"],
  MealFood: ["/nutrition/meal-foods"],
  UserActivity: ["/activity/user-activities", "interface UserActivity"],
  Post: ["/social/posts", "interface SocialPost"],
  Comment: ["/social/comments", "interface SocialComment"],
  PostLike: ["/social/post-likes", "likePost"],
  MediaPost: ["/social/media-posts", "interface ProfileMediaPost"],
  MediaLike: ["/social/media-likes", "useLikeMediaPost", "mediaLikes"],
  MediaComment: ["/social/media-comments", "useCreateMediaComment", "mediaComments"],
  AuditLog: ["/audit/logs", "audit"],
  Discount: ["/billing/discounts", "discountId"],
  FitnessClass: ["/scheduling/classes", "interface FitnessClass"],
  ClassSchedule: ["/scheduling/schedules", "classSchedule"],
  ClassSession: ["/scheduling/sessions", "interface ClassSession"],
  ClassBooking: ["/scheduling/bookings", "createBooking"],
  WorkoutSession: ["/training-execution/workout-sessions", "interface WorkoutSession"],
  ExerciseLog: ["/training-execution/exercise-logs", "createExerciseLog"],
  SetLog: ["/training-execution/set-logs", "createSetLog"],
  Notification: ["/notifications", "interface NotificationItem"],
  NotificationPreference: ["/notifications/preferences", "interface NotificationPreferences"],
};

function buildReport(models, servicesContent, typesContent) {
  const now = new Date().toISOString();
  const rows = models.map((model) => {
    const patterns = coverageRules[model] ?? [model];
    const coveredInServices = includesAny(servicesContent, patterns);
    const coveredInTypes = includesAny(typesContent, patterns);
    const covered = coveredInServices || coveredInTypes;

    return {
      model,
      status: covered ? "ALINEADO/USADO" : "SIN COBERTURA FRONTEND",
      detail: covered
        ? `Reglas encontradas: ${patterns.filter((p) => includesAny(servicesContent, [p]) || includesAny(typesContent, [p])).join(", ")}`
        : "No se encontró endpoint/type asociado en reglas de cobertura",
    };
  });

  const uncovered = rows.filter((r) => r.status === "SIN COBERTURA FRONTEND");

  const lines = [
    "# DB vs Frontend Alignment Report",
    "",
    `Generado: ${now}`,
    "",
    "## Resumen",
    "",
    `- Modelos totales en Prisma: ${models.length}`,
    `- Modelos con cobertura frontend: ${rows.length - uncovered.length}`,
    `- Modelos sin cobertura frontend: ${uncovered.length}`,
    "",
    "## Modelos sin cobertura frontend",
    "",
  ];

  if (uncovered.length === 0) {
    lines.push("- Ninguno");
  } else {
    for (const row of uncovered) {
      lines.push(`- ${row.model}: ${row.detail}`);
    }
  }

  lines.push("", "## Cobertura por modelo", "");
  for (const row of rows) {
    lines.push(`- ${row.model}: ${row.status}`);
  }

  return lines.join("\n");
}

const schemaContent = readFileSync(backendSchemaPath, "utf8");
const servicesContent = readFileSync(servicesPath, "utf8");
const typesContent = readFileSync(typesPath, "utf8");

const models = parseModels(schemaContent);
const report = buildReport(models, servicesContent, typesContent);

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, report, "utf8");

console.log(`Reporte generado en: ${outputPath}`);
