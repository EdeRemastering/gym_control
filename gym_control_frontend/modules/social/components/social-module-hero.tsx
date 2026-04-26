"use client";

import { Compass, SendHorizontal, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

type SocialModuleHeroProps = {
  socialView: "feed" | "explorar";
  setSocialView: (value: "feed" | "explorar") => void;
  currentGymName: string;
  currentUserId?: string;
  role: string;
  profileBio: string;
  isBioExpanded: boolean;
  setIsBioExpanded: (updater: (prev: boolean) => boolean) => void;
  setProfileBio: (updater: (prev: string) => string) => void;
  bannerMemberCount: number;
  bannerOnlineCount: number;
  visibleFeedPostsCount: number;
  onFocusComposer: () => void;
};

export function SocialModuleHero({
  socialView,
  setSocialView,
  currentGymName,
  currentUserId,
  role,
  profileBio,
  isBioExpanded,
  setIsBioExpanded,
  setProfileBio,
  bannerMemberCount,
  bannerOnlineCount,
  visibleFeedPostsCount,
  onFocusComposer,
}: SocialModuleHeroProps) {
  return (
    <section className="social-panel-hero">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-2xl font-bold text-background">
            {socialView === "feed" ? currentGymName.slice(0, 2).toUpperCase() : "GL"}
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.14em] text-secondary/85">Perfil social</p>
            <h3 className="truncate text-2xl font-semibold leading-tight text-foreground">
              {currentUserId ? `@${currentUserId.slice(0, 18)}` : "Atleta Zudel OS"}
            </h3>
            <p className="mt-1 text-sm text-muted">Comunidad {socialView === "feed" ? currentGymName : "Global"} · rol {role}</p>
            <div className="mt-2 rounded-lg border border-white/[0.08] bg-black/20 px-2.5 py-2">
              <p className={`text-xs text-white/80 ${isBioExpanded ? "" : "line-clamp-2"}`}>{profileBio}</p>
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  className="text-[11px] font-medium text-secondary/90 transition hover:text-secondary"
                  onClick={() => setIsBioExpanded((prev) => !prev)}
                >
                  {isBioExpanded ? "Ver menos" : "Ver bio completa"}
                </button>
                <button
                  type="button"
                  className="text-[11px] font-medium text-white/70 transition hover:text-white"
                  onClick={() =>
                    setProfileBio((prev) =>
                      prev === "Atleta enfocado en fuerza, constancia y nutricion inteligente."
                        ? "Comparto entrenamientos, avances y recetas para mantener motivada a la comunidad."
                        : "Atleta enfocado en fuerza, constancia y nutricion inteligente.",
                    )
                  }
                >
                  Editar bio rapida
                </button>
              </div>
            </div>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={onFocusComposer}
          className="h-10 rounded-full bg-secondary px-5 text-background shadow-[0_0_22px_color-mix(in_srgb,var(--secondary)_36%,transparent)] hover:opacity-90"
        >
          <SendHorizontal className="h-4 w-4" />
          Publicar ahora
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="social-chip inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-secondary" />
          {bannerMemberCount} miembros
        </span>
        <span className="social-chip inline-flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-secondary" />
          {bannerOnlineCount} online
        </span>
        <span className="social-chip">{socialView === "feed" ? "Modo local" : "Modo global"}</span>
        <span className="social-chip">{visibleFeedPostsCount} publicaciones</span>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-background/40 p-1">
        <Button
          type="button"
          size="sm"
          variant={socialView === "feed" ? "secondary" : "ghost"}
          className="rounded-lg px-3"
          onClick={() => setSocialView("feed")}
        >
          Feed
        </Button>
        <Button
          type="button"
          size="sm"
          variant={socialView === "explorar" ? "secondary" : "ghost"}
          className="rounded-lg px-3"
          onClick={() => setSocialView("explorar")}
        >
          <Compass className="h-4 w-4" />
          Explorar
        </Button>
      </div>
    </section>
  );
}

