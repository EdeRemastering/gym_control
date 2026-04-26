"use client";

import { LiveWorkoutFocusCard } from "@/modules/training/components/live-workout-focus-card";
import { LiveWorkoutNutritionRail } from "@/modules/training/components/live-workout-nutrition-rail";
import { LiveWorkoutSessionHeader } from "@/modules/training/components/live-workout-session-header";
import { LiveWorkoutStatusColumn } from "@/modules/training/components/live-workout-status-column";
import { LiveWorkoutTimeline } from "@/modules/training/components/live-workout-timeline";
import { WorkoutQuickControlsPanel } from "@/modules/training/components/workout-quick-controls-panel";
import { WorkoutSessionStats } from "@/modules/training/components/workout-session-stats";
import { WorkoutTipCard } from "@/modules/training/components/workout-tip-card";

/**
 * Layout 3 columnas alineado al mockup: entreno | estado/descanso | nutrición; timeline horizontal abajo.
 */
export function LiveWorkoutProSessionLayout() {
  return (
    <div className="relative z-10 mx-auto w-full max-w-[1600px] flex-1 space-y-3 overflow-y-auto px-2 pb-32 pt-2 md:px-4 md:pb-8">
      <div className="grid gap-3 lg:grid-cols-12 lg:items-start">
        <section className="order-1 space-y-3 lg:order-1 lg:col-span-7 xl:col-span-7 2xl:col-span-7">
          <LiveWorkoutSessionHeader />
          <WorkoutSessionStats />
          <LiveWorkoutFocusCard />
        </section>

        <section className="order-2 min-w-0 space-y-3 lg:order-2 lg:col-span-2 xl:col-span-2 2xl:col-span-2">
          <LiveWorkoutStatusColumn />
        </section>

        <section className="order-3 min-w-0 space-y-3 lg:order-3 lg:col-span-3 xl:col-span-3 2xl:col-span-3">
          <LiveWorkoutNutritionRail />
        </section>

        <div className="order-4 col-span-full lg:order-4">
          <LiveWorkoutTimeline variant="strip" />
        </div>

        <div className="order-5 col-span-full grid gap-3 md:grid-cols-2 lg:order-5">
          <WorkoutTipCard />
          <WorkoutQuickControlsPanel />
        </div>
      </div>
    </div>
  );
}
