"use client";

import { create } from "zustand";

type Updater<T> = T | ((prev: T) => T);

function resolveUpdate<T>(prev: T, value: Updater<T>): T {
  return typeof value === "function" ? (value as (prev: T) => T)(prev) : value;
}

function getInitialWeekStartUtc() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const mondayOffset = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - mondayOffset);
  return start;
}

type SchedulingModuleUiStore = {
  weekStartUtc: Date;
  selectedClassId: string | null;
  rescheduleSessionId: string | null;
  rescheduleStartAt: string;
  rescheduleEndAt: string;
  draggingSessionId: string | null;
  dragOverCell: string | null;
  createCellKey: string | null;
  createCellDayIndex: number;
  createCellHour: string;
  createCellName: string;
  createCellDescription: string;
  createCellCapacity: string;
  setWeekStartUtc: (value: Updater<Date>) => void;
  setSelectedClassId: (value: Updater<string | null>) => void;
  setRescheduleSessionId: (value: Updater<string | null>) => void;
  setRescheduleStartAt: (value: Updater<string>) => void;
  setRescheduleEndAt: (value: Updater<string>) => void;
  setDraggingSessionId: (value: Updater<string | null>) => void;
  setDragOverCell: (value: Updater<string | null>) => void;
  setCreateCellKey: (value: Updater<string | null>) => void;
  setCreateCellDayIndex: (value: Updater<number>) => void;
  setCreateCellHour: (value: Updater<string>) => void;
  setCreateCellName: (value: Updater<string>) => void;
  setCreateCellDescription: (value: Updater<string>) => void;
  setCreateCellCapacity: (value: Updater<string>) => void;
};

export const useSchedulingModuleUiStore = create<SchedulingModuleUiStore>((set) => ({
  weekStartUtc: getInitialWeekStartUtc(),
  selectedClassId: null,
  rescheduleSessionId: null,
  rescheduleStartAt: "",
  rescheduleEndAt: "",
  draggingSessionId: null,
  dragOverCell: null,
  createCellKey: null,
  createCellDayIndex: 0,
  createCellHour: "06:00",
  createCellName: "",
  createCellDescription: "",
  createCellCapacity: "20",
  setWeekStartUtc: (value) => set((state) => ({ weekStartUtc: resolveUpdate(state.weekStartUtc, value) })),
  setSelectedClassId: (value) => set((state) => ({ selectedClassId: resolveUpdate(state.selectedClassId, value) })),
  setRescheduleSessionId: (value) =>
    set((state) => ({ rescheduleSessionId: resolveUpdate(state.rescheduleSessionId, value) })),
  setRescheduleStartAt: (value) => set((state) => ({ rescheduleStartAt: resolveUpdate(state.rescheduleStartAt, value) })),
  setRescheduleEndAt: (value) => set((state) => ({ rescheduleEndAt: resolveUpdate(state.rescheduleEndAt, value) })),
  setDraggingSessionId: (value) =>
    set((state) => ({ draggingSessionId: resolveUpdate(state.draggingSessionId, value) })),
  setDragOverCell: (value) => set((state) => ({ dragOverCell: resolveUpdate(state.dragOverCell, value) })),
  setCreateCellKey: (value) => set((state) => ({ createCellKey: resolveUpdate(state.createCellKey, value) })),
  setCreateCellDayIndex: (value) =>
    set((state) => ({ createCellDayIndex: resolveUpdate(state.createCellDayIndex, value) })),
  setCreateCellHour: (value) => set((state) => ({ createCellHour: resolveUpdate(state.createCellHour, value) })),
  setCreateCellName: (value) => set((state) => ({ createCellName: resolveUpdate(state.createCellName, value) })),
  setCreateCellDescription: (value) =>
    set((state) => ({ createCellDescription: resolveUpdate(state.createCellDescription, value) })),
  setCreateCellCapacity: (value) =>
    set((state) => ({ createCellCapacity: resolveUpdate(state.createCellCapacity, value) })),
}));

