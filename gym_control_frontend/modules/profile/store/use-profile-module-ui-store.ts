"use client";

import { create } from "zustand";
import type { EditableProfile } from "@/modules/profile/actions/profile.interactions";
import type { ProfilePostFormState } from "@/modules/profile/components/profile-dynamic.types";

type Updater<T> = T | ((prev: T) => T);

function resolveUpdate<T>(prev: T, value: Updater<T>): T {
  return typeof value === "function" ? (value as (prev: T) => T)(prev) : value;
}

type ProfileModuleUiStore = {
  isEditingProfile: boolean;
  profile: EditableProfile | null;
  draftProfile: EditableProfile | null;
  postForm: ProfilePostFormState;
  activeSocialTab: "own" | "liked";
  setIsEditingProfile: (value: Updater<boolean>) => void;
  setProfile: (value: Updater<EditableProfile | null>) => void;
  setDraftProfile: (value: Updater<EditableProfile | null>) => void;
  setPostForm: (value: Updater<ProfilePostFormState>) => void;
  setActiveSocialTab: (value: "own" | "liked") => void;
};

const defaultPostForm: ProfilePostFormState = {
  content: "",
  mediaUrl: "",
  alsoShareInSocial: false,
};

export const useProfileModuleUiStore = create<ProfileModuleUiStore>((set) => ({
  isEditingProfile: false,
  profile: null,
  draftProfile: null,
  postForm: defaultPostForm,
  activeSocialTab: "own",
  setIsEditingProfile: (value) => set((state) => ({ isEditingProfile: resolveUpdate(state.isEditingProfile, value) })),
  setProfile: (value) => set((state) => ({ profile: resolveUpdate(state.profile, value) })),
  setDraftProfile: (value) => set((state) => ({ draftProfile: resolveUpdate(state.draftProfile, value) })),
  setPostForm: (value) => set((state) => ({ postForm: resolveUpdate(state.postForm, value) })),
  setActiveSocialTab: (value) => set({ activeSocialTab: value }),
}));

