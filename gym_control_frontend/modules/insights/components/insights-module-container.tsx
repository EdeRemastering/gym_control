"use client";

import type { ModuleShellProps } from "@/lib/module-shell-props";
import { CreateInsightDialog } from "@/modules/insights/components/create-insight-dialog";
import { InsightsModule } from "@/modules/insights/components/insights-module";
import { useInsightsBootstrap } from "@/modules/insights/hooks/use-insights-bootstrap";

export function InsightsModuleContainer({ role }: ModuleShellProps) {
  useInsightsBootstrap();
  void role;

  return (
    <>
      <CreateInsightDialog />
      <InsightsModule />
    </>
  );
}
