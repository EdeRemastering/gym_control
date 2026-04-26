import type { LucideIcon } from "lucide-react";

export interface DashboardKpi {
  label: string;
  value: string;
  delta: string;
  icon: LucideIcon;
  tone: string;
}

export interface DashboardAlert {
  id: string;
  title: string;
  hint: string;
  at: string;
}

export interface DashboardInsight {
  id: string;
  title: string;
  description: string;
  cta: string;
}
