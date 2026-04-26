"use client";

import { InsightsModuleContainer } from "@/modules/insights/components/insights-module-container";
import type { ModuleShellProps } from "@/lib/module-shell-props";

export function AnalyticsModule(props: ModuleShellProps) {
  return <InsightsModuleContainer {...props} />;
}
