"use client";

import type { ModuleShellProps } from "@/lib/module-shell-props";
import { SocialModuleComposer } from "@/modules/social/components/social-module-composer";
import { SocialModuleDialogs } from "@/modules/social/components/social-module-dialogs";
import { SocialModuleFeed } from "@/modules/social/components/social-module-feed";
import { SocialModuleHero } from "@/modules/social/components/social-module-hero";
import { SocialModuleMobileCta } from "@/modules/social/components/social-module-mobile-cta";
import { SocialModuleSidebar } from "@/modules/social/components/social-module-sidebar";
import { useSocialDialogsController } from "@/modules/social/hooks/use-social-dialogs-controller";
import { useSocialFeedController } from "@/modules/social/hooks/use-social-feed-controller";
import { useSocialSidebarController } from "@/modules/social/hooks/use-social-sidebar-controller";

function SocialModuleShell({ role }: ModuleShellProps) {
  const feedController = useSocialFeedController();
  const sidebarController = useSocialSidebarController(feedController.visibleFeedPosts, feedController.bannerMemberCount);
  const dialogsController = useSocialDialogsController(feedController.visibleFeedPosts);

  return (
    <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_310px]">
      <div className="min-w-0 max-w-none space-y-3">
        <SocialModuleHero
          socialView={feedController.socialView}
          setSocialView={feedController.setSocialView}
          currentGymName={feedController.currentGymName}
          currentUserId={feedController.currentUser?.id}
          role={role}
          profileBio={feedController.profileBio}
          isBioExpanded={feedController.isBioExpanded}
          setIsBioExpanded={feedController.setIsBioExpanded}
          setProfileBio={feedController.setProfileBio}
          bannerMemberCount={feedController.bannerMemberCount}
          bannerOnlineCount={feedController.bannerOnlineCount}
          visibleFeedPostsCount={feedController.visibleFeedPosts.length}
          onFocusComposer={feedController.onFocusComposer}
        />

        <SocialModuleComposer
          socialView={feedController.socialView}
          onCreatePost={feedController.submitPost}
          initialPostContent=""
          composerPostType={feedController.composerPostType}
          setComposerPostType={feedController.setComposerPostType}
          isCreatePending={feedController.isCreatePending}
        />

        <SocialModuleFeed
          socialView={feedController.socialView}
          socialTab={feedController.socialTab}
          setSocialTab={feedController.setSocialTab}
          activePostsQuery={feedController.activePostsQuery}
          tabbedFeedPosts={feedController.tabbedFeedPosts}
          visiblePosts={feedController.visiblePosts}
          setVisiblePosts={feedController.setVisiblePosts}
          editedContentByPost={feedController.editedContentByPost}
          openEditor={feedController.openEditor}
          setPendingRemovePostId={feedController.setPendingRemovePostId}
          isLoadingLike={feedController.isLoadingLike}
          localLikeState={feedController.localLikeState}
          localLikes={feedController.localLikes}
          toggleLike={feedController.toggleLike}
          pendingPostIds={feedController.pendingPostIds}
          commentsOpenByPost={feedController.commentsOpenByPost}
          setCommentsOpenByPost={feedController.setCommentsOpenByPost}
          localComments={feedController.localComments}
          commentByPost={feedController.commentByPost}
          setCommentByPost={feedController.setCommentByPost}
          submitComment={feedController.submitComment}
          replyingToByPost={feedController.replyingToByPost}
          setReplyingToByPost={feedController.setReplyingToByPost}
          replyByCommentId={feedController.replyByCommentId}
          setReplyByCommentId={feedController.setReplyByCommentId}
          submitReply={feedController.submitReply}
        />
      </div>

      <SocialModuleSidebar
        metrics={sidebarController.metrics}
        liveActivity={sidebarController.liveActivity}
        nextClasses={sidebarController.nextClasses}
        topMembers={sidebarController.topMembers}
        isSchedulePending={sidebarController.isSchedulePending}
      />

      <SocialModuleDialogs
        pendingRemovePost={dialogsController.pendingRemovePost}
        setPendingRemovePostId={dialogsController.setPendingRemovePostId}
        setHiddenPosts={dialogsController.setHiddenPosts}
        editingPostId={dialogsController.editingPostId}
        setEditingPostId={dialogsController.setEditingPostId}
        editingValue={dialogsController.editingValue}
        setEditingValue={dialogsController.setEditingValue}
        setEditedContentByPost={dialogsController.setEditedContentByPost}
      />

      <SocialModuleMobileCta onFocusComposer={feedController.onFocusComposer} />
    </div>
  );
}

export function SocialModule(props: ModuleShellProps) {
  return <SocialModuleShell {...props} />;
}
