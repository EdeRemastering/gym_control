"use client";

import { useEffect, useRef } from "react";
import { useTrainingModuleStore } from "@/modules/training/stores/use-training-module-store";

/**
 * Ticks de sesión en vivo y temporizador de descanso.
 * Toda la lógica de tiempo vive aquí, no en componentes de presentación.
 */
export function useTrainingModuleBootstrap() {
  const isWorkoutMode = useTrainingModuleStore((s) => s.isWorkoutMode);
  const trainingTab = useTrainingModuleStore((s) => s.trainingTab);
  const isRestRunning = useTrainingModuleStore((s) => s.isRestRunning);
  const isRestPaused = useTrainingModuleStore((s) => s.isRestPaused);
  const setSessionElapsedSeconds = useTrainingModuleStore((s) => s.setSessionElapsedSeconds);
  const setRestSeconds = useTrainingModuleStore((s) => s.setRestSeconds);
  const setIsRestRunning = useTrainingModuleStore((s) => s.setIsRestRunning);
  const setIsRestPaused = useTrainingModuleStore((s) => s.setIsRestPaused);

  const wasWorkoutMode = useRef(false);

  useEffect(() => {
    if (isWorkoutMode && !wasWorkoutMode.current) {
      setSessionElapsedSeconds(0);
    }
    wasWorkoutMode.current = isWorkoutMode;
  }, [isWorkoutMode, setSessionElapsedSeconds]);

  useEffect(() => {
    if (!isWorkoutMode) {
      setIsRestRunning(false);
      setIsRestPaused(false);
    }
  }, [isWorkoutMode, setIsRestPaused, setIsRestRunning]);

  useEffect(() => {
    if (!isWorkoutMode || trainingTab !== "session") return;
    const id = window.setInterval(() => {
      setSessionElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [isWorkoutMode, trainingTab, setSessionElapsedSeconds]);

  useEffect(() => {
    if (!isRestRunning || isRestPaused) return;
    const id = window.setInterval(() => {
      const st = useTrainingModuleStore.getState();
      if (st.restSeconds <= 1) {
        st.setIsRestRunning(false);
        st.setRestSeconds(0);
        st.setIsRestPaused(false);
        return;
      }
      st.setRestSeconds((r) => Math.max(0, r - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [isRestRunning, isRestPaused, setIsRestRunning, setIsRestPaused, setRestSeconds]);
}
