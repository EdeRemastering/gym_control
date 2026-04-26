"use client";
import { ProfileAchievementsCard } from "@/modules/profile/components/profile-achievements-card";
import { ProfileDynamicHeader } from "@/modules/profile/components/profile-dynamic-header";
import { ProfileEditDialog } from "@/modules/profile/components/profile-edit-dialog";
import { ProfileMetricsCard } from "@/modules/profile/components/profile-metrics-card";
import { ProfilePrivacyCard } from "@/modules/profile/components/profile-privacy-card";
import { ProfilePublishCard } from "@/modules/profile/components/profile-publish-card";
import { ProfileSocialActivityCard } from "@/modules/profile/components/profile-social-activity-card";
import { ProfileTrainingHistoryCard } from "@/modules/profile/components/profile-training-history-card";
import { ProfileFlow } from "@/modules/profile/flows/profile-flow";
import type { EditableProfile } from "@/modules/profile/actions/profile.interactions";

type ProfileModuleSelfViewProps = {
  role: string;
  profile: EditableProfile;
  profileInitials: string;
  sessionsCount: number;
  postsCount: number;
  paymentsCount: number;
  streakDays: number;
  userEmail?: string;
  workouts: Array<{
    id: string;
    name: string;
    completedAt: string;
    durationMin: number;
    score?: number;
  }>;
  postForm: {
    content: string;
    mediaUrl: string;
    alsoShareInSocial: boolean;
  };
  onCreatePersonalPost: (data: { content: string; mediaUrl: string; alsoShareInSocial: boolean }) => Promise<void>;
  isSubmittingPost: boolean;
  activeSocialTab: "publicaciones" | "likes";
  onSocialTabChange: (tab: "publicaciones" | "likes") => void;
  ownContent: Array<{
    id: string;
    content: string;
    createdAt: string;
    likeCount?: number;
    commentCount?: number;
    mediaUrl?: string;
    type: "POST" | "MEDIA";
  }>;
  likedPosts: Array<{
    id: string;
    content: string;
    createdAt: string;
    likeCount?: number;
    commentCount?: number;
  }>;
  isEditingProfile: boolean;
  onEditingChange: (open: boolean) => void;
  onEditClick: () => void;
  draftProfile: EditableProfile;
  setDraftProfile: (value: EditableProfile) => void;
  isSavingProfile: boolean;
  onSaveDraft: (nextDraft: EditableProfile) => Promise<void>;
};

export function ProfileModuleSelfView({
  role,
  profile,
  profileInitials,
  sessionsCount,
  postsCount,
  paymentsCount,
  streakDays,
  userEmail,
  workouts,
  postForm,
  onCreatePersonalPost,
  isSubmittingPost,
  activeSocialTab,
  onSocialTabChange,
  ownContent,
  likedPosts,
  isEditingProfile,
  onEditingChange,
  onEditClick,
  draftProfile,
  setDraftProfile,
  isSavingProfile,
  onSaveDraft,
}: ProfileModuleSelfViewProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <ProfileDynamicHeader
        profile={profile}
        role={role}
        profileInitials={profileInitials}
        sessionsCount={sessionsCount}
        postsCount={postsCount}
        streakDays={streakDays}
        onEdit={onEditClick}
        userEmail={userEmail}
      />

      <ProfileMetricsCard sessionsCount={sessionsCount} paymentsCount={paymentsCount} postsCount={postsCount} streakDays={streakDays} />

      <ProfilePrivacyCard profile={profile} onEdit={onEditClick} />

      <ProfileTrainingHistoryCard workouts={workouts} />

      <ProfilePublishCard
        initialForm={postForm}
        onSubmit={onCreatePersonalPost}
        isSubmitting={isSubmittingPost}
      />

      <ProfileSocialActivityCard
        activeSocialTab={activeSocialTab}
        onTabChange={onSocialTabChange}
        ownContent={ownContent}
        likedPosts={likedPosts}
      />

      <ProfileAchievementsCard />

      <div className="lg:col-span-12">
        <ProfileFlow />
      </div>

      <ProfileEditDialog
        open={isEditingProfile}
        onOpenChange={onEditingChange}
        draftProfile={draftProfile}
        setDraftProfile={setDraftProfile}
        profile={profile}
        isSaving={isSavingProfile}
        onSaveDraft={onSaveDraft}
      />
    </div>
  );
}

