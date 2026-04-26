"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Command, LogOut, Plus, Search, Sparkles, Trophy } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnalyticsModule } from "@/modules/analytics/components/analytics-module";
import { BillingModule } from "@/modules/billing/components/billing-module";
import { DashboardModule } from "@/modules/dashboard/components/dashboard-module";
import { SchedulingModule } from "@/modules/scheduling/components/scheduling-module";
import { TrainingModule } from "@/modules/training/components/training-module";
import { UsersModule } from "@/modules/users/components/users-module";
import { ProfileModule } from "@/modules/profile/components/profile-module";
import { SocialModule } from "@/modules/social/components/social-module";
import { NotificationsModule } from "@/modules/notifications/components/notifications-module";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Role } from "@/lib/types";
import type { ModuleShellProps } from "@/lib/module-shell-props";
import { useSessionStore } from "@/lib/session-store";
import { moduleIcons } from "@/lib/module-icons";
import { moduleLabels, roleModules, type ModuleKey } from "@/lib/navigation";
import { UX_THEME_LABELS } from "@/lib/ux-copy-dictionary";
import { useProfileNavStore } from "@/lib/profile-nav-store";
import { useThemeStore, type ThemeMode } from "@/lib/theme-store";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ZudelOsShell() {
  const router = useRouter();
  const role = useSessionStore((state) => state.role);
  const user = useSessionStore((state) => state.user);
  const setRole = useSessionStore((state) => state.setSession);
  const clearSession = useSessionStore((state) => state.clearSession);
  const [activeModule, setActiveModule] = useState<ModuleKey>("dashboard");
  const [commandOpen, setCommandOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const prevModuleRef = useRef<ModuleKey>(activeModule);
  const mobileModuleNavRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useBreakpoint();

  const allowedModules = useMemo(() => roleModules[role], [role]);
  const requestProfileFocus = useProfileNavStore((state) => state.requestProfileFocus);
  const clearProfileFocus = useProfileNavStore((state) => state.clearProfileFocus);
  const themeMode = useThemeStore((state) => state.mode);
  const setThemeMode = useThemeStore((state) => state.setMode);

  const CurrentModule = {
    dashboard: DashboardModule,
    billing: BillingModule,
    training: TrainingModule,
    scheduling: SchedulingModule,
    users: UsersModule,
    analytics: AnalyticsModule,
    profile: ProfileModule,
    social: SocialModule,
    notifications: NotificationsModule,
  }[activeModule];

  const quickActions = [
    { label: "Crear clase", module: "scheduling" as ModuleKey },
    { label: "Registrar pago", module: "billing" as ModuleKey },
    { label: "Iniciar entrenamiento", module: "training" as ModuleKey },
    { label: "Registrar cliente", module: "users" as ModuleKey },
    { label: "Publicar en comunidad", module: "social" as ModuleKey },
    { label: "Ver notificaciones", module: "notifications" as ModuleKey },
  ];

  const filteredActions = quickActions.filter((action) =>
    action.label.toLowerCase().includes(commandQuery.toLowerCase()),
  );

  const themeOptions: Array<{ value: ThemeMode; label: string }> = [
    { value: "system", label: UX_THEME_LABELS.system },
    { value: "neon-dark", label: UX_THEME_LABELS["neon-dark"] },
    { value: "light", label: UX_THEME_LABELS.light },
    { value: "dark-soft", label: UX_THEME_LABELS["dark-soft"] },
    { value: "high-contrast", label: UX_THEME_LABELS["high-contrast"] },
  ];

  function runAction(module: ModuleKey) {
    setActiveModule(module);
    setCommandOpen(false);
    setQuickOpen(false);
  }

  const onOpenMemberProfile = useCallback(
    (userId: string) => {
      requestProfileFocus(userId);
      if (allowedModules.includes("profile")) {
        setActiveModule("profile");
      }
    },
    [allowedModules, requestProfileFocus],
  );

  const moduleShellProps: ModuleShellProps = useMemo(
    () => ({ role, onOpenMemberProfile }),
    [role, onOpenMemberProfile],
  );

  useEffect(() => {
    if (prevModuleRef.current === "profile" && activeModule !== "profile") {
      clearProfileFocus();
    }
    prevModuleRef.current = activeModule;
  }, [activeModule, clearProfileFocus]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((prev) => !prev);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "j") {
        event.preventDefault();
        setQuickOpen((prev) => !prev);
      }
      if (event.key === "Escape") {
        setCommandOpen(false);
        setQuickOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const root = mobileModuleNavRef.current;
    if (!root) return;
    const btn = root.querySelector<HTMLElement>(`[data-module-nav="${activeModule}"]`);
    btn?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeModule, allowedModules, isMobile]);

  return (
    <div className="app-shell-padding mx-auto flex min-h-screen w-full max-w-[1680px] gap-3">
      <aside className="hidden min-h-[92vh] w-[238px] shrink-0 flex-col gap-3 md:flex">
        <Card className="sticky top-4 flex h-[calc(100vh-2.5rem)] flex-col gap-2.5 rounded-2xl border-[color:color-mix(in_srgb,var(--border)_70%,transparent)] bg-[linear-gradient(180deg,#030917_0%,#020611_100%)] p-3">
          <div className="flex items-center gap-2.5">
            <div className="overflow-hidden rounded-lg border border-white/15 shadow-[0_0_22px_rgba(34,211,238,0.3)]">
              <Image
                src="/zudel_icon.png"
                alt="Zudel OS icon"
                width={34}
                height={34}
                className="h-[34px] w-[34px] object-cover"
                priority
              />
            </div>
            <p className="text-sm font-semibold tracking-wide text-transparent bg-gradient-to-r from-cyan-300 to-fuchsia-400 bg-clip-text">
              ZUDEL OS
            </p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">Menú principal</p>
          </div>

          <div className="space-y-0.5">
            {allowedModules.map((moduleKey) => {
              const Icon = moduleIcons[moduleKey];
              const isActive = moduleKey === activeModule;
              return (
                <button
                  key={moduleKey}
                  type="button"
                  className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[14px] transition ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/35 to-emerald-400/25 text-white shadow-[0_0_22px_rgba(20,184,166,0.22)]"
                      : "text-white/85 hover:bg-white/8 hover:text-white"
                  }`}
                  onClick={() => setActiveModule(moduleKey)}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="flex-1 truncate">{moduleLabels[moduleKey]}</span>
                  {moduleKey === "notifications" ? (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                      3
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(22,12,54,0.62)_0%,rgba(8,18,44,0.64)_100%)] p-1.5">
            <div className="mb-1.5 flex h-12 items-center justify-center rounded-lg border border-white/10 bg-[radial-gradient(circle_at_50%_35%,rgba(168,85,247,0.35),transparent_55%)]">
              <Trophy className="h-6 w-6 text-violet-300/90 drop-shadow-[0_0_6px_rgba(168,85,247,0.65)]" />
            </div>
            <p className="text-[10px] uppercase tracking-wide text-white/70">Reto</p>
            <p className="mt-0.5 text-sm font-semibold leading-tight text-white">7 días seguidos</p>
            <p className="mt-0.5 text-[10px] text-white/60">Entrena 7 días y gana una medalla</p>
            <p className="mt-1.5 text-[10px] font-medium text-white">4/7 días</p>
            <div className="mt-1.5 h-1.5 rounded-full bg-white/10">
              <div className="h-full w-[57%] rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400" />
            </div>
          </div>

          <div className="mt-auto min-h-0 border-t border-[var(--border)] pt-2.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex w-full min-w-0 items-center gap-2 overflow-hidden rounded-xl border border-[var(--border)] bg-black/20 p-2 text-left transition hover:border-white/25 hover:bg-white/5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/20 text-sm font-semibold text-white">
                    {(user?.name ?? "GC").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="truncate text-sm font-semibold leading-tight text-white">{user?.name ?? "Admin Downtown"}</p>
                    <p className="truncate text-[10px] uppercase tracking-wide text-emerald-300">{role}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem
                  onClick={() => {
                    const nextRole: Role = role === "ADMIN" ? "TRAINER" : role === "TRAINER" ? "CLIENT" : "ADMIN";
                    if (!user) return;
                    setRole({
                      accessToken: useSessionStore.getState().accessToken ?? "",
                      refreshToken: useSessionStore.getState().refreshToken ?? "",
                      user,
                      role: nextRole,
                    });
                    setActiveModule(roleModules[nextRole][0]);
                  }}
                >
                  Cambiar rol
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-rose-300 focus:bg-rose-500/15 focus:text-rose-200"
                  onClick={() => {
                    clearSession();
                    router.push("/login");
                  }}
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      </aside>

      <section className="flex min-h-[92vh] min-w-0 flex-1 flex-col gap-3 md:gap-3">
        <Card className="sticky top-4 z-30 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(7,14,32,0.95),rgba(5,10,24,0.95))] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
              {activeModule === "social" ? "Comunidad" : "Zudel OS"}
            </p>
            <h1 className="truncate text-xl font-semibold text-white">{moduleLabels[activeModule]}</h1>
            <p className="mt-1 max-w-[65ch] text-xs text-[var(--muted)]">
              {activeModule === "social"
                ? "Comparte tu progreso y conecta con tu comunidad."
                : activeModule === "analytics"
                  ? "Interpreta, predice y ejecuta: inteligencia operativa en un solo lugar."
                  : "Paso recomendado: usa una acción rápida para empezar en menos clics."}
            </p>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Select value={themeMode} onValueChange={(value) => setThemeMode(value as ThemeMode)}>
              <SelectTrigger className="h-10 w-full sm:w-auto sm:min-w-[150px] md:min-w-[170px]">
                <SelectValue placeholder="Tema" />
              </SelectTrigger>
              <SelectContent>
                {themeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              size="sm"
              className="hidden sm:inline-flex"
              onClick={() => setCommandOpen((prev) => !prev)}
            >
              <Search className="h-4 w-4" />
              Buscar
              <span className="hidden rounded bg-white/10 px-1.5 py-0.5 text-[10px] lg:inline">Ctrl + K</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="hidden sm:inline-flex"
              onClick={() => setQuickOpen((prev) => !prev)}
            >
              <Sparkles className="h-4 w-4" />
              Acciones frecuentes
            </Button>
          </div>
        </Card>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${role}-${activeModule}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="flex-1"
          >
            <CurrentModule {...moduleShellProps} />
          </motion.div>
        </AnimatePresence>
      </section>

      {quickOpen ? (
        <div className="fixed inset-0 z-40 hidden bg-black/50 xl:block" onClick={() => setQuickOpen(false)} />
      ) : null}

      <AnimatePresence>
        {quickOpen ? (
          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.2 }}
            className="fixed right-6 top-6 z-50 hidden w-80 xl:flex"
          >
            <Card className="w-full space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Acciones frecuentes</p>
              <Button variant="ghost" size="sm" onClick={() => setQuickOpen(false)}>
                Cerrar
              </Button>
            </div>
            <p className="text-xs text-[var(--muted)]">Elige una para continuar sin navegar por menús.</p>
            {quickActions.map((action) => (
              <button
                key={action.label}
                className="flex w-full items-center gap-2 rounded-xl border border-transparent bg-white/5 px-3 py-2 text-left text-sm text-white transition hover:border-[var(--border)] hover:bg-white/10"
                onClick={() => runAction(action.module)}
              >
                <Command className="h-4 w-4 text-[var(--primary)]" />
                {action.label}
              </button>
            ))}
            <Button
              variant="ghost"
              onClick={() => {
                clearSession();
                router.push("/login");
              }}
            >
              Cerrar sesión
            </Button>
            </Card>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      {commandOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-start justify-center bg-black/60 p-6 pt-24 backdrop-blur-sm"
          onClick={() => setCommandOpen(false)}
        >
          <Card className="w-full max-w-2xl">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
              <p className="text-sm text-white">Buscador rápido</p>
              <p className="text-xs text-[var(--muted)]">
                Escribe lo que quieres hacer y presiona Enter.
              </p>
              <label className="mt-3 block text-xs text-[var(--muted)]">Buscar tarea</label>
              <input
                value={commandQuery}
                onChange={(event) => setCommandQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && filteredActions.length > 0) {
                    event.preventDefault();
                    runAction(filteredActions[0].module);
                  }
                  if (event.key === "Escape") {
                    setCommandOpen(false);
                  }
                }}
                placeholder="Ej: registrar pago"
                className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white outline-none"
              />
              <div className="mt-3 grid gap-2">
                {filteredActions.map((action) => (
                  <button
                    key={`cmd-${action.label}`}
                    className="rounded-lg border border-[var(--border)] bg-white/5 p-2 text-left text-sm text-white hover:bg-white/10"
                    onClick={() => runAction(action.module)}
                  >
                    {action.label}
                  </button>
                ))}
                {filteredActions.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-[var(--border)] bg-white/5 p-3 text-xs text-[var(--muted)]">
                    No encontramos resultados con ese texto. Prueba con pago, entrenamiento o cliente.
                  </p>
                ) : null}
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      <nav
        className="fixed bottom-[calc(0.5rem+env(safe-area-inset-bottom))] left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-lg -translate-x-1/2 md:hidden"
        aria-label="Módulos del gimnasio"
      >
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <div
            ref={mobileModuleNavRef}
            className="flex snap-x snap-mandatory gap-1.5 overflow-x-auto overscroll-x-contain px-2 py-2 touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {allowedModules.map((moduleKey) => {
              const Icon = moduleIcons[moduleKey];
              const active = activeModule === moduleKey;
              return (
                <button
                  key={`mobile-nav-${moduleKey}`}
                  type="button"
                  data-module-nav={moduleKey}
                  title={moduleLabels[moduleKey]}
                  aria-label={moduleLabels[moduleKey]}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-11 w-11 shrink-0 snap-center items-center justify-center rounded-xl transition-colors ${
                    active ? "bg-[var(--primary)] text-white" : "text-[var(--muted)] hover:bg-white/5 hover:text-white"
                  }`}
                  onClick={() => setActiveModule(moduleKey)}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </button>
              );
            })}
          </div>
        </div>
        {allowedModules.length > 5 ? (
          <p className="mt-1.5 text-center text-[10px] uppercase tracking-wider text-[var(--muted)]">
            Desliza para ver todos los módulos
          </p>
        ) : null}
      </nav>

      <button
        className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 rounded-full bg-[var(--primary)] p-3 text-white shadow-lg md:hidden"
        onClick={() => setQuickOpen((prev) => !prev)}
      >
        <Plus className="h-5 w-5" />
      </button>

      {quickOpen ? (
        <div className="fixed inset-0 z-40 bg-black/50 p-4 md:hidden" onClick={() => setQuickOpen(false)}>
          <Card className="mx-auto mt-24 max-w-sm space-y-2">
            <p className="text-xs text-[var(--muted)]">Selecciona una acción para continuar.</p>
            {quickActions.map((action) => (
              <button
                key={`fab-${action.label}`}
                className="w-full rounded-lg bg-white/5 p-2 text-left text-sm text-white"
                onClick={() => runAction(action.module)}
              >
                {action.label}
              </button>
            ))}
          </Card>
        </div>
      ) : null}
    </div>
  );
}
