"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ResponsiveDataViewProps = {
  mobile: ReactNode;
  desktop: ReactNode;
  className?: string;
  mobileClassName?: string;
  desktopClassName?: string;
};

export function ResponsiveDataView({
  mobile,
  desktop,
  className,
  mobileClassName,
  desktopClassName,
}: ResponsiveDataViewProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className={cn("md:hidden", mobileClassName)}>{mobile}</div>
      <div className={cn("hidden md:block", desktopClassName)}>{desktop}</div>
    </div>
  );
}

