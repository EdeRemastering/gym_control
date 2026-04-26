"use client";

import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ProfilePostItem } from "@/modules/profile/components/profile-dynamic.types";

type Props = {
  activeSocialTab: "own" | "liked";
  onTabChange: (tab: "own" | "liked") => void;
  ownContent: ProfilePostItem[];
  likedPosts: ProfilePostItem[];
};

export function ProfileSocialActivityCard({ activeSocialTab, onTabChange, ownContent, likedPosts }: Props) {
  const items = activeSocialTab === "own" ? ownContent : likedPosts;

  return (
    <Card className="border-[var(--border)] bg-[linear-gradient(180deg,rgba(14,24,37,0.96),rgba(8,14,26,0.97))] lg:col-span-8">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white">Actividad social reciente</p>
        <Button size="sm" variant="ghost">
          Ver todo
        </Button>
      </div>
      <div className="mt-3 flex items-center gap-2 border-b border-white/10 pb-2">
        <Button size="sm" variant={activeSocialTab === "own" ? "secondary" : "ghost"} onClick={() => onTabChange("own")}>
          Mis publicaciones
        </Button>
        <Button size="sm" variant={activeSocialTab === "liked" ? "secondary" : "ghost"} onClick={() => onTabChange("liked")}>
          Me gusta
        </Button>
      </div>
      <div className="mt-2.5 space-y-2">
        {items.slice(0, 2).map((post) => (
          <article key={post.id} className="overflow-hidden rounded-lg border border-[var(--border)] bg-white/5">
            {post.mediaUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.mediaUrl} alt="media publicación" className="h-28 w-full object-cover" />
            ) : null}
            <div className="p-2.5">
              <div className="mb-1.5 flex items-center gap-2 text-xs text-[var(--muted)]">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-400/10 text-[10px] text-cyan-200">
                  AD
                </span>
                <span>Admin Downtown</span>
                <span>·</span>
                <span>hace 2 horas</span>
              </div>
              <p className="line-clamp-2 text-sm text-white">{post.content}</p>
              <div className="mt-2 flex items-center gap-4 text-xs text-[var(--muted)]">
                <span className="inline-flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" />
                  24
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" />6
                </span>
                <span className="inline-flex items-center gap-1">
                  <Share2 className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </article>
        ))}
        {items.length === 0 ? (
          <p className="rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-[var(--muted)]">
            {activeSocialTab === "own"
              ? "Aún no has publicado contenido en tu perfil."
              : "Aún no tienes publicaciones marcadas con me gusta."}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
