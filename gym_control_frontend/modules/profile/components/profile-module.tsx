"use client";

import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import type { ModuleShellProps } from "@/lib/module-shell-props";
import { useProfile } from "@/modules/profile/hooks/use-profile";
import { createPersonalPostAction } from "@/modules/profile/actions/profile.actions";
import {
  EditableProfile,
  loadPublicRoutineVisibility,
  loadEditableProfile,
  persistEditableProfile,
} from "@/modules/profile/actions/profile.interactions";
import { buildOwnContent, buildPeerTimeline } from "@/modules/profile/selectors/profile.selectors";
import { ProfilePeerView } from "@/modules/profile/components/profile-peer-view";
import { ProfileModuleSelfView } from "@/modules/profile/components/profile-module-self-view";
import { useProfileModuleUiStore } from "@/modules/profile/store/use-profile-module-ui-store";

function ProfileModuleShell({ role }: ModuleShellProps) {
  const profileModule = useProfile();
  const user = profileModule.user;
  const profileFocusUserId = profileModule.profileFocusUserId;
  const clearProfileFocus = profileModule.clearProfileFocus;
  const isPeerProfile = Boolean(
    user?.id && profileFocusUserId && profileFocusUserId !== user.id,
  );
  const peerPostsQuery = profileModule.peerPosts;
  const peerMediaQuery = profileModule.peerMedia;
  const peerTimeline = useMemo(
    () => (isPeerProfile && profileFocusUserId ? buildPeerTimeline(peerPostsQuery.data ?? [], peerMediaQuery.data ?? []) : []),
    [isPeerProfile, profileFocusUserId, peerPostsQuery.data, peerMediaQuery.data],
  );
  const peerRoutineVisibility = useMemo(
    () => (isPeerProfile ? loadPublicRoutineVisibility(profileFocusUserId ?? undefined) : null),
    [isPeerProfile, profileFocusUserId],
  );

  const workouts = profileModule.workouts;
  const payments = profileModule.payments;
  const myPostsQuery = profileModule.myPosts;
  const myProfileMediaPostsQuery = profileModule.myProfileMediaPosts;
  const likedPostsQuery = profileModule.likedPosts;
  const createPost = profileModule.createPost;
  const createProfileMediaPost = profileModule.createProfileMediaPost;
  const updateProfile = profileModule.updateProfile;
  const initialProfile: EditableProfile = {
    name: user?.name ?? "Usuario",
    email: user?.email ?? "",
    bio: "Cuéntale a tu comunidad tus objetivos y progreso.",
    avatarUrl: "",
    publishTrainingRoutines: false,
    publishNutritionRoutines: false,
  };
  const isEditingProfile = useProfileModuleUiStore((state) => state.isEditingProfile);
  const setIsEditingProfile = useProfileModuleUiStore((state) => state.setIsEditingProfile);
  const profileFromStore = useProfileModuleUiStore((state) => state.profile);
  const setProfile = useProfileModuleUiStore((state) => state.setProfile);
  const draftProfileFromStore = useProfileModuleUiStore((state) => state.draftProfile);
  const setDraftProfile = useProfileModuleUiStore((state) => state.setDraftProfile);
  const postForm = useProfileModuleUiStore((state) => state.postForm);
  const setPostForm = useProfileModuleUiStore((state) => state.setPostForm);
  const activeSocialTab = useProfileModuleUiStore((state) => state.activeSocialTab);
  const setActiveSocialTab = useProfileModuleUiStore((state) => state.setActiveSocialTab);
  const profile = profileFromStore ?? loadEditableProfile(user?.id, initialProfile);
  const draftProfile = draftProfileFromStore ?? profile;
  const ownContent = useMemo(
    () => buildOwnContent(myPostsQuery.data ?? [], myProfileMediaPostsQuery.data ?? []),
    [myPostsQuery.data, myProfileMediaPostsQuery.data],
  );
  const likedPosts = likedPostsQuery.data ?? [];
  const sessionsCount = (workouts.data ?? []).length;
  const paymentsCount = (payments.data ?? []).length;
  const postsCount = (myPostsQuery.data ?? []).length;
  const streakDays = Math.max(1, Math.min(14, sessionsCount));
  const profileInitials =
    profile.name
      .split(" ")
      .map((chunk) => chunk.trim().charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "GC";

  useEffect(() => {
    if (profileFromStore) return;
    const loaded = loadEditableProfile(user?.id, initialProfile);
    setProfile(loaded);
    setDraftProfile(loaded);
  }, [initialProfile, profileFromStore, setDraftProfile, setProfile, user?.id]);

  useEffect(() => {
    persistEditableProfile(user?.id, profile);
  }, [profile, user?.id]);

  async function onCreatePersonalPost(data: { content: string; mediaUrl: string; alsoShareInSocial: boolean }) {
    if (!user?.id || !data.content.trim()) return;
    try {
      const mode = await createPersonalPostAction({
        userId: user.id,
        content: data.content,
        mediaUrl: data.mediaUrl,
        alsoShareInSocial: data.alsoShareInSocial,
        createPost: async (args) => createPost.mutateAsync(args),
        createProfileMediaPost: async (args) => createProfileMediaPost.mutateAsync(args),
      });
      setPostForm({ content: "", mediaUrl: "", alsoShareInSocial: false });
      toast.success(
        mode === "social_and_profile"
          ? "Publicación creada en tu perfil y en el Área social"
          : "Publicación creada solo en tu perfil",
      );
    } catch (error) {
      if (error instanceof Error && error.message === "MISSING_PROFILE_MEDIA_URL") {
        toast.error("Para publicar solo en tu perfil agrega una imagen");
        return;
      }
      toast.error("No se pudo publicar en tu perfil");
    }
  }

  async function onSaveProfileDraft(nextDraft: EditableProfile) {
    const prevProfile = profile;
    setProfile(nextDraft);
    try {
      await updateProfile.mutateAsync({
        name: nextDraft.name,
        email: nextDraft.email,
        bio: nextDraft.bio,
      });
      setIsEditingProfile(false);
      toast.success("Perfil actualizado");
    } catch {
      setProfile(prevProfile);
      setDraftProfile(prevProfile);
    }
  }

  if (isPeerProfile && profileFocusUserId) {
    return (
      <ProfilePeerView
        role={role}
        profileFocusUserId={profileFocusUserId}
        peerTimeline={peerTimeline}
        peerLoading={peerPostsQuery.isPending || peerMediaQuery.isPending}
        peerRoutineVisibility={peerRoutineVisibility}
        onBack={() => clearProfileFocus()}
      />
    );
  }

  return (
    <ProfileModuleSelfView
      role={role}
      profile={profile}
      profileInitials={profileInitials}
      sessionsCount={sessionsCount}
      postsCount={postsCount}
      paymentsCount={paymentsCount}
      streakDays={streakDays}
      userEmail={user?.email ?? undefined}
      workouts={workouts.data ?? []}
      postForm={postForm}
      onCreatePersonalPost={onCreatePersonalPost}
      isSubmittingPost={createPost.isPending || createProfileMediaPost.isPending}
      activeSocialTab={activeSocialTab}
      onSocialTabChange={setActiveSocialTab}
      ownContent={ownContent}
      likedPosts={likedPosts}
      isEditingProfile={isEditingProfile}
      onEditingChange={setIsEditingProfile}
      onEditClick={() => setIsEditingProfile(true)}
      draftProfile={draftProfile}
      setDraftProfile={setDraftProfile}
      isSavingProfile={updateProfile.isPending}
      onSaveDraft={onSaveProfileDraft}
    />
  );
}

export function ProfileModule(props: ModuleShellProps) {
  return <ProfileModuleShell {...props} />;
}
