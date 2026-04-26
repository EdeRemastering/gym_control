import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  CalendarDays,
  Dumbbell,
  LayoutDashboard,
  MessagesSquare,
  UserCircle,
  Users,
  Wallet,
} from "lucide-react";
import type { ModuleKey } from "@/lib/navigation";

export const moduleIcons: Record<ModuleKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  billing: Wallet,
  training: Dumbbell,
  scheduling: CalendarDays,
  users: Users,
  analytics: BarChart3,
  profile: UserCircle,
  social: MessagesSquare,
  notifications: Bell,
};
