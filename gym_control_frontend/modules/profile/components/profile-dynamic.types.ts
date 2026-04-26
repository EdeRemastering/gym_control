import type { EditableProfile } from "@/modules/profile/actions/profile.interactions";

export type ProfilePostItem = {
  id: string;
  content: string;
  mediaUrl?: string | null;
};

export type ProfilePostFormState = {
  content: string;
  mediaUrl: string;
  alsoShareInSocial: boolean;
};

export type ProfileStats = {
  sessionsCount: number;
  paymentsCount: number;
  postsCount: number;
  streakDays: number;
};

export type ProfileHeaderMeta = {
  profile: EditableProfile;
  role: string;
  profileInitials: string;
  sessionsCount: number;
  postsCount: number;
  streakDays: number;
  onEdit: () => void;
  userEmail?: string;
};
