"use client";

import { create } from "zustand";

type Updater<T> = T | ((prev: T) => T);

function resolveUpdate<T>(prev: T, value: Updater<T>): T {
  return typeof value === "function" ? (value as (prev: T) => T)(prev) : value;
}

type SocialModuleUiStore = {
  socialView: "feed" | "explorar";
  socialTab: "publicaciones" | "logros" | "nutricion";
  composerPostType: "publicaciones" | "logros" | "nutricion";
  profileBio: string;
  isBioExpanded: boolean;
  visiblePosts: number;
  hiddenPosts: string[];
  pendingRemovePostId: string | null;
  editingPostId: string | null;
  editingValue: string;
  setSocialView: (value: "feed" | "explorar") => void;
  setSocialTab: (value: "publicaciones" | "logros" | "nutricion") => void;
  setComposerPostType: (value: "publicaciones" | "logros" | "nutricion") => void;
  setProfileBio: (value: Updater<string>) => void;
  setIsBioExpanded: (value: Updater<boolean>) => void;
  setVisiblePosts: (value: Updater<number>) => void;
  setHiddenPosts: (value: Updater<string[]>) => void;
  setPendingRemovePostId: (value: Updater<string | null>) => void;
  setEditingPostId: (value: Updater<string | null>) => void;
  setEditingValue: (value: Updater<string>) => void;
};

export const useSocialModuleUiStore = create<SocialModuleUiStore>((set) => ({
  socialView: "feed",
  socialTab: "publicaciones",
  composerPostType: "publicaciones",
  profileBio: "Atleta enfocado en fuerza, constancia y nutricion inteligente.",
  isBioExpanded: false,
  visiblePosts: 8,
  hiddenPosts: [],
  pendingRemovePostId: null,
  editingPostId: null,
  editingValue: "",
  setSocialView: (value) => set({ socialView: value }),
  setSocialTab: (value) => set({ socialTab: value }),
  setComposerPostType: (value) => set({ composerPostType: value }),
  setProfileBio: (value) => set((state) => ({ profileBio: resolveUpdate(state.profileBio, value) })),
  setIsBioExpanded: (value) => set((state) => ({ isBioExpanded: resolveUpdate(state.isBioExpanded, value) })),
  setVisiblePosts: (value) => set((state) => ({ visiblePosts: resolveUpdate(state.visiblePosts, value) })),
  setHiddenPosts: (value) => set((state) => ({ hiddenPosts: resolveUpdate(state.hiddenPosts, value) })),
  setPendingRemovePostId: (value) =>
    set((state) => ({ pendingRemovePostId: resolveUpdate(state.pendingRemovePostId, value) })),
  setEditingPostId: (value) => set((state) => ({ editingPostId: resolveUpdate(state.editingPostId, value) })),
  setEditingValue: (value) => set((state) => ({ editingValue: resolveUpdate(state.editingValue, value) })),
}));

