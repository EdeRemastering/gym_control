"use client";

import type { ModuleShellProps } from "@/lib/module-shell-props";
import { FinanceModule } from "@/modules/finance/components/finance-module";

export function BillingModule(props: ModuleShellProps) {
  return <FinanceModule {...props} />;
}
