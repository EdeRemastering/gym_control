"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Camera, Pencil, Send, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useLikedSocialPosts,
  useMyProfileMediaPosts,
  useMySocialPosts,
  usePayments,
  useProfileMediaPostsForUser,
  useSocialPostsByUserId,
  useWorkoutSessions,
} from "@/hooks/use-gym-query";
import { useCreateProfileMediaPost, useCreateSocialPost } from "@/hooks/use-gym-mutations";
import type { ModuleShellProps } from "@/lib/module-shell-props";
import { useProfileNavStore } from "@/lib/profile-nav-store";
import { useSessionStore } from "@/lib/session-store";
import { ProfileFlow } from "@/modules/profile/flows/profile-flow";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EditableProfile {
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
}

export function ProfileModule({ role }: ModuleShellProps) {
  const user = useSessionStore((state) => state.user);
  const profileFocusUserId = useProfileNavStore((state) => state.profileFocusUserId);
  const clearProfileFocus = useProfileNavStore((state) => state.clearProfileFocus);
  const isPeerProfile = Boolean(
    user?.id && profileFocusUserId && profileFocusUserId !== user.id,
  );
  const peerPostsQuery = useSocialPostsByUserId(isPeerProfile ? profileFocusUserId : null);
  const peerMediaQuery = useProfileMediaPostsForUser(isPeerProfile ? profileFocusUserId : null);
  const peerTimeline = useMemo(() => {
    if (!isPeerProfile || !profileFocusUserId) return [];
    const social = (peerPostsQuery.data ?? []).map((p) => ({
      id: p.id,
      content: p.content,
      mediaUrl: p.mediaUrl ?? undefined,
      createdAt: p.createdAt,
    }));
    const media = (peerMediaQuery.data ?? []).map((post) => ({
      id: `profile-${post.id}`,
      content: post.caption ?? "Publicación de perfil",
      mediaUrl: post.mediaUrl,
      createdAt: post.createdAt,
    }));
    return [...social, ...media].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [isPeerProfile, profileFocusUserId, peerPostsQuery.data, peerMediaQuery.data]);

  const workouts = useWorkoutSessions();
  const payments = usePayments();
  const myPostsQuery = useMySocialPosts();
  const myProfileMediaPostsQuery = useMyProfileMediaPosts();
  const likedPostsQuery = useLikedSocialPosts();
  const createPost = useCreateSocialPost();
  const createProfileMediaPost = useCreateProfileMediaPost();
  const initialProfile: EditableProfile = {
    name: user?.name ?? "Usuario",
    email: user?.email ?? "",
    bio: "Cuéntale a tu comunidad tus objetivos y progreso.",
    avatarUrl: "",
  };
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profile, setProfile] = useState<EditableProfile>(() => {
    if (typeof window === "undefined" || !user?.id) return initialProfile;
    const saved = window.localStorage.getItem(`profile-custom-${user.id}`);
    if (!saved) return initialProfile;
    try {
      return JSON.parse(saved) as EditableProfile;
    } catch {
      return initialProfile;
    }
  });
  const [draftProfile, setDraftProfile] = useState(profile);
  const [postForm, setPostForm] = useState({ content: "", mediaUrl: "", alsoShareInSocial: false });
  const [activeSocialTab, setActiveSocialTab] = useState<"own" | "liked">("own");
  const ownPosts = myPostsQuery.data ?? [];
  const ownProfileMediaPosts = myProfileMediaPostsQuery.data ?? [];
  const ownProfileOnlyPosts = ownProfileMediaPosts.map((post) => ({
    id: `profile-${post.id}`,
    content: post.caption ?? "Publicación de perfil",
    mediaUrl: post.mediaUrl,
    createdAt: post.createdAt,
  }));
  const ownContent = [...ownPosts, ...ownProfileOnlyPosts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const likedPosts = likedPostsQuery.data ?? [];

  useEffect(() => {
    if (!user?.id) return;
    window.localStorage.setItem(`profile-custom-${user.id}`, JSON.stringify(profile));
  }, [profile, user?.id]);

  async function onCreatePersonalPost(event: FormEvent) {
    event.preventDefault();
    if (!user?.id || !postForm.content.trim()) return;
    if (postForm.alsoShareInSocial) {
      await createPost.mutateAsync({
        userId: user.id,
        content: postForm.content.trim(),
        mediaUrl: postForm.mediaUrl.trim() || undefined,
      });
      setPostForm({ content: "", mediaUrl: "", alsoShareInSocial: false });
      toast.success("Publicación creada en tu perfil y en el Área social");
      return;
    }

    if (!postForm.mediaUrl.trim()) {
      toast.error("Para publicar solo en tu perfil agrega una imagen");
      return;
    }
    await createProfileMediaPost.mutateAsync({
      userId: user.id,
      type: "IMAGE",
      mediaUrl: postForm.mediaUrl.trim(),
      caption: postForm.content.trim(),
    });
    setPostForm({ content: "", mediaUrl: "", alsoShareInSocial: false });
    toast.success("Publicación creada solo en tu perfil");
  }

  if (isPeerProfile && profileFocusUserId) {
    const peerInitials =
      profileFocusUserId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "GC";
    const latestPost = peerTimeline[0];
    const morePosts = peerTimeline.slice(1, 8);
    const peerLoading = peerPostsQuery.isPending || peerMediaQuery.isPending;

    return (
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2 text-white/80 hover:text-white"
            onClick={() => clearProfileFocus()}
          >
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
            <p className="mt-3 text-sm text-[var(--muted)]">
              Vista desde el área social. Rol que navega: {role}.
            </p>
          </div>
        </Card>

        <Card>
          <p className="text-sm text-[var(--muted)]">Resumen</p>
          <div className="mt-3 space-y-2 text-sm text-white">
            <p>Publicaciones visibles: {peerTimeline.length}</p>
            {peerLoading ? <p className="text-xs text-[var(--muted)]">Cargando…</p> : null}
          </div>
        </Card>

        <Card className="lg:col-span-3">
          <p className="text-sm font-medium text-white">Última publicación</p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            Lo más reciente entre el feed social y las publicaciones de perfil con imagen.
          </p>
          {peerLoading && !latestPost ? (
            <p className="mt-4 rounded-lg border border-[var(--border)] bg-white/5 p-4 text-sm text-[var(--muted)]">
              Cargando publicaciones…
            </p>
          ) : null}
          {!peerLoading && !latestPost ? (
            <p className="mt-4 rounded-lg border border-[var(--border)] bg-white/5 p-4 text-sm text-[var(--muted)]">
              Este miembro aún no tiene publicaciones visibles en el gimnasio.
            </p>
          ) : null}
          {latestPost ? (
            <article className="mt-4 overflow-hidden rounded-xl border border-[var(--border)] bg-white/5">
              {latestPost.mediaUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={latestPost.mediaUrl}
                  alt="Última publicación"
                  className="max-h-[min(420px,70vh)] w-full object-cover"
                />
              ) : null}
              <div className="p-3">
                <p className="text-xs text-[var(--muted)]">
                  {new Date(latestPost.createdAt).toLocaleString()}
                </p>
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
                <article
                  key={post.id}
                  className="overflow-hidden rounded-lg border border-[var(--border)] bg-white/5"
                >
                  {post.mediaUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.mediaUrl}
                      alt=""
                      className="h-32 w-full object-cover"
                    />
                  ) : null}
                  <div className="p-2">
                    <p className="text-xs text-[var(--muted)]">
                      {new Date(post.createdAt).toLocaleString()}
                    </p>
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

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2 overflow-hidden p-0">
        <div className="h-28 bg-gradient-to-r from-[var(--primary)]/70 to-cyan-500/50" />
        <div className="p-4">
          <div className="-mt-10 flex items-center gap-3">
            <div className="h-16 w-16 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatarUrl} alt="avatar perfil" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div>
              <p className="text-lg font-semibold text-white">{profile.name}</p>
              <p className="text-xs text-[var(--muted)]">{profile.email || user?.email}</p>
            </div>
            <Button size="icon" variant="ghost" className="ml-auto" onClick={() => setIsEditingProfile(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">{profile.bio}</p>
        </div>
      </Card>

      <Card>
        <p className="text-sm text-[var(--muted)]">Métricas</p>
        <div className="mt-3 space-y-2 text-sm text-white">
          <p>Rol activo: {role}</p>
          <p>Sesiones: {(workouts.data ?? []).length}</p>
          <p>Pagos: {(payments.data ?? []).length}</p>
          <p>Posts: {ownPosts.length}</p>
        </div>
      </Card>

      <Card>
        <p className="text-sm text-[var(--muted)]">Historial de entrenamiento</p>
        <div className="mt-3 space-y-2">
          {(workouts.data ?? []).slice(0, 4).map((session) => (
            <div key={session.id} className="rounded-lg bg-white/5 p-2 text-sm text-white">
              {session.status} - {new Date(session.startedAt).toLocaleString()}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-sm text-[var(--muted)]">Publicar en mi perfil</p>
        <form className="mt-3 space-y-2" onSubmit={onCreatePersonalPost}>
          <textarea
            value={postForm.content}
            onChange={(event) => setPostForm((prev) => ({ ...prev, content: event.target.value }))}
            className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
            placeholder="Comparte tu avance personal..."
            rows={3}
          />
          <div className="grid gap-2 md:grid-cols-2">
            <input
              value={postForm.mediaUrl}
              onChange={(event) => setPostForm((prev) => ({ ...prev, mediaUrl: event.target.value }))}
              className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
              placeholder="URL de imagen (opcional)"
            />
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white hover:bg-white/10">
              <Upload className="h-4 w-4 text-[var(--primary)]" />
              Subir imagen
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () =>
                    setPostForm((prev) => ({ ...prev, mediaUrl: String(reader.result ?? "") }));
                  reader.readAsDataURL(file);
                }}
              />
            </label>
          </div>
          <label className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white">
            <input
              type="checkbox"
              checked={postForm.alsoShareInSocial}
              onChange={(event) =>
                setPostForm((prev) => ({ ...prev, alsoShareInSocial: event.target.checked }))
              }
            />
            También publicar en el Área social
          </label>
          {postForm.mediaUrl ? (
            <div className="overflow-hidden rounded-lg border border-[var(--border)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={postForm.mediaUrl} alt="preview publicación" className="h-36 w-full object-cover" />
            </div>
          ) : null}
          <Button
            type="submit"
            size="sm"
            className="w-full"
            loading={createPost.isPending || createProfileMediaPost.isPending}
          >
            <Send className="h-4 w-4" />
            Publicar
          </Button>
        </form>
      </Card>

      <Card>
        <p className="text-sm text-[var(--muted)]">Actividad social reciente</p>
        <div className="mt-3 flex items-center gap-2">
          <Button
            size="sm"
            variant={activeSocialTab === "own" ? "secondary" : "ghost"}
            onClick={() => setActiveSocialTab("own")}
          >
            Mis publicaciones
          </Button>
          <Button
            size="sm"
            variant={activeSocialTab === "liked" ? "secondary" : "ghost"}
            onClick={() => setActiveSocialTab("liked")}
          >
            Me gusta
          </Button>
        </div>
        <div className="mt-3 space-y-2">
          {(activeSocialTab === "own" ? ownContent : likedPosts).slice(0, 6).map((post) => (
            <article key={post.id} className="overflow-hidden rounded-lg border border-[var(--border)] bg-white/5">
              {post.mediaUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.mediaUrl} alt="media publicación" className="h-36 w-full object-cover" />
              ) : null}
              <div className="p-2">
                <p className="text-sm text-white">{post.content}</p>
              </div>
            </article>
          ))}
          {(activeSocialTab === "own" ? ownContent : likedPosts).length === 0 ? (
            <p className="rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-[var(--muted)]">
              {activeSocialTab === "own"
                ? "Aún no has publicado contenido en tu perfil."
                : "Aún no tienes publicaciones marcadas con me gusta."}
            </p>
          ) : null}
        </div>
      </Card>

      <div className="lg:col-span-3">
        <ProfileFlow />
      </div>

      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
            <DialogDescription>Personaliza tu información visible y tu imagen de perfil.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <input
              value={draftProfile.name}
              onChange={(event) => setDraftProfile((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
              placeholder="Nombre"
            />
            <input
              value={draftProfile.email}
              onChange={(event) => setDraftProfile((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
              placeholder="Email"
            />
            <textarea
              value={draftProfile.bio}
              onChange={(event) => setDraftProfile((prev) => ({ ...prev, bio: event.target.value }))}
              className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
              placeholder="Bio"
              rows={3}
            />
            <input
              value={draftProfile.avatarUrl}
              onChange={(event) =>
                setDraftProfile((prev) => ({ ...prev, avatarUrl: event.target.value }))
              }
              className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
              placeholder="URL de imagen de perfil"
            />
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white">
              <Camera className="h-4 w-4 text-[var(--muted)]" />
              Subir imagen desde dispositivo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () =>
                    setDraftProfile((prev) => ({ ...prev, avatarUrl: String(reader.result ?? "") }));
                  reader.readAsDataURL(file);
                }}
              />
            </label>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setDraftProfile(profile);
                setIsEditingProfile(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setProfile(draftProfile);
                setIsEditingProfile(false);
                toast.success("Perfil actualizado");
              }}
            >
              Guardar cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
