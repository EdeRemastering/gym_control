"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={es}
      className={cn("p-1", className)}
      classNames={{
        months: "flex flex-col gap-2",
        month: "space-y-3",
        caption: "relative flex items-center justify-center pt-1",
        caption_label: "text-sm font-medium text-[var(--foreground)]",
        nav: "flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "absolute left-1 h-7 w-7 rounded-md bg-transparent p-0 opacity-80 hover:opacity-100",
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "absolute right-1 h-7 w-7 rounded-md bg-transparent p-0 opacity-80 hover:opacity-100",
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "w-9 rounded-md text-[0.8rem] font-normal text-[var(--muted)]",
        week: "mt-1 flex w-full",
        day: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "h-9 w-9 rounded-md p-0 font-normal aria-selected:opacity-100",
        ),
        day_button:
          "h-9 w-9 rounded-md p-0 font-normal transition-colors hover:bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)]",
        today: "border border-[var(--primary)] text-[var(--foreground)]",
        selected:
          "bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary)] hover:text-[var(--on-primary)] focus:bg-[var(--primary)] focus:text-[var(--on-primary)]",
        outside: "text-[var(--muted)] opacity-45",
        disabled: "text-[var(--muted)] opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: iconClassName, ...iconProps }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("h-4 w-4", iconClassName)} {...iconProps} />
          ) : (
            <ChevronRight className={cn("h-4 w-4", iconClassName)} {...iconProps} />
          ),
      }}
      {...props}
    />
  );
}
