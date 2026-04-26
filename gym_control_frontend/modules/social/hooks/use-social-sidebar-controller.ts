"use client";

import { useMemo } from "react";
import { Heart, Target, TrendingUp, Users } from "lucide-react";
import { useSchedule } from "@/hooks/use-zudel-query";
import { useSocial } from "@/modules/social/hooks/use-social";

type FeedPost = {
  id: string;
  userId: string;
  likeCount?: number;
  comments?: Array<unknown>;
};

export function useSocialSidebarController(visibleFeedPosts: FeedPost[], bannerMemberCount: number) {
  const socialModule = useSocial();
  const posts = socialModule.postsQuery;
  const schedule = useSchedule();

  const gymPosts = useMemo(() => posts.data ?? [], [posts.data]);
  const nextClasses = useMemo(
    () =>
      (schedule.data ?? []).slice(0, 3).map((session) => ({
        id: session.id,
        title: session.title,
        subtitle: `${session.startsAt} - ${session.trainer}`,
        spots: Math.max(0, Math.round((100 - session.occupancy) / 10)),
      })),
    [schedule.data],
  );

  const metrics = useMemo(() => {
    const totalPosts = gymPosts.length;
    const totalLikes = gymPosts.reduce((acc, post) => acc + Number(post.likeCount ?? 0), 0);
    const totalComments = gymPosts.reduce((acc, post) => acc + (post.comments?.length ?? 0), 0);
    const performance = totalPosts ? Math.min(100, Math.round((totalLikes + totalComments * 2) / totalPosts)) : 0;
    return [
      { id: "posts", label: "Publicaciones", value: totalPosts, description: "Este mes", icon: TrendingUp },
      { id: "engagement", label: "Interacciones", value: totalLikes + totalComments, description: "Likes + comentarios", icon: Heart },
      { id: "members", label: "Miembros activos", value: bannerMemberCount, description: "En tu comunidad", icon: Users },
      { id: "consistency", label: "Nivel de constancia", value: `${performance}%`, description: "Participacion social", icon: Target },
    ];
  }, [gymPosts, bannerMemberCount]);

  const liveActivity = useMemo(
    () =>
      visibleFeedPosts.slice(0, 3).map((post, index) => ({
        id: post.id,
        userLabel: `Miembro ${index + 1}`,
        status: index === 0 ? "Entrenando ahora" : index === 1 ? "Completó su rutina" : "Nuevo PR en sentadilla",
        time: index === 0 ? "Ahora" : index === 1 ? "Hace 5 min" : "Hace 12 min",
      })),
    [visibleFeedPosts],
  );

  const topMembers = useMemo(() => {
    const scoreMap = new Map<string, number>();
    for (const post of visibleFeedPosts) {
      const score = Number(post.likeCount ?? 0) + (post.comments?.length ?? 0) * 2 + 5;
      scoreMap.set(post.userId, (scoreMap.get(post.userId) ?? 0) + score);
    }
    return [...scoreMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([userId, score], index) => ({
        id: userId,
        rank: index + 1,
        handle: `@${userId.slice(0, 10)}`,
        score,
      }));
  }, [visibleFeedPosts]);

  return {
    metrics,
    liveActivity,
    nextClasses,
    topMembers,
    isSchedulePending: schedule.isPending,
  };
}

