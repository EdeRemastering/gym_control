"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProfileFlow } from "@/modules/profile/flows/profile-flow";

type PeerPostItem = {
  id: string;
  content: string;
  mediaUrl?: string | null;
  createdAt: string;
};

type ProfilePeerViewProps = {
  role: string;
  profileFocusUserId: string;
  peerTimeline: PeerPostItem[];
  peerLoading: boolean;
  peerRoutineVisibility: { publishTrainingRoutines: boolean; publishNutritionRoutines: boolean } | null;
  onBack: () => void;
};

export function ProfilePeerView({
  role,
  profileFocusUserId,
  peerTimeline,
  peerLoading,
  peerRoutineVisibility,
  onBack,
}: ProfilePeerViewProps) {
  const peerInitials = profileFocusUserId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "GC";
  const latestPost = peerTimeline[0];
  const morePosts = peerTimeline.slice(1, 8);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-3">
        <Button type="button" variant="ghost" size="sm" className="gap-2 text-white/80 hover:text-white" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Volver a mi perfil
        </Button>
      </div>

      <Card className="lg:col-span-2 overflow-hidden p-0">
        <div className="h-28 bg-gradient-to-r from-zinc-800 to-zinc-900" />
        <div className="p-4">
          <div className="-mt-10 flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border)] bg-zinc-800 text-lg font-semibold text-white">
              {peerInitials}
            </div>
            <div>
              <p className="text-lg font-semibold text-white">Miembro del gimnasio</p>
              <p className="text-xs text-[var(--muted)]">@{profileFocusUserId}</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">Vista desde el area social. Rol que navega: {role}.</p>
        </div>
      </Card>

      <Card>
        <p className="text-sm text-[var(--muted)]">Resumen</p>
        <div className="mt-3 space-y-2 text-sm text-white">
          <p>Publicaciones visibles: {peerTimeline.length}</p>
          {peerLoading ? <p className="text-xs text-[var(--muted)]">Cargando...</p> : null}
        </div>
      </Card>

      <Card>
        <p className="text-sm text-[var(--muted)]">Rutinas publicas</p>
        <div className="mt-3 space-y-2 text-sm text-white">
          <p>
            Entrenamiento:{" "}
            <span className={peerRoutineVisibility?.publishTrainingRoutines ? "text-emerald-300" : "text-[var(--muted)]"}>
              {peerRoutineVisibility?.publishTrainingRoutines ? "Visible" : "Oculta"}
            </span>
          </p>
          <p>
            Nutricion:{" "}
            <span className={peerRoutineVisibility?.publishNutritionRoutines ? "text-emerald-300" : "text-[var(--muted)]"}>
              {peerRoutineVisibility?.publishNutritionRoutines ? "Visible" : "Oculta"}
            </span>
          </p>
        </div>
      </Card>

      <Card className="lg:col-span-3">
        <p className="text-sm font-medium text-white">Ultima publicacion</p>
        {!peerLoading && !latestPost ? (
          <p className="mt-4 rounded-lg border border-[var(--border)] bg-white/5 p-4 text-sm text-[var(--muted)]">
            Este miembro aun no tiene publicaciones visibles en el gimnasio.
          </p>
        ) : null}
        {latestPost ? (
          <article className="mt-4 overflow-hidden rounded-xl border border-[var(--border)] bg-white/5">
            {latestPost.mediaUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={latestPost.mediaUrl} alt="Ultima publicacion" className="max-h-[min(420px,70vh)] w-full object-cover" />
            ) : null}
            <div className="p-3">
              <p className="text-xs text-[var(--muted)]">{new Date(latestPost.createdAt).toLocaleString()}</p>
              <p className="mt-2 text-sm text-white">{latestPost.content}</p>
            </div>
          </article>
        ) : null}
      </Card>

      {morePosts.length > 0 ? (
        <Card className="lg:col-span-3">
          <p className="text-sm text-[var(--muted)]">Publicaciones anteriores</p>
          <div className="mt-3 space-y-2">
            {morePosts.map((post) => (
              <article key={post.id} className="overflow-hidden rounded-lg border border-[var(--border)] bg-white/5">
                {post.mediaUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.mediaUrl} alt="" className="h-32 w-full object-cover" />
                ) : null}
                <div className="p-2">
                  <p className="text-xs text-[var(--muted)]">{new Date(post.createdAt).toLocaleString()}</p>
                  <p className="mt-1 text-sm text-white">{post.content}</p>
                </div>
              </article>
            ))}
          </div>
        </Card>
      ) : null}

      <div className="lg:col-span-3">
        <ProfileFlow />
      </div>
    </div>
  );
}

